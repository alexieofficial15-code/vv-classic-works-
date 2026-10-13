import crypto from 'crypto';

/**
 * In-memory cache for part photos.
 *
 * Why: photos are stored as base64 inside the database. Every photo request used to read that
 * (large) row from Supabase, which counts as database egress. With this cache a photo is read from
 * Supabase at most once per server start (or once per TTL), however many visitors request it.
 *
 * - Entries hold the DECODED image buffer (or a redirect target for external URLs).
 * - Single-flight: concurrent requests for the same photo share one database read.
 * - Bounded by total bytes (least-recently-used entries are evicted first) and by a TTL.
 * - "Not found" is cached briefly so missing ids cannot hammer the database.
 * - Cleared whenever a part is added, edited or deleted (see invalidatePartsCache in supabase.js).
 */

const MAX_BYTES = Number(process.env.IMAGE_CACHE_MAX_MB || 120) * 1024 * 1024;
const TTL_MS = Number(process.env.IMAGE_CACHE_TTL_MIN || 360) * 60 * 1000;   // 6 hours
const MISS_TTL_MS = 60 * 1000;                                              // 1 minute for 404s

const entries = new Map();   // key -> { value, size, expires }   (Map keeps insertion order => LRU)
const inFlight = new Map();  // key -> Promise
let totalBytes = 0;
let generation = 0;
const stats = { hits: 0, misses: 0, loads: 0, evictions: 0 };

function remove(key) {
  const e = entries.get(key);
  if (e) {
    totalBytes -= e.size;
    entries.delete(key);
  }
}

function store(key, value, size, ttl) {
  remove(key);
  // An item bigger than the whole budget is served but never kept
  if (size > MAX_BYTES) return;
  entries.set(key, { value, size, expires: Date.now() + ttl });
  totalBytes += size;
  while (totalBytes > MAX_BYTES && entries.size > 0) {
    const oldest = entries.keys().next().value;
    remove(oldest);
    stats.evictions++;
  }
}

/**
 * Returns the cached value for `key`, or runs `loader()` once (shared by concurrent callers) and caches it.
 * `loader` must resolve to one of:
 *   { type: 'image', buffer, mime }   decoded photo
 *   { type: 'redirect', url }          external image URL
 *   { type: 'missing' }                nothing to serve
 */
export async function getOrLoadImage(key, loader) {
  const hit = entries.get(key);
  if (hit && hit.expires > Date.now()) {
    // refresh LRU position
    entries.delete(key);
    entries.set(key, hit);
    stats.hits++;
    return hit.value;
  }
  if (hit) remove(key);

  if (inFlight.has(key)) return inFlight.get(key);

  stats.misses++;
  const startGeneration = generation;
  const promise = (async () => {
    try {
      stats.loads++;
      const value = await loader();
      if (value.type === 'image') {
        value.etag = `"${crypto.createHash('md5').update(value.buffer).digest('hex')}"`;
      }
      // If the cache was cleared while we were loading (a part was edited), serve the value but do not keep it
      if (generation === startGeneration) {
        if (value.type === 'image') store(key, value, value.buffer.length, TTL_MS);
        else if (value.type === 'redirect') store(key, value, value.url.length + 64, TTL_MS);
        else store(key, value, 64, MISS_TTL_MS);
      }
      return value;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

export function clearImageCache() {
  generation++;
  entries.clear();
  inFlight.clear();
  totalBytes = 0;
}

export function imageCacheStats() {
  return { ...stats, entries: entries.size, megabytes: Math.round((totalBytes / 1048576) * 10) / 10, maxMegabytes: MAX_BYTES / 1048576 };
}
