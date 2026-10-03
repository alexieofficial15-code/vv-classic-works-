import crypto from 'crypto';
import zlib from 'zlib';
import { dbService } from '../config/supabase.js';

// The spare_parts table stores many product photos as base64 data URIs, which made the
// public catalog response ~25 MB. The public catalog replaces each inline image with a
// short URL served by GET /api/parts/:id/image/:key (cacheable, lazy-loadable by the
// browser) so the list payload is a few KB per part.

const isInlineImage = (value) => typeof value === 'string' && value.startsWith('data:');

export const imagePath = (partId, key) => `/api/parts/${encodeURIComponent(partId)}/image/${key}`;

export function toLeanPart(part) {
  const image = isInlineImage(part.image) ? imagePath(part.id, 'main') : part.image;
  const seen = new Set();
  const additionalImages = [];
  (Array.isArray(part.additionalImages) ? part.additionalImages : []).forEach((img, index) => {
    if (!img) return;
    const mapped = img === part.image ? image : (isInlineImage(img) ? imagePath(part.id, `a${index}`) : img);
    if (!seen.has(mapped)) {
      seen.add(mapped);
      additionalImages.push(mapped);
    }
  });
  return { ...part, image, additionalImages };
}

let cached = { source: null, body: null, gzip: null, etag: null };

// Returns the serialized (and gzipped) lean catalog, rebuilt only when the parts cache refreshes
export async function getCatalogPayload() {
  const parts = await dbService.getParts();
  if (cached.source !== parts) {
    const body = JSON.stringify({ success: true, count: parts.length, data: parts.map(toLeanPart) });
    cached = {
      source: parts,
      body,
      gzip: zlib.gzipSync(body),
      etag: `W/"${crypto.createHash('sha1').update(body).digest('hex').slice(0, 20)}"`
    };
  }
  return cached;
}

const IMAGE_MIME_RE = /^image\/(jpeg|jpg|png|webp|gif|avif)$/i;

// Resolve an image key ('main' or 'a<index>') of a part to its stored value
export async function resolvePartImage(partId, key) {
  const parts = await dbService.getParts();
  const part = parts.find((p) => String(p.id) === String(partId));
  if (!part) return null;
  let value;
  if (key === 'main') {
    value = part.image;
  } else if (/^a\d+$/.test(key)) {
    value = (part.additionalImages || [])[Number(key.slice(1))];
  }
  if (!value) return null;

  if (isInlineImage(value)) {
    const match = /^data:([^;,]+)(?:;[^,]*)?;base64,(.*)$/s.exec(value);
    if (!match || !IMAGE_MIME_RE.test(match[1])) return null;
    return { type: 'buffer', mime: match[1].toLowerCase(), buffer: Buffer.from(match[2], 'base64') };
  }
  if (/^https?:\/\//i.test(value)) return { type: 'redirect', url: value };
  return null;
}
