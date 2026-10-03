import { API_BASE_URL } from '../config/api';

// Single shared catalog fetch used by every component (CatalogSection, VWVehicleShowcase,
// browser-Back part lookup). Previously each component downloaded the full 25 MB parts
// table separately. Now we download the lean /api/catalog once and share the result.

const absolutize = (url) =>
  typeof url === 'string' && url.startsWith('/api/') ? `${API_BASE_URL}${url}` : url;

const normalizePart = (part) => ({
  ...part,
  image: absolutize(part.image),
  additionalImages: Array.isArray(part.additionalImages) ? part.additionalImages.map(absolutize) : []
});

let cache = null;
let inflight = null;

// Render free-tier instances can take up to a minute to wake up, so allow a long timeout
const REQUEST_TIMEOUT_MS = 45000;

async function request(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { signal: controller.signal });
    if (!res.ok) {
      const error = new Error(`Catalog request failed (${res.status})`);
      error.status = res.status;
      throw error;
    }
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error('Unexpected catalog response');
    }
    return json.data;
  } finally {
    clearTimeout(timer);
  }
}

export function getCachedCatalog() {
  return cache;
}

export function invalidateCatalog() {
  cache = null;
  inflight = null;
}

export function fetchCatalog() {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  const run = (async () => {
    let data;
    try {
      data = await request('/api/catalog');
    } catch (err) {
      // Backend not yet updated with the lean endpoint: fall back to the legacy list
      if (err.status === 404) {
        data = await request('/api/admin/parts');
      } else {
        throw err;
      }
    }
    cache = data.map(normalizePart);
    return cache;
  })();

  inflight = run.finally(() => {
    inflight = null;
  });
  return inflight;
}
