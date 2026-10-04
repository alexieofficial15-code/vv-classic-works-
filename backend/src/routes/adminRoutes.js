import express from 'express';
import jwt from 'jsonwebtoken';
import { dbService } from '../config/supabase.js';
import { JWT_SECRET } from '../config/secrets.js';

const router = express.Router();

// Admin Auth Middleware - Strict JWT Verification only
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userRole = (decoded.role || '').toUpperCase();
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
  }
};

// --- SPARE PARTS CRUD ---

// 1. GET ALL PARTS (Public)
router.get('/admin/parts', async (req, res) => {
  try {
    const parts = await dbService.getParts();
    res.json({ success: true, data: parts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. ADD NEW PART / POST (Admin Protected)
router.post('/admin/parts', authenticateAdmin, async (req, res) => {
  try {
    const newPart = await dbService.addPart(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Spare part post created successfully!', 
      data: newPart 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. UPDATE PART / PUT (Admin Protected)
router.put('/admin/parts/:id', authenticateAdmin, async (req, res) => {
  try {
    const updated = await dbService.updatePart(req.params.id, req.body);
    res.json({ 
      success: true, 
      message: 'Part updated successfully!', 
      data: updated 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. DELETE PART / DELETE (Admin Protected)
router.delete('/admin/parts/:id', authenticateAdmin, async (req, res) => {
  try {
    await dbService.deletePart(req.params.id);
    res.json({ 
      success: true, 
      message: `Part ${req.params.id} deleted successfully!` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- VINTAGE CARS CRUD ---

// 5. GET ALL CARS (Public)
router.get('/admin/cars', async (req, res) => {
  try {
    const cars = await dbService.getCars();
    res.json({ success: true, data: cars });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. ADD NEW CAR MODEL (Admin Protected)
router.post('/admin/cars', authenticateAdmin, async (req, res) => {
  try {
    const newCar = await dbService.addCar(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Vintage car model added successfully!', 
      data: newCar 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. DELETE CAR MODEL (Admin Protected)
router.delete('/admin/cars/:id', authenticateAdmin, async (req, res) => {
  try {
    await dbService.deleteCar(req.params.id);
    res.json({ 
      success: true, 
      message: `Vintage car ${req.params.id} deleted successfully!` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
