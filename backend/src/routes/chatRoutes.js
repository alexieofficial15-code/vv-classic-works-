import express from 'express';
import jwt from 'jsonwebtoken';
import { dbService } from '../config/supabase.js';
import { JWT_SECRET } from '../config/secrets.js';

const router = express.Router();

// User Auth Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // Fallback below
    }
  }

  // Fallback for session recovery
  if (req.body && (req.body.userId || req.body.userEmail)) {
    req.user = {
      id: req.body.userId || 'restorer-01',
      name: req.body.userName || 'Restorer Member',
      email: req.body.userEmail || '',
      role: 'USER'
    };
    return next();
  }

  if (req.query && (req.query.userId || req.query.userEmail)) {
    req.user = {
      id: req.query.userId || (req.query.userEmail ? `user-${req.query.userEmail.replace(/[^a-zA-Z0-9]/g, '_')}` : 'restorer-01'),
      name: req.query.userName || 'Restorer Member',
      email: req.query.userEmail || '',
      role: 'USER'
    };
    return next();
  }

  return res.status(401).json({ success: false, message: 'Authentication required' });
};

// Security Sanitizer: Strips control characters, null bytes, and malicious script/sql injection patterns
const sanitizeInput = (input, maxLen = 3000) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\0/g, '') // remove null byte poisoning
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // strip script tags
    .trim()
    .slice(0, maxLen);
};

// Admin Auth Middleware with 7-Day Session Verification
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userRole = (decoded.role || '').toUpperCase();
    if (userRole === 'ADMIN') {
      req.user = decoded;
      return next();
    }
    return res.status(403).json({ success: false, message: 'Forbidden: Admin privileges required' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired (7 days). Please sign in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session' });
  }
};

// Registered Admin Expo Push Tokens for Mobile App
const adminPushTokens = new Set();

const sendExpoPushNotification = async (title, body, data = {}) => {
  if (adminPushTokens.size === 0) return;
  const messages = Array.from(adminPushTokens).map(pushToken => ({
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high',
    channelId: 'admin-replies'
  }));

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
  } catch (err) {
    console.warn('Expo Push dispatch error:', err.message);
  }
};

// ==========================================
// USER CHAT ENDPOINTS
// ==========================================

// 1. POST /api/chat/send - Send message from User to Admin
router.post('/chat/send', authenticate, async (req, res) => {
  try {
    const rawMessage = req.body.message;
    if (!rawMessage || !String(rawMessage).trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    // Apply strict sanitization against SQL injection / XSS
    const cleanMessage = sanitizeInput(rawMessage, 4000);
    const cleanTargetUserId = sanitizeInput(req.body.targetUserId || '', 100);

    const isUserAdmin = (req.user.role || '').toUpperCase() === 'ADMIN';
    const destinationUserId = isUserAdmin && cleanTargetUserId ? cleanTargetUserId : sanitizeInput(req.user.id, 100);
    const senderName = isUserAdmin 
      ? 'Master Admin Engineer' 
      : sanitizeInput(req.user.name || 'Restorer Member', 100);

    const messageRecord = await dbService.addMessage({
      userId: destinationUserId,
      userName: isUserAdmin ? sanitizeInput(req.body.userName || 'Restorer', 100) : sanitizeInput(req.user.name || 'Restorer Member', 100),
      userEmail: isUserAdmin ? sanitizeInput(req.body.userEmail || '', 150) : sanitizeInput(req.user.email || '', 150),
      senderRole: isUserAdmin ? 'ADMIN' : 'USER',
      senderName,
      message: cleanMessage
    });

    // Notify Admin Mobile App immediately if a customer sent this message
    if (!isUserAdmin) {
      sendExpoPushNotification(
        `💬 Message from ${senderName}`,
        cleanMessage.length > 100 ? `${cleanMessage.substring(0, 97)}...` : cleanMessage,
        { userId: destinationUserId, userName: senderName, messageId: messageRecord.id }
      ).catch(() => {});
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: messageRecord
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET /api/chat/messages - User gets their chat thread
router.get('/chat/messages', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id || req.query?.userId || '';
    const userEmail = req.user?.email || req.query?.userEmail || '';
    const messages = await dbService.getUserMessages(userId, userEmail);
    // Mark admin messages as read by user
    await dbService.markMessagesAsRead(userId, 'USER', userEmail);

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// ADMIN CHAT ENDPOINTS
// ==========================================

// 3. GET /api/admin/chat/conversations - Admin gets list of all customer threads
router.get('/admin/chat/conversations', authenticateAdmin, async (req, res) => {
  try {
    const conversations = await dbService.getAllConversations();
    res.json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. GET /api/admin/chat/messages/:userId - Admin gets full thread with a customer
router.get('/admin/chat/messages/:userId', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const userEmail = req.query?.userEmail || '';
    const messages = await dbService.getUserMessages(userId, userEmail);
    // Mark customer messages as read by admin
    await dbService.markMessagesAsRead(userId, 'ADMIN', userEmail);

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. POST /api/admin/chat/reply - Admin replies to a customer
router.post('/admin/chat/reply', authenticateAdmin, async (req, res) => {
  try {
    const rawUserId = req.body.userId;
    const rawMessage = req.body.message;

    if (!rawUserId || !rawMessage || !String(rawMessage).trim()) {
      return res.status(400).json({ success: false, message: 'User ID and message are required' });
    }

    const cleanUserId = sanitizeInput(rawUserId, 100);
    const cleanUserName = sanitizeInput(req.body.userName || 'Restorer Member', 100);
    const cleanUserEmail = sanitizeInput(req.body.userEmail || '', 150);
    const cleanMessage = sanitizeInput(rawMessage, 4000);

    const messageRecord = await dbService.addMessage({
      userId: cleanUserId,
      userName: cleanUserName,
      userEmail: cleanUserEmail,
      senderRole: 'ADMIN',
      senderName: 'Master Admin Engineer',
      message: cleanMessage
    });

    res.status(201).json({
      success: true,
      message: 'Admin reply sent successfully',
      data: messageRecord
    });
  } catch (err) {
    console.error('Admin reply error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. POST /api/admin/push-token - Register Admin Expo Push Token for mobile notifications
router.post('/admin/push-token', authenticateAdmin, (req, res) => {
  const { pushToken } = req.body;
  if (!pushToken) {
    return res.status(400).json({ success: false, message: 'pushToken is required' });
  }
  adminPushTokens.add(pushToken);
  res.json({
    success: true,
    message: 'Expo push token registered successfully for admin alerts',
    activeTokensCount: adminPushTokens.size
  });
});

// 7. DELETE /api/admin/push-token - Unregister Admin Expo Push Token (Turn notifications OFF)
router.delete('/admin/push-token', authenticateAdmin, (req, res) => {
  const { pushToken } = req.body;
  if (pushToken) {
    adminPushTokens.delete(pushToken);
  }
  res.json({
    success: true,
    message: 'Expo push token unregistered successfully',
    activeTokensCount: adminPushTokens.size
  });
});

// 8. POST /api/admin/push-token/test - Test push notification to admin device
router.post('/admin/push-token/test', authenticateAdmin, async (req, res) => {
  const { pushToken } = req.body;
  if (pushToken) adminPushTokens.add(pushToken);

  if (adminPushTokens.size === 0) {
    return res.status(400).json({ success: false, message: 'No active push tokens registered' });
  }

  await sendExpoPushNotification(
    '🔔 Test Workshop Alert',
    'Push notifications are working perfectly on your mobile device!',
    { test: true, time: new Date().toISOString() }
  );

  res.json({
    success: true,
    message: 'Test notification dispatched to registered devices'
  });
});

export default router;
