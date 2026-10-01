import express from 'express';
import jwt from 'jsonwebtoken';
import { dbService } from '../config/supabase.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vintage_secret';

// Optional Auth middleware for placing orders (Allows both Guests and Registered Users)
const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }
  next();
};

// Strict auth for viewing private orders
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Login required to view account orders' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token, please sign in again' });
  }
};

// POST /api/orders - Place a vintage parts order (Guest + Member Checkout)
router.post('/orders', optionalAuthenticate, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, userName, userEmail, userPhone, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    const isGuest = !req.user;
    const finalUserId = req.user?.id || `guest-${Date.now()}`;
    const finalUserName = req.user?.name || userName || 'Guest Restorer';
    const finalUserEmail = req.user?.email || userEmail || 'guest@aircooledworks.com';

    const orderInput = {
      id: `ORD-VINTAGE-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: finalUserId,
      userName: finalUserName,
      userEmail: finalUserEmail,
      userPhone: userPhone || req.user?.phone || '',
      items,
      totalAmount: parseFloat(totalAmount) || 0,
      shippingAddress: shippingAddress || 'Workshop Pickup / Direct Delivery',
      notes: notes || '',
      status: isGuest ? 'GUEST ORDER CONFIRMED' : 'AUTHENTICATED & PROCESSING',
      createdAt: new Date().toISOString()
    };

    const createdOrder = await dbService.addOrder(orderInput);

    res.status(201).json({
      success: true,
      message: 'Vintage parts order successfully created!',
      data: createdOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders - Get user orders
router.get('/orders', authenticate, async (req, res) => {
  try {
    const userOrders = await dbService.getOrders(req.user.id);
    res.json({ success: true, count: userOrders.length, data: userOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
