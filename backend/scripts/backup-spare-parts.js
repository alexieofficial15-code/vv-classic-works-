// One-row-at-a-time JSON Lines backup of public.spare_parts (including raw base64 images).
// NOT run automatically. Usage (from /backend):  node scripts/backup-spare-parts.js
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment (.env).
// Reads ids first (tiny query), then fetches ONE row per request so no single query
// has to move every base64 photo at once (that query shape is what times out).
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const outDir = path.resolve('backups');
const outFile = path.join(outDir, `spare_parts_backup_${stamp}.jsonl`);
fs.mkdirSync(outDir, { recursive: true });

const { data: ids, error: idsErr } = await supabase.from('spare_parts').select('id').order('created_at', { ascending: true });
if (idsErr) {
  console.error('Failed to list ids:', idsErr.message);
  process.exit(1);
}

const stream = fs.createWriteStream(outFile, { flags: 'w' });
let saved = 0;
let failed = 0;
for (const { id } of ids) {
  const { data, error } = await supabase.from('spare_parts').select('*').eq('id', id).single();
  if (error || !data) {
    failed++;
    console.error(`  x ${id}: ${error ? error.message : 'no data'}`);
    continue;
  }
  stream.write(JSON.stringify(data) + '\n');
  saved++;
  console.log(`  ok ${id} (${(JSON.stringify(data).length / 1024).toFixed(0)} KiB)`);
}
stream.end();
console.log(`\nSaved ${saved}/${ids.length} rows to ${outFile} (${failed} failed).`);
process.exit(failed ? 1 : 0);
