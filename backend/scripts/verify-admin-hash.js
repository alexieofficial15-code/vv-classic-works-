/**
 * Checks, on your own computer, whether a password matches an ADMIN_PASSWORD_HASH value.
 * Nothing is sent over the network and nothing is stored.
 *
 * Usage (PowerShell, from the backend folder). Use SINGLE quotes so $ characters are not expanded:
 *   node scripts/verify-admin-hash.js 'YourPassword' '$2b$10$....the hash copied from Render....'
 */
import bcrypt from 'bcryptjs';

const [, , password, hash] = process.argv;

if (!password || !hash) {
  console.log("Usage: node scripts/verify-admin-hash.js 'password' 'hash'   (use single quotes)");
  process.exit(1);
}

const cleanHash = hash.trim();
console.log(`Hash length : ${cleanHash.length} (a valid bcrypt hash is exactly 60)`);
console.log(`Hash starts : ${cleanHash.slice(0, 7)} (should look like $2b$10$)`);
console.log(`Has spaces/quotes around it: ${/^["']|["']$/.test(cleanHash) || /\s/.test(cleanHash)}`);

const shapeOk = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(cleanHash);
if (!shapeOk) {
  console.log('\nRESULT: this is NOT a valid bcrypt hash (cut off, extra characters, or mangled by the shell).');
  console.log('Create a fresh one with:  node scripts/hash-password.js \'YourPassword\'');
  process.exit(2);
}

const ok = await bcrypt.compare(password, cleanHash);
console.log(ok
  ? '\nRESULT: MATCH. This password works with this hash. If login still fails, the email or secret key is what differs.'
  : '\nRESULT: NO MATCH. The hash is valid but was made from a different password (or the password has different spelling/case).');
process.exit(ok ? 0 : 3);
