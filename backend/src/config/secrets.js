import 'dotenv/config';
import crypto from 'crypto';

// JWT signing secret. There is deliberately no hardcoded fallback: a known default
// would let anyone forge admin tokens. If it is missing we generate a random
// per-process secret (sessions then reset on every restart) and warn loudly.
export const JWT_SECRET =
  (process.env.JWT_SECRET || '').trim() ||
  (() => {
    console.warn('⚠️  JWT_SECRET is not set. Using a random per-process secret; all logins reset on restart. Set JWT_SECRET in your environment.');
    return crypto.randomBytes(48).toString('hex');
  })();

// Master admin credentials come only from the environment. Without them the
// master admin login is disabled instead of falling back to guessable defaults.
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
export const ADMIN_SECRET_KEY = (process.env.ADMIN_SECRET_KEY || '').trim();
export const ADMIN_LOGIN_ENABLED = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);

if (!ADMIN_LOGIN_ENABLED) {
  console.warn('⚠️  ADMIN_EMAIL / ADMIN_PASSWORD are not set. The master admin login is disabled until they are configured.');
}

// Constant-time string comparison to avoid leaking secrets through timing.
export function safeEqual(a, b) {
  const bufA = Buffer.from(String(a ?? ''));
  const bufB = Buffer.from(String(b ?? ''));
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}
