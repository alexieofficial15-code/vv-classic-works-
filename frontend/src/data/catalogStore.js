import { API_BASE_URL } from '../config/api';

/**
 * Shared In-Memory Catalog Store for Classic Aircooled VW Works
 * 
 * - Fetches /api/catalog ONCE and caches the result in memory
 * - De-duplicates simultaneous in-flight requests
 * - Prefixes relative /api/ image URLs with API_BASE_URL
 * - Automatically falls back to /api/admin/parts if /api/catalog returns 404
 * - Uses a 45-second AbortController timeout for network resilience
 */

let memoryCatalogCache = null;
let inFlightPromise = null;

// Helper to prefix relative /api/ URLs with the backend origin (API_BASE_URL)
export function prefixImageUrl(url) {
  if (typeof url === 'string' && url.startsWith('/api/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
}

// Ensure all image URLs in the part object are fully qualified
export function normalizeCatalogPart(part) {
  if (!part) return part;
  const p = { ...part };

  if (p.image) {
    p.image = prefixImageUrl(p.image);
  }
  if (p.thumbnailUrl) {
    p.thumbnailUrl = prefixImageUrl(p.thumbnailUrl);
  }
  if (Array.isArray(p.additionalImages)) {
    p.additionalImages = p.additionalImages.map(prefixImageUrl);
  }

  return p;
}

/**
 * Get all catalog parts with caching and in-flight request deduplication.
 * @param {Object} options
 * @param {boolean} options.forceRefresh - Force fetch fresh data from backend
 * @returns {Promise<Array>} List of normalized catalog parts
 */
export async function getCatalogParts({ forceRefresh = false } = {}) {
  if (!forceRefresh && memoryCatalogCache !== null) {
    return memoryCatalogCache;
  }

  if (!forceRefresh && inFlightPromise !== null) {
    return inFlightPromise;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

  inFlightPromise = (async () => {
    try {
      let response = null;
      let useFallback = false;

      try {
        response = await fetch(`${API_BASE_URL}/api/catalog`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        if (response.status === 404) {
          useFallback = true;
        }
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        useFallback = true;
      }

      // Fall back to /api/admin/parts if /api/catalog returns 404 or fails
      if (useFallback || !response || !response.ok) {
        const fallbackRes = await fetch(`${API_BASE_URL}/api/admin/parts`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        if (!fallbackRes.ok) {
          throw new Error(`Failed to load catalog (status ${fallbackRes.status})`);
        }
        response = fallbackRes;
      }

      const json = await response.json();
      const rawParts = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      const normalizedParts = rawParts.map(normalizeCatalogPart);

      memoryCatalogCache = normalizedParts;
      return normalizedParts;
    } finally {
      clearTimeout(timeoutId);
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}

/**
 * Synchronous getter to check if catalog is already cached in memory.
 */
export function getCachedCatalogParts() {
  return memoryCatalogCache;
}

/**
 * Invalidate the memory cache (e.g. after admin updates/creates/deletes a part).
 */
export function invalidateCatalogCache() {
  memoryCatalogCache = null;
  inFlightPromise = null;
}
