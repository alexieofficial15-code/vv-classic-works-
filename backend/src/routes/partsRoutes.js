import express from 'express';
import { dbService, supabase, isSupabaseConfigured, mapPartFromDb } from '../config/supabase.js';
import { ENGINE_HOTSPOTS, YOUTUBE_SHOWCASE } from '../data/db.js';

const router = express.Router();

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
