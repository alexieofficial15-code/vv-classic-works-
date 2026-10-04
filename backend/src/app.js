import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import partsRoutes from './routes/partsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();

// Gzip/deflate compression for all API responses
app.use(compression());

// CORS Configuration: restricted if CLIENT_ORIGIN is set, else permissive with warning
const clientOriginEnv = process.env.CLIENT_ORIGIN;
let corsOrigin;

if (clientOriginEnv && clientOriginEnv.trim() !== '') {
  const allowedOrigins = clientOriginEnv
    .split(',')
    .map(o => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  corsOrigin = (origin, callback) => {
    // Allow requests with no origin (such as mobile apps, native requests, curl)
    if (!origin) return callback(null, true);

    const normalized = origin.trim().replace(/\/+$/, '');
    const isAllowed = allowedOrigins.includes(normalized) ||
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: Origin ${origin} is not allowed`));
    }
  };
} else {
  console.warn('⚠️  [SECURITY WARNING] CLIENT_ORIGIN is not set in environment. Permissive CORS is currently active.');
  corsOrigin = true;
}

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.options('*', cors({ origin: corsOrigin, credentials: true }));

// Expand JSON body parser limit to 50MB for mobile photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Cache-Control headers for public catalog & parts endpoints (fast browser & CDN caching)
app.use('/api/parts', (req, res, next) => {
  if (req.method === 'GET' && !req.path.includes('/image/')) {
    res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
  }
  next();
});
app.use('/api/cars', (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=3600');
  }
  next();
});

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
