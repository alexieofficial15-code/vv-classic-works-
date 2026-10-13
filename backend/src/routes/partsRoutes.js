import express from 'express';
import crypto from 'crypto';
import { dbService, supabase, isSupabaseConfigured, mapPartFromDb } from '../config/supabase.js';
import { ENGINE_HOTSPOTS, YOUTUBE_SHOWCASE } from '../data/db.js';
import { getOrLoadImage } from '../services/imageCache.js';

const router = express.Router();

// Helper to replace large inline base64 images with lightweight API URLs and ensure price/stock exist
export function transformPartForCatalog(part) {
  if (!part) return part;
  const p = { ...part };

  // Guarantee clean price and stock fields for Google Merchant Center & Catalog Cards
  p.price = typeof p.price === 'number' && !isNaN(p.price) ? p.price : (parseFloat(p.price) || 0);
  p.stock = (p.stock !== undefined && p.stock !== null && !isNaN(parseInt(p.stock, 10))) ? parseInt(p.stock, 10) : 0;
  p.inStock = Boolean(p.inStock ?? p.in_stock ?? true);

  if (typeof p.image === 'string' && p.image.startsWith('data:')) {
    p.image = `/api/parts/${p.id}/image/main`;
  }

  if (Array.isArray(p.additionalImages)) {
    p.additionalImages = p.additionalImages.map((img, idx) => {
      if (typeof img === 'string' && img.startsWith('data:')) {
        return `/api/parts/${p.id}/image/a${idx}`;
      }
      return img;
    });
  }

  if (typeof p.thumbnailUrl === 'string' && p.thumbnailUrl.startsWith('data:')) {
    p.thumbnailUrl = `/api/parts/${p.id}/image/main`;
  }

  return p;
}

// GET /api/catalog - Full Catalog with image URLs (Gzip, ETag, In-Memory Cached)
router.get('/catalog', async (req, res) => {
  try {
    const rawParts = await dbService.getPartsLite();
    const catalogParts = rawParts.map(transformPartForCatalog);
    const bodyStr = JSON.stringify({
      success: true,
      count: catalogParts.length,
      data: catalogParts
    });

    const etag = `"${crypto.createHash('md5').update(bodyStr).digest('hex')}"`;

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.set('ETag', etag);

    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch) {
      const cleanMatch = ifNoneMatch.replace(/^W\//, '');
      if (cleanMatch === etag || ifNoneMatch === etag) {
        return res.status(304).end();
      }
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(bodyStr);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reads one photo for (id, key) from the database and turns it into something servable.
// Runs at most once per photo per cache lifetime (see services/imageCache.js).
async function loadPartImage(id, key) {
  const partImg = await dbService.getPartImage(id, key);
  if (!partImg) return { type: 'missing' };

  let imageStr = null;
  if (key === 'main') {
    imageStr = partImg.image;
  } else {
    // Extra photos live in specifications.__meta.additionalImages
    const rawSpecs = Array.isArray(partImg.specifications) ? partImg.specifications : [];
    let meta = {};
    for (const s of rawSpecs) {
      if (s && s.key === '__meta') {
        try {
          meta = typeof s.value === 'string' ? JSON.parse(s.value) : s.value;
        } catch (_) {}
      }
    }
    const addImages = Array.isArray(meta.additionalImages) ? meta.additionalImages : [];
    const idx = parseInt(key.replace(/^a/, ''), 10);
    imageStr = !isNaN(idx) ? addImages[idx] : null;
  }

  if (!imageStr || typeof imageStr !== 'string') return { type: 'missing' };

  // External URL: just redirect
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) {
    return { type: 'redirect', url: imageStr };
  }

  // Inline base64 data URI: decode once
  if (imageStr.startsWith('data:')) {
    const commaIdx = imageStr.indexOf(',');
    if (commaIdx === -1) return { type: 'missing' };

    const header = imageStr.slice(0, commaIdx);
    const mimeMatch = header.match(/^data:([^;]+)/);
    let mimeType = mimeMatch ? mimeMatch[1].toLowerCase().trim() : 'image/jpeg';
    if (mimeType === 'image/jpg') mimeType = 'image/jpeg';

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedMimes.includes(mimeType)) return { type: 'missing' };

    return { type: 'image', mime: mimeType, buffer: Buffer.from(imageStr.slice(commaIdx + 1), 'base64') };
  }

  return { type: 'missing' };
}

// GET /api/parts/:id/image/:key - Serves a part photo (memory-cached, ETag/304 aware)
router.get('/parts/:id/image/:key', async (req, res) => {
  try {
    const { id } = req.params;
    let key = req.params.key;

    // Only accept the photo keys the site actually uses; anything else cannot exist
    if (!/^(main|thumb|a?\d{1,3})$/.test(key) || id.length > 120) {
      return res.status(404).send('Image not found');
    }
    // "thumb" and "main" are the same photo, "3" means "a3": share one cache entry
    if (key === 'thumb') key = 'main';
    if (/^\d+$/.test(key)) key = `a${key}`;

    if (!isSupabaseConfigured) {
      return res.status(404).send('Image not found');
    }

    const entry = await getOrLoadImage(`${id}:${key}`, () => loadPartImage(id, key));

    if (entry.type === 'missing') {
      return res.status(404).send('Image not found');
    }

    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

    if (entry.type === 'redirect') {
      return res.redirect(302, entry.url);
    }

    res.set('ETag', entry.etag);
    if (req.headers['if-none-match'] === entry.etag) {
      return res.status(304).end();
    }
    res.set('Content-Type', entry.mime);
    return res.send(entry.buffer);
  } catch (err) {
    console.error('Error serving part image:', err.message);
    res.status(500).send('Error serving image');
  }
});

// GET /api/parts - Search & filter spare parts (Lightweight List, Guest Accessible)
router.get('/parts', async (req, res) => {
  try {
    const { search, era, category, carModelId, sortBy } = req.query;
    let partsList = await dbService.getPartsLite();
    let results = [...partsList];

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.oemNumber && p.oemNumber.toLowerCase().includes(q)) ||
        (p.carModelName && p.carModelName.toLowerCase().includes(q)) ||
        (p.castingCode && p.castingCode.toLowerCase().includes(q))
      );
    }

    if (era && era !== 'ALL') {
      results = results.filter(p => p.era === era);
    }

    if (category && category !== 'ALL') {
      results = results.filter(p => p.category === category);
    }

    if (carModelId && carModelId !== 'ALL') {
      results = results.filter(p => p.carModelId === carModelId);
    }

    if (sortBy === 'PRICE_LOW') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PRICE_HIGH') {
      results.sort((a, b) => b.price - a.price);
    }

    // Map to lightweight summary (stripping large base64 image strings to eliminate 25MB payload)
    const lightweightParts = results.map(p => {
      let thumbnailUrl = null;
      if (p.thumbnailUrl) {
        thumbnailUrl = p.thumbnailUrl;
      } else if (p.image && !p.image.startsWith('data:')) {
        thumbnailUrl = p.image;
      } else {
        thumbnailUrl = '/pictures/sample_restoration_photo.jpg';
      }

      return {
        id: p.id,
        title: p.title,
        price: p.price,
        category: p.category,
        systemCategory: p.systemCategory || p.partSystem || p.category,
        partSubcategory: p.partSubcategory || p.specificPartCategory || p.subcatId,
        carModelId: p.carModelId,
        carModelName: p.carModelName,
        era: p.era,
        engineSize: p.engineSize,
        oemNumber: p.oemNumber,
        castingCode: p.castingCode,
        inStock: p.inStock,
        stockCount: p.stockCount,
        image: thumbnailUrl,
        thumbnailUrl
      };
    });

    res.json({
      success: true,
      count: lightweightParts.length,
      data: lightweightParts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/parts/:id - Get full part details with high-res images & specs for modal
router.get('/parts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let part = null;

    if (isSupabaseConfigured) {
      part = await dbService.getPartById(id);
    }

    // Fallback: resolve "<id>-<slug>" style ids against the cached LITE list.
    // Never fall back to getParts() here (full rows incl. base64 photos) or random ids could hammer the database.
    if (!part) {
      const partsList = await dbService.getPartsLite();
      const match = partsList.find(p => String(p.id) === String(id) || String(id).startsWith(`${p.id}-`));
      if (match && String(match.id) !== String(id) && isSupabaseConfigured) {
        part = await dbService.getPartById(match.id);
      }
      part = part || match || null;
    }

    if (!part) {
      return res.status(404).json({ success: false, message: 'Spare part not found' });
    }

    // Replace inline base64 photos with cacheable /api/parts/:id/image/... URLs
    res.json({ success: true, data: transformPartForCatalog(part) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/cars - List all vintage car models
router.get('/cars', async (req, res) => {
  try {
    const carsList = await dbService.getCars();
    res.json({ success: true, count: carsList.length, data: carsList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotspots - Engine diagram hotspot pins
router.get('/hotspots', (req, res) => {
  res.json({ success: true, data: ENGINE_HOTSPOTS });
});

// GET /api/videos - YouTube Workshop Video Showcase Playlist
router.get('/videos', (req, res) => {
  res.json({ success: true, data: YOUTUBE_SHOWCASE });
});

export default router;
