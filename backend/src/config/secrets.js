/**
 * Shared Secrets Configuration
 * Reads JWT_SECRET from environment.
 * If missing or shorter than 32 characters, throws and exits process with code 1.
 */
const secret = process.env.JWT_SECRET;

if (!secret || secret.trim().length < 32) {
  const err = new Error('JWT_SECRET is missing or shorter than 32 characters.');
  console.error(`❌ [FATAL SECURITY ERROR] ${err.message}`);
  process.exit(1);
  throw err;
}

export const JWT_SECRET = secret.trim();
