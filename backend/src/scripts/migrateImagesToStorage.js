import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'part-images';
const isDryRun = process.argv.includes('--dry-run');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be provided.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

function parseDataUri(dataUri) {
  if (typeof dataUri !== 'string' || !dataUri.startsWith('data:')) {
    return null;
  }
  const commaIdx = dataUri.indexOf(',');
  if (commaIdx === -1) return null;

  const metaPart = dataUri.substring(0, commaIdx);
  const base64Data = dataUri.substring(commaIdx + 1);

  let contentType = 'image/jpeg';
  const match = metaPart.match(/data:([^;]+)/);
  if (match && match[1]) {
    contentType = match[1];
  }

  let ext = '.jpg';
  if (contentType.includes('png')) ext = '.png';
  else if (contentType.includes('webp')) ext = '.webp';
  else if (contentType.includes('gif')) ext = '.gif';

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    return { buffer, contentType, ext };
  } catch {
    return null;
  }
}

async function uploadImage(storagePath, buffer, contentType) {
  if (isDryRun) {
    console.log(`    [DRY-RUN] Would upload: ${storagePath} (${(buffer.length / 1024).toFixed(1)} KB, ${contentType})`);
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`;
  }

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true
    });

  if (uploadErr) {
    throw new Error(`Failed to upload ${storagePath}: ${uploadErr.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}

async function ensureBucketExists() {
  console.log(`Checking Supabase Storage bucket "${BUCKET_NAME}"...`);

  try {
    const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
    if (bucketsErr) {
      console.warn(`Warning checking buckets: ${bucketsErr.message}`);
    }

    const existingBucket = buckets?.find(b => b.name === BUCKET_NAME);
    if (!existingBucket) {
      if (isDryRun) {
        console.log(`[DRY-RUN] Would create public bucket "${BUCKET_NAME}".`);
      } else {
        console.log(`Creating public bucket "${BUCKET_NAME}"...`);
        const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
        if (createErr) {
          console.warn(`Note when creating bucket: ${createErr.message}`);
        } else {
          console.log(`Public bucket "${BUCKET_NAME}" created successfully.`);
        }
      }
    } else {
      console.log(`Bucket "${BUCKET_NAME}" exists (public: ${Boolean(existingBucket.public)}).`);
    }
  } catch (err) {
    console.warn(`Storage bucket verification note: ${err.message}`);
  }
}

async function runMigration() {
  console.log('====================================================');
  console.log(`Supabase Image Storage Migration Tool`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Simulating changes, no data modified)' : 'LIVE (Uploading to Storage and updating database)'}`);
  console.log('====================================================\n');

  await ensureBucketExists();

  console.log('\nFetching spare_parts records...');
  const { data: parts, error: partsErr } = await supabase
    .from('spare_parts')
    .select('id, title, image, specifications')
    .order('created_at', { ascending: false });

  if (partsErr) {
    console.error('Failed to fetch spare_parts:', partsErr.message);
    process.exit(1);
  }

  console.log(`Found ${parts.length} parts to inspect.\n`);

  let updatedRowsCount = 0;
  let totalUploadedImages = 0;
  let skippedRowsCount = 0;
  let errorsCount = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    console.log(`[${i + 1}/${parts.length}] Part #${part.id} ("${(part.title || '').slice(0, 35)}"):`);

    let rowNeedsUpdate = false;
    let newMainUrl = null;
    let updatedSpecs = null;

    // 1. Check Main Image
    if (part.image && part.image.startsWith('data:')) {
      const parsed = parseDataUri(part.image);
      if (parsed) {
        const storagePath = `${part.id}/main${parsed.ext}`;
        try {
          const publicUrl = await uploadImage(storagePath, parsed.buffer, parsed.contentType);
          newMainUrl = publicUrl;
          rowNeedsUpdate = true;
          totalUploadedImages++;
          console.log(`  ✓ Main image decoded & uploaded -> ${storagePath} (${(parsed.buffer.length / 1024).toFixed(1)} KB)`);
        } catch (err) {
          errorsCount++;
          console.error(`  ✗ Main image upload failed: ${err.message}`);
        }
      } else {
        console.warn(`  ! Main image has invalid data URI`);
      }
    } else if (part.image && part.image.startsWith('http')) {
      console.log(`  - Main image already hosted on URL: ${part.image.slice(0, 45)}...`);
    } else {
      console.log(`  - Main image is not base64`);
    }

    // 2. Check Additional Images in specifications.__meta
    let rawSpecs = Array.isArray(part.specifications) ? [...part.specifications] : [];
    let metaIdx = rawSpecs.findIndex(s => s && s.key === '__meta');
    if (metaIdx !== -1) {
      try {
        let metaObj = typeof rawSpecs[metaIdx].value === 'string'
          ? JSON.parse(rawSpecs[metaIdx].value)
          : rawSpecs[metaIdx].value;

        if (Array.isArray(metaObj.additionalImages) && metaObj.additionalImages.length > 0) {
          let addImagesUpdated = false;
          const newAddImages = [...metaObj.additionalImages];

          for (let n = 0; n < newAddImages.length; n++) {
            const addImg = newAddImages[n];
            if (typeof addImg === 'string' && addImg.startsWith('data:')) {
              const parsed = parseDataUri(addImg);
              if (parsed) {
                const storagePath = `${part.id}/a${n}${parsed.ext}`;
                try {
                  const publicUrl = await uploadImage(storagePath, parsed.buffer, parsed.contentType);
                  newAddImages[n] = publicUrl;
                  addImagesUpdated = true;
                  rowNeedsUpdate = true;
                  totalUploadedImages++;
                  console.log(`  ✓ Additional image a${n} decoded & uploaded -> ${storagePath} (${(parsed.buffer.length / 1024).toFixed(1)} KB)`);
                } catch (err) {
                  errorsCount++;
                  console.error(`  ✗ Additional image a${n} upload failed: ${err.message}`);
                }
              }
            }
          }

          if (addImagesUpdated) {
            metaObj.additionalImages = newAddImages;
            rawSpecs[metaIdx] = { key: '__meta', value: JSON.stringify(metaObj) };
            updatedSpecs = rawSpecs;
          }
        }
      } catch (err) {
        console.error(`  ✗ Error parsing specifications.__meta: ${err.message}`);
      }
    }

    // 3. Update row in spare_parts only after confirmed uploads
    if (rowNeedsUpdate) {
      if (isDryRun) {
        updatedRowsCount++;
        console.log(`  [DRY-RUN] Row #${part.id} would be updated with public storage URLs.`);
      } else {
        const updatePayload = {};
        if (newMainUrl) updatePayload.image = newMainUrl;
        if (updatedSpecs) updatePayload.specifications = updatedSpecs;

        const { error: updateErr } = await supabase
          .from('spare_parts')
          .update(updatePayload)
          .eq('id', part.id);

        if (updateErr) {
          errorsCount++;
          console.error(`  ✗ Database update failed for row #${part.id}: ${updateErr.message}`);
        } else {
          updatedRowsCount++;
          console.log(`  ★ Database row #${part.id} successfully updated with Storage URLs.`);
        }
      }
    } else {
      skippedRowsCount++;
    }
  }

  console.log('\n====================================================');
  console.log('Migration Summary');
  console.log('====================================================');
  console.log(`Mode: ${isDryRun ? 'DRY-RUN' : 'LIVE'}`);
  console.log(`Total rows inspected: ${parts.length}`);
  console.log(`Rows updated / to update: ${updatedRowsCount}`);
  console.log(`Rows skipped (already clean): ${skippedRowsCount}`);
  console.log(`Total images uploaded / simulated: ${totalUploadedImages}`);
  console.log(`Errors encountered: ${errorsCount}`);
  console.log('====================================================\n');
}

runMigration().catch(err => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
