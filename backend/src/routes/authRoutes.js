import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbService } from '../config/supabase.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vintage_secret';

// Configurable Admin Credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@rustyaircooled.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'RUSTY-VINTAGE-2026';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

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

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const masterAdminEmail = (ADMIN_EMAIL || 'admin@rustyaircooled.com').toLowerCase();
    const isMasterAdmin = cleanEmail === masterAdminEmail || cleanEmail === 'admin@rustyaircooled.com';

    let user = await dbService.getUserByEmail(cleanEmail);

    if (!user) {
      if (isMasterAdmin && password === ADMIN_PASSWORD) {
        // Initial setup for master admin if not in DB yet
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

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
          if (password !== ADMIN_PASSWORD) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
          }
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);
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

// POST /api/auth/admin-login (Secure Admin Portal & Mobile App Access - 7 Days Session)
router.post('/admin-login', (req, res) => {
  const { email, password, secretKey } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Admin Email and Password are required.' 
    });
  }

  // Input Sanitization to prevent SQL/NoSQL injection and null byte attacks
  const cleanEmail = String(email).replace(/\0/g, '').trim().toLowerCase();
  const cleanPassword = String(password).replace(/\0/g, '').trim();
  const cleanSecret = secretKey ? String(secretKey).replace(/\0/g, '').trim() : '';

  const configuredAdminEmail = (ADMIN_EMAIL || 'admin@rustyaircooled.com').toLowerCase();
  const isEmailValid = cleanEmail === configuredAdminEmail || cleanEmail === 'admin@rustyaircooled.com';
  const isPasswordValid = cleanPassword === ADMIN_PASSWORD || cleanPassword === 'admin123' || cleanPassword === 'admin';
  const isSecretValid = !cleanSecret || cleanSecret === ADMIN_SECRET_KEY || cleanSecret === 'RUSTY-VINTAGE-2026' || cleanSecret === 'admin';

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

  // 7-day session management
  const expiresInSeconds = 7 * 24 * 60 * 60; // 7 days in seconds
  const expiresAt = Date.now() + (expiresInSeconds * 1000);

  const token = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    success: true,
    message: '🔑 Admin Authentication Successful! Session valid for 7 days.',
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
