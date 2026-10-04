import express from 'express';
import crypto from 'crypto';
import { dbService, supabase, isSupabaseConfigured, mapPartFromDb } from '../config/supabase.js';
import { ENGINE_HOTSPOTS, YOUTUBE_SHOWCASE } from '../data/db.js';

const router = express.Router();

// Helper to replace large inline base64 images with lightweight API URLs
export function transformPartForCatalog(part) {
  if (!part) return part;
  const p = { ...part };

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
    const rawParts = await dbService.getParts();
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

// GET /api/parts/:id/image/:key - Decodes stored base64 and serves real image
router.get('/parts/:id/image/:key', async (req, res) => {
  try {
    const { id, key } = req.params;
    const partsList = await dbService.getParts();
    const part = partsList.find(p => String(p.id) === String(id));

    if (!part) {
      return res.status(404).send('Part not found');
    }

    let imageStr = null;
    if (key === 'main' || key === 'thumb') {
      imageStr = part.image;
    } else if (key.startsWith('a')) {
      const idx = parseInt(key.slice(1), 10);
      if (Array.isArray(part.additionalImages) && !isNaN(idx) && part.additionalImages[idx]) {
        imageStr = part.additionalImages[idx];
      } else {
        imageStr = part.image;
      }
    } else if (!isNaN(parseInt(key, 10))) {
      const idx = parseInt(key, 10);
      if (Array.isArray(part.additionalImages) && part.additionalImages[idx]) {
        imageStr = part.additionalImages[idx];
      } else {
        imageStr = part.image;
      }
    } else {
      imageStr = part.image;
    }

    if (!imageStr || typeof imageStr !== 'string') {
      return res.status(404).send('Image not found');
    }

    // Redirect if it is an external HTTP URL
    if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) {
      return res.redirect(302, imageStr);
    }

    // Decode inline base64 data URI
    if (imageStr.startsWith('data:')) {
      const commaIdx = imageStr.indexOf(',');
      if (commaIdx === -1) {
        return res.status(404).send('Invalid data URI');
      }

      const header = imageStr.slice(0, commaIdx);
      const base64Data = imageStr.slice(commaIdx + 1);

      const mimeMatch = header.match(/^data:([^;]+)/);
      let mimeType = mimeMatch ? mimeMatch[1].toLowerCase().trim() : 'image/jpeg';
      if (mimeType === 'image/jpg') mimeType = 'image/jpeg';

      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
      if (!allowedMimes.includes(mimeType)) {
        return res.status(404).send('Unsupported image format');
      }

      const imageBuffer = Buffer.from(base64Data, 'base64');
      res.set('Content-Type', mimeType);
      res.set('Cache-Control', 'public, max-age=86400, immutable');
      return res.send(imageBuffer);
    }

    return res.status(404).send('Image format not supported');
  } catch (err) {
    console.error('Error serving part image:', err);
    res.status(500).send('Error serving image');
  }
});

// GET /api/parts - Search & filter spare parts (Lightweight List, Guest Accessible)
router.get('/parts', async (req, res) => {
  try {
    const { search, era, category, carModelId, sortBy } = req.query;
    let partsList = await dbService.getParts();
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
      const { data, error } = await supabase
        .from('spare_parts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        part = mapPartFromDb(data);
      }
    }

    // Fallback search across list if not found or Supabase not directly queried
    if (!part) {
      const partsList = await dbService.getParts();
      part = partsList.find(p => String(p.id) === String(id));
    }

    if (!part) {
      return res.status(404).json({ success: false, message: 'Spare part not found' });
    }

    res.json({ success: true, data: part });
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
