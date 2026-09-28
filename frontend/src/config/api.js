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
  
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    // In local development or LAN testing (localhost, 127.0.0.1)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:5000`;
    }
  }
  
  // Production default fallback to live Render backend
  return 'https://vv-classic-works.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

