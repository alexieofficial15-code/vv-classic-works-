// Central API configuration for Dedicated Backend + Frontend
// Dynamic API_BASE_URL resolution:
// 1. Uses VITE_API_URL environment variable if set (e.g. https://your-backend-host.com)
// 2. In local development mode (DEV), defaults to 'http://localhost:5000'
// 3. In production, reads VITE_API_URL directly

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, ''); // Strip trailing slashes
  }
  
  // Connect to live Render backend by default (both in production and local dev/preview)
  return 'https://vv-classic-works.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

