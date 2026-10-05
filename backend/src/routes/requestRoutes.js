import express from 'express';
import jwt from 'jsonwebtoken';
import { dbService } from '../config/supabase.js';
import { JWT_SECRET } from '../config/secrets.js';

const router = express.Router();

// Optional Auth middleware for submitting requests (Allows both Guests and Registered Users)
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

// Auth middleware matching orderRoutes.js (for viewing private user requests)
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Login required to submit request' });
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

// Admin Auth Middleware
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

// POST /api/requests - Create a part request / reservation (Guest + Member Support)
router.post('/requests', optionalAuthenticate, async (req, res) => {
  try {
    const { id, partId, partTitle, partImage, sku, price, compatibility, type, status, userName, userEmail, userPhone, userCity } = req.body;

    if (!partId && !partTitle) {
      return res.status(400).json({ success: false, message: 'Part details are required for request' });
    }

    const finalUserId = req.user?.id || `guest-${Date.now()}`;
    const finalUserName = req.user?.name || userName || 'Guest Restorer';
    const finalUserEmail = req.user?.email || userEmail || 'guest@aircooledworks.com';

    const requestInput = {
      id: id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: finalUserId,
      userName: finalUserName,
      userEmail: finalUserEmail,
      userPhone: userPhone || req.user?.phone || '',
      userCity: userCity || req.user?.city || '',
      partId: partId || '',
      partTitle: partTitle || 'Vintage Part',
      partImage: partImage || '',
      sku: sku || 'N/A',
      price: parseFloat(price) || 0,
      compatibility: compatibility || 'VW Classic',
      type: type || 'REQUEST',
      status: status || 'Pending',
      createdAt: new Date().toISOString()
    };

    const createdRequest = await dbService.addRequest(requestInput);

    res.status(201).json({
      success: true,
      message: 'Request successfully submitted!',
      data: createdRequest
    });
  } catch (err) {
    console.error('Request creation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/requests - Get logged in user's requests (Protected Route)
router.get('/requests', authenticate, async (req, res) => {
  try {
    const userRequests = await dbService.getRequests(req.user.id);
    res.json({ success: true, count: userRequests.length, data: userRequests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

import { emailService } from '../services/emailService.js';

// GET /api/admin/requests - Return ALL requests for Admin Panel (Admin Protected)
router.get('/admin/requests', authenticateAdmin, async (req, res) => {
  try {
    const allRequests = await dbService.getRequests();
    res.json({ success: true, count: allRequests.length, data: allRequests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/requests/:id - Update request status with automatic email & chat notification
router.put('/admin/requests/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, customNotes } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updated = await dbService.updateRequestStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // 1. Post automated message to user's in-app chat thread
    if (updated.userId) {
      try {
        await dbService.addMessage({
          userId: updated.userId,
          userName: updated.userName || 'Restorer Member',
          userEmail: updated.userEmail || '',
          senderRole: 'ADMIN',
          senderName: 'Master Admin Engineer',
          message: `🔔 STATUS UPDATE: Your request for "${updated.partTitle}" (ID: #${updated.id}) has been updated to "${status.toUpperCase()}". ${customNotes ? `\n\nAdmin Note: ${customNotes}` : ''}`
        });
      } catch (chatErr) {
        console.warn('Failed to add status update chat message:', chatErr.message);
      }
    }

    // 2. Dispatch automated email to customer
    let emailResult = null;
    if (updated.userEmail) {
      try {
        emailResult = await emailService.sendRequestStatusEmail({
          to: updated.userEmail,
          userName: updated.userName,
          requestId: updated.id,
          partTitle: updated.partTitle,
          price: updated.price,
          newStatus: status,
          customNotes
        });
      } catch (mailErr) {
        console.warn('Email dispatch failed:', mailErr.message);
      }
    }

    res.json({
      success: true,
      message: `Request #${id} status updated to ${status}. Notification sent to customer.`,
      data: updated,
      emailSent: emailResult?.success || false
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/requests/email-direct - Admin sends custom direct email to customer
router.post('/admin/requests/email-direct', authenticateAdmin, async (req, res) => {
  try {
    const { to, userName, subject, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ success: false, message: 'Recipient email and message content are required' });
    }

    const result = await emailService.sendDirectEmail({ to, userName, subject, message });

    res.json({
      success: true,
      message: `Email dispatched to ${to}`,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
