import crypto from 'crypto';

/**
 * Shared Secrets Configuration
 * Reads JWT_SECRET from environment.
 * If unset, generates a strong per-process secret and logs a loud security warning.
 */
let secret = process.env.JWT_SECRET;

if (!secret || secret.trim() === '') {
  console.warn('\n================================================================');
  console.warn('⚠️  [SECURITY WARNING] JWT_SECRET environment variable is NOT set!');
  console.warn('⚠️  Generating a temporary random 256-bit secret for this process.');
  console.warn('⚠️  All issued sessions will be invalidated when the server restarts.');
  console.warn('⚠️  Please set JWT_SECRET in your Render environment variables.');
  console.warn('================================================================\n');
  secret = crypto.randomBytes(32).toString('hex');
}

export const JWT_SECRET = secret;
