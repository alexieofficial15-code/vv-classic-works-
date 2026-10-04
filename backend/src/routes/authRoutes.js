import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbService } from '../config/supabase.js';
import { JWT_SECRET } from '../config/secrets.js';

const router = express.Router();

/**
 * Constant-time string comparison using crypto.timingSafeEqual to prevent timing attacks.
 */
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Perform dummy timing comparison on equal-length buffer to prevent length timing leak
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * In-memory IP rate limiter for auth endpoints (10 attempts / 15 min per IP)
 */
const authAttempts = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_AUTH_ATTEMPTS = 10;

// Periodic cleanup of stale rate-limit records every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of authAttempts.entries()) {
    if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
      authAttempts.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS).unref();

export const authRateLimiter = (req, res, next) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : null) ||
    req.ip ||
    req.socket?.remoteAddress ||
    'unknown';

  const now = Date.now();
  const record = authAttempts.get(ip);

  if (!record || now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    authAttempts.set(ip, { count: 1, startTime: now });
    return next();
  }

  if (record.count >= MAX_AUTH_ATTEMPTS) {
    const retryAfter = Math.ceil((record.startTime + RATE_LIMIT_WINDOW_MS - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again in 15 minutes.'
    });
  }

  record.count += 1;
  next();
};

// POST /api/auth/register
router.post('/register', authRateLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = String(email).replace(/\0/g, '').trim().toLowerCase();

    const existingUser = await dbService.getUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await dbService.createUser({
      name: name || cleanEmail.split('@')[0] || 'Vintage Restorer',
      email: cleanEmail,
      passwordHash,
      role: 'USER'
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = String(email).replace(/\0/g, '').trim().toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : null;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const isMasterAdmin = Boolean(
      adminEmail &&
      adminPassword &&
      safeCompare(cleanEmail, adminEmail)
    );

    let user = await dbService.getUserByEmail(cleanEmail);

    if (!user) {
      if (isMasterAdmin && safeCompare(password, adminPassword)) {
        // Initial bootstrap for configured master admin if not in DB yet
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);

        user = await dbService.createUser({
          name: 'Master Engineer',
          email: cleanEmail,
          passwordHash,
          role: 'ADMIN'
        });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    } else {
      if (isMasterAdmin) {
        user.role = 'ADMIN';
        if (user.passwordHash) {
          const isMatch = await bcrypt.compare(password, user.passwordHash);
          if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
          }
        } else {
          if (!safeCompare(password, adminPassword)) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
          }
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(adminPassword, salt);
        }
      } else {
        if (!user.passwordHash) {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
      }
    }

    const role = isMasterAdmin ? 'ADMIN' : (user.role || 'USER');

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Welcome back!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error during login' });
  }
});

// POST /api/auth/admin-login (Secure Admin Portal & Mobile App Access)
router.post('/admin-login', authRateLimiter, (req, res) => {
  const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : null;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminSecretKey = process.env.ADMIN_SECRET_KEY;

  // Return 503 Service Unavailable if admin credentials are not configured in environment
  if (!adminEmail || !adminPassword) {
    return res.status(503).json({
      success: false,
      message: 'Admin authentication service is unconfigured on the server. Please set ADMIN_EMAIL and ADMIN_PASSWORD.'
    });
  }

  const { email, password, secretKey } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Admin Email and Password are required.'
    });
  }

  // Input Sanitization to prevent null-byte and injection attacks
  const cleanEmail = String(email).replace(/\0/g, '').trim().toLowerCase();
  const cleanPassword = String(password).replace(/\0/g, '').trim();
  const cleanSecret = secretKey ? String(secretKey).replace(/\0/g, '').trim() : '';

  const isEmailValid = safeCompare(cleanEmail, adminEmail.toLowerCase());
  const isPasswordValid = safeCompare(cleanPassword, adminPassword);
  let isSecretValid = true;
  if (adminSecretKey && adminSecretKey.trim() !== '') {
    isSecretValid = safeCompare(cleanSecret, adminSecretKey.trim());
  }

  if (!isEmailValid || !isPasswordValid || !isSecretValid) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Invalid Admin Email or Password credentials.'
    });
  }

  const adminUser = {
    id: 'admin-master',
    name: 'Master Admin Engineer',
    email: cleanEmail,
    role: 'ADMIN'
  };

  const expiresInSeconds = 7 * 24 * 60 * 60; // 7 days
  const expiresAt = Date.now() + (expiresInSeconds * 1000);

  const token = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    success: true,
    message: 'Admin Authentication Successful. Session valid for 7 days.',
    token,
    expiresAt,
    expiresInDays: 7,
    user: adminUser
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized guest mode' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

export default router;
