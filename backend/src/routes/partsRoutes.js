import express from 'express';
import { dbService } from '../config/supabase.js';
import { ENGINE_HOTSPOTS, YOUTUBE_SHOWCASE } from '../data/db.js';

const router = express.Router();

// GET /api/parts - Search & filter spare parts (Guest Accessible)
router.get('/parts', async (req, res) => {
  try {
    const { search, era, category, carModelId, sortBy } = req.query;
    let partsList = await dbService.getParts();
    let results = [...partsList];

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(p =>
        p.title.toLowerCase().includes(q) ||
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

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/parts/:id
router.get('/parts/:id', async (req, res) => {
  try {
    const partsList = await dbService.getParts();
    const part = partsList.find(p => p.id === req.params.id);
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
