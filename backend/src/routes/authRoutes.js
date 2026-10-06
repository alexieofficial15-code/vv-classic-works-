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
 * In-memory IP rate limiter for auth endpoints: 5 failed attempts per 15 minutes per IP
 */
const failedAuthAttempts = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_AUTH_ATTEMPTS = 5;

// Periodic cleanup of stale rate-limit records every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of failedAuthAttempts.entries()) {
    if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
      failedAuthAttempts.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS).unref();

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : null) ||
    req.ip ||
    req.socket?.remoteAddress ||
    'unknown';
}

export function recordFailedAuth(ip) {
  const now = Date.now();
  const record = failedAuthAttempts.get(ip);
  if (!record || now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    failedAuthAttempts.set(ip, { count: 1, startTime: now });
  } else {
    record.count += 1;
  }
}

export function clearFailedAuth(ip) {
  failedAuthAttempts.delete(ip);
}

export const authRateLimiter = (req, res, next) => {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = failedAuthAttempts.get(ip);

  if (record) {
    if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
      failedAuthAttempts.delete(ip);
    } else if (record.count >= MAX_FAILED_AUTH_ATTEMPTS) {
      const retryAfter = Math.ceil((record.startTime + RATE_LIMIT_WINDOW_MS - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        success: false,
        message: 'Too many failed authentication attempts. Please try again in 15 minutes.'
      });
    }
  }

  next();
};

// POST /api/auth/register
router.post('/register', authRateLimiter, async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      recordFailedAuth(ip);
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = String(email).replace(/\0/g, '').trim().toLowerCase();

    const existingUser = await dbService.getUserByEmail(cleanEmail);
    if (existingUser) {
      recordFailedAuth(ip);
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

    clearFailedAuth(ip);

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
    recordFailedAuth(ip);
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', authRateLimiter, async (req, res) => {
  const ip = getClientIp(req);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      recordFailedAuth(ip);
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = String(email).replace(/\0/g, '').trim().toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : null;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH ? process.env.ADMIN_PASSWORD_HASH.trim() : null;

    let user = await dbService.getUserByEmail(cleanEmail);

    if (!user) {
      if (adminEmail && adminPasswordHash && safeCompare(cleanEmail, adminEmail)) {
        const isMasterValid = await bcrypt.compare(String(password), adminPasswordHash);
        if (isMasterValid) {
          // Initial bootstrap for configured master admin if not in DB yet
          user = await dbService.createUser({
            name: 'Master Engineer',
            email: cleanEmail,
            passwordHash: adminPasswordHash,
            role: 'ADMIN'
          });
        }
      }
    }

    if (!user) {
      recordFailedAuth(ip);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(String(password), user.passwordHash || user.password_hash);
    if (!isValid) {
      recordFailedAuth(ip);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Authentication succeeded: clear failed counter
    clearFailedAuth(ip);

    // Sign JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    recordFailedAuth(ip);
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error during login' });
  }
});

// POST /api/auth/admin-login (Secure Admin Portal & Mobile App Access)
router.post('/admin-login', authRateLimiter, async (req, res) => {
  const ip = getClientIp(req);
  const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : null;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH ? process.env.ADMIN_PASSWORD_HASH.trim() : null;
  const adminSecretKey = process.env.ADMIN_SECRET_KEY;

  // Return 503 Service Unavailable if admin credentials are not configured in environment
  if (!adminEmail || !adminPasswordHash) {
    return res.status(503).json({
      success: false,
      message: 'Admin authentication service is unconfigured on the server. Please set ADMIN_EMAIL and ADMIN_PASSWORD_HASH.'
    });
  }

  const { email, password, secretKey } = req.body;

  if (!email || !password) {
    recordFailedAuth(ip);
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
  const isPasswordValid = await bcrypt.compare(cleanPassword, adminPasswordHash);

  let isSecretValid = true;
  if (adminSecretKey && adminSecretKey.trim() !== '') {
    isSecretValid = safeCompare(cleanSecret, adminSecretKey.trim());
  }

  if (!isEmailValid || !isPasswordValid || !isSecretValid) {
    recordFailedAuth(ip);
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Invalid Admin Email or Password credentials.'
    });
  }

  // Authentication succeeded: clear failed counter
  clearFailedAuth(ip);

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
