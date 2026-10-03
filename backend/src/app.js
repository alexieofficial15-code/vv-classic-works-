import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import partsRoutes from './routes/partsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

// CORS: when CLIENT_ORIGIN is set (comma-separated list of site origins) only those
// origins plus localhost are allowed. Requests without an Origin header (mobile app,
// curl, server-to-server) are always allowed. If CLIENT_ORIGIN is unset we stay
// permissive so a missing env var never takes the site down.
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map(o => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  console.warn('⚠️  CLIENT_ORIGIN is not set: CORS is open to every origin. Set it to your site URL(s), e.g. https://www.classicaircooledvwworks.com');
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0) return callback(null, true);
    const clean = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes(clean) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Basic security headers
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Expand JSON body parser limit to 50MB for mobile photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Route mounts
app.use('/api', partsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', orderRoutes);
app.use('/api', requestRoutes);
app.use('/api', adminRoutes);
app.use('/api', chatRoutes);

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Classic Aircooled VW Works REST API Server',
    guestBrowsing: 'ENABLED',
    version: '1.0.0'
  });
});

export default app;
