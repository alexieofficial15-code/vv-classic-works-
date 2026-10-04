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

// Middlewares - Permissive CORS to allow Vercel, Netlify, Render, Mobile browsers, and Localhost
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.options('*', cors());

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
