/**
 * Creates the ADMIN_PASSWORD_HASH value for Render, safely.
 *
 *   cd backend
 *   node scripts/set-admin-password.js
 *
 * - You type the password twice (typing is hidden), so the shell never touches it
 *   (no problems with $ ! " ' characters).
 * - The finished hash is verified against the password you typed.
 * - On Windows it is copied to your clipboard, ready to paste into Render's ADMIN_PASSWORD_HASH.
 * - Nothing is saved to disk and nothing is sent over the network.
 */
import bcrypt from 'bcryptjs';
import { spawnSync } from 'child_process';

function askHidden(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    const canRaw = typeof stdin.setRawMode === 'function';
    if (canRaw) stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') {
          if (canRaw) stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          return resolve(value);
        }
        if (ch === '\u0003') { // Ctrl+C
          process.stdout.write('\nCancelled.\n');
          process.exit(130);
        }
        if (ch === '\u007f' || ch === '\b') { // backspace
          value = value.slice(0, -1);
        } else {
          value += ch;
        }
      }
    };
    stdin.on('data', onData);
  });
}

const password = await askHidden('New admin password (typing is hidden): ');
if (password.length < 10) {
  console.error('\nThe password must be at least 10 characters. Nothing was created.');
  process.exit(1);
}
if (password !== password.trim()) {
  console.error('\nThe password starts or ends with a space. Remove it so login behaves predictably. Nothing was created.');
  process.exit(1);
}
const again = await askHidden('Type it again to confirm:               ');
if (again !== password) {
  console.error('\nThe two entries differ. Nothing was created.');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
const verified = await bcrypt.compare(password, hash);
if (!verified || !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash)) {
  console.error('\nInternal check failed. Nothing was created.');
  process.exit(1);
}

let copied = false;
if (process.platform === 'win32') {
  const r = spawnSync('clip', { input: hash, encoding: 'utf8', shell: true });
  copied = r.status === 0;
}

console.log('\nDone. The hash was created and verified against your password.');
console.log(`  length: ${hash.length} characters (correct is 60), starts with: ${hash.slice(0, 7)}`);
console.log(copied
  ? '  It has been COPIED TO YOUR CLIPBOARD.'
  : '  Copy this whole line (no quotes, no spaces):\n\n' + hash + '\n');
console.log('\nNext:');
console.log('  1. Render -> your backend service -> Environment');
console.log('  2. Set ADMIN_PASSWORD_HASH to the pasted value (paste, do not retype)');
console.log('  3. Check ADMIN_EMAIL is the email you will type on the login form');
console.log('  4. Save, rebuild, and deploy. Wait until it says Live, then log in.');
process.exit(0);
