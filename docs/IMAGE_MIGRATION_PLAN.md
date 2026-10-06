# Supabase Storage Image Migration Plan (69 Base64 Photos)

> **Status:** Draft / Pending Owner Approval  
> **Target Environment:** Supabase PostgreSQL Database & Supabase Storage  
> **Safety Directive:** Zero code or SQL execution without explicit prior approval. No existing base64 data will be modified or removed during migration.

---

## 1. Backup Strategy & Verification

Before altering any schema or uploading files, a dual-layer backup must be captured to guarantee 100% data recovery in the event of an interruption or failure.

### 1.1 In-Database Table Copy (`spare_parts_backup_YYYYMMDD`)
Create an exact clone of the active `spare_parts` table within the same PostgreSQL database.

```sql
-- SHOWN NOT RUN: Table Copy Snapshot
CREATE TABLE spare_parts_backup_20261006 AS 
SELECT * FROM spare_parts;

-- Add a comment documenting the snapshot timestamp and purpose
COMMENT ON TABLE spare_parts_backup_20261006 IS 'Pre-migration snapshot of spare_parts prior to Supabase Storage image migration';
```

### 1.2 Off-Database JSON Dump
An offline, local JSON export containing all rows and raw base64 payloads:

- **Destination Path:** `backend/backups/spare_parts_backup_YYYYMMDD.json`
- **Execution Command (Shown Not Run):**
  ```bash
  node -e "
    import('dotenv/config');
    import('@supabase/supabase-js').then(async ({ createClient }) => {
      const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await client.from('spare_parts').select('*');
      if (error) throw error;
      const fs = await import('fs');
      if (!fs.existsSync('backend/backups')) fs.mkdirSync('backend/backups', { recursive: true });
      fs.writeFileSync('backend/backups/spare_parts_backup_20261006.json', JSON.stringify(data, null, 2));
      console.log('Saved', data.length, 'records to backup JSON.');
    });
  "
  ```

### 1.3 Backup Verification Checklist
Before proceeding to any schema modifications or script operations, run the following verification query:

```sql
-- SHOWN NOT RUN: Verification Queries
-- 1. Compare total row counts (must be identical)
SELECT 
  (SELECT count(*) FROM spare_parts) AS active_count,
  (SELECT count(*) FROM spare_parts_backup_20261006) AS backup_count;

-- 2. Verify non-null image row count and total payload byte length match exactly
SELECT 
  (SELECT count(image) FROM spare_parts WHERE image IS NOT NULL) AS active_image_count,
  (SELECT count(image) FROM spare_parts_backup_20261006 WHERE image IS NOT NULL) AS backup_image_count,
  (SELECT sum(length(image)) FROM spare_parts WHERE image IS NOT NULL) AS active_image_bytes,
  (SELECT sum(length(image)) FROM spare_parts_backup_20261006 WHERE image IS NOT NULL) AS backup_image_bytes;
```

**Verification Gate:** Both counts and total byte sums must match down to the exact byte. The JSON dump on disk must parse cleanly (`JSON.parse(...)`) with `data.length` matching `active_count`.

---

## 2. Database Schema Changes

To achieve zero risk of data loss or disruption to running instances, new dedicated storage columns will be added. Existing columns (`image` and `specifications`) remain completely untouched during the migration process.

### 2.1 Proposed Columns
- `image_url` (`text`, nullable): Stores the public Supabase Storage HTTPS URL for the main part image (e.g., `https://[project].supabase.co/storage/v1/object/public/part-images/[id]/main.webp`).
- `additional_image_urls` (`jsonb`, default `'[]'::jsonb`): Stores an array of public Supabase Storage HTTPS URLs for secondary gallery images (e.g., `["https://.../a0.webp", "https://.../a1.webp"]`).

### 2.2 Schema SQL (Shown Not Run)

```sql
-- SHOWN NOT RUN: Add new dedicated storage URL columns
ALTER TABLE spare_parts
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS additional_image_urls jsonb DEFAULT '[]'::jsonb;

-- Optional index for quick inspection of unmigrated items
CREATE INDEX IF NOT EXISTS idx_spare_parts_image_url ON spare_parts (image_url);
```

*Note: Since both columns are nullable with a safe default, this operation is instantaneous (metadata-only update in Postgres) with zero downtime and zero table lock duration.*

---

## 3. Migration Script Specifications (`migrateImagesToStorage.js`)

The script at `backend/src/scripts/migrateImagesToStorage.js` will be modified according to the following strict requirements:

### 3.1 Authentication & Security
- **Service-Role Key Enforcement:** The script will strictly require `SUPABASE_SERVICE_ROLE_KEY`. The anonymous fallback (`SUPABASE_ANON_KEY`) will be removed entirely.
- **Fail-Fast Check:** If `process.env.SUPABASE_SERVICE_ROLE_KEY` is missing, the script will immediately exit with code `1`:
  ```javascript
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('FATAL: SUPABASE_SERVICE_ROLE_KEY is required for image migration. Anon key is not permitted.');
    process.exit(1);
  }
  ```

### 3.2 Query Strategy: One Row Per Query by ID
- **Problem with Bulk Queries:** Querying all 69 rows with full multi-megabyte base64 strings in a single `.select('*')` risks Supabase API gateway statement timeouts (544 / 504 errors) and high Node heap usage.
- **New Approach:**
  1. Lightweight ID discovery:
     ```javascript
     const { data: rows } = await supabase
       .from('spare_parts')
       .select('id')
       .order('id', { ascending: true });
     ```
  2. Sequential iteration: For each part ID, fetch that single row's payload:
     ```javascript
     const { data: part } = await supabase
       .from('spare_parts')
       .select('id, title, image, specifications, image_url, additional_image_urls')
       .eq('id', partId)
       .single();
     ```

### 3.3 Target Columns
- Write exclusively to `image_url` and `additional_image_urls`.
- Do **not** overwrite `part.image` or strip `part.specifications`. Existing columns remain 100% untouched.

### 3.4 Upload Verification (HTTP 200 & Byte-Length Match)
- Immediately after uploading a file to Supabase Storage, the script will perform an HTTP request against the resulting `publicUrl`:
  ```javascript
  const res = await fetch(publicUrl);
  if (!res.ok) {
    throw new Error(`Upload verification failed: HTTP ${res.status} on ${publicUrl}`);
  }
  const verifiedBuffer = Buffer.from(await res.arrayBuffer());
  if (verifiedBuffer.length !== originalBuffer.length) {
    throw new Error(`Byte length mismatch: uploaded ${verifiedBuffer.length} bytes, expected ${originalBuffer.length} bytes`);
  }
  ```
- The row's `image_url` / `additional_image_urls` in the database will **only** be updated after this verification succeeds.

### 3.5 Resumability & Idempotency
- If `part.image_url` is already populated and verified, the script skips re-uploading the main image.
- If an interruption occurs (e.g., network timeout), re-running the script picks up exactly where it stopped without duplicate storage writes or orphaned files.

### 3.6 Default `--dry-run`
- The script defaults to `--dry-run` mode.
- Running `node backend/src/scripts/migrateImagesToStorage.js` will simulate decoding, compute byte sizes, check existing URLs, and output what would happen without uploading or writing to the database.
- Executing live updates requires explicitly passing `--live`:
  ```bash
  node backend/src/scripts/migrateImagesToStorage.js --live
  ```

---

## 4. Zero-Downtime Switch-Over

Once all 69 rows have valid, verified Supabase Storage URLs in `image_url` and `additional_image_urls`, traffic is switched over smoothly.

### 4.1 Backend Data Mapping (`backend/src/config/supabase.js`)
Update `mapLightPartFromDb` and `mapPartFromDb`:
1. **Primary Source:** If `row.image_url` is populated and begins with `http://` or `https://`, use `row.image_url`.
2. **Fallback Source:** If `row.image_url` is null or empty, fall back to the legacy endpoint (`/api/parts/${row.id}/image/main`) or legacy `row.image`.
3. **Additional Images:** Prefer `row.additional_image_urls` (JSON array of URLs). If empty, fall back to `specifications.__meta.additionalImages`.

```javascript
// Switch-Over Mapping Logic:
export function mapLightPartFromDb(row) {
  if (!row) return null;
  
  // Prefer new Storage URL, fall back to legacy proxy or base64
  let resolvedImageUrl = row.image_url;
  if (!resolvedImageUrl || !resolvedImageUrl.startsWith('http')) {
    resolvedImageUrl = (typeof row.image === 'string' && row.image.startsWith('http'))
      ? row.image
      : `/api/parts/${row.id}/image/main`;
  }

  return {
    id: row.id,
    image: resolvedImageUrl,
    // ... rest of fields
  };
}
```

### 4.2 Endpoint Redirect (`backend/src/routes/partsRoutes.js`)
If any external bookmark or cached client still accesses `/api/parts/:id/image/main`, the backend checks if `image_url` exists in the database and returns a `302 Found` redirect directly to the Supabase Storage CDN URL, completely offloading binary streaming from the Node server.

### 4.3 Frontend Compatibility (`frontend/src/data/catalogStore.js`)
- **No changes required in UI components:**
  - `catalogStore.js` already includes `normalizeCatalogPart()` and `prefixImageUrl()`.
  - Fully qualified HTTP/HTTPS URLs (such as Supabase Storage CDN URLs) are already recognized and passed through untouched:
    ```javascript
    export function prefixImageUrl(url) {
      if (typeof url === 'string' && url.startsWith('/api/')) {
        return `${API_BASE_URL}${url}`;
      }
      return url; // http/https Storage URLs are preserved as-is
    }
    ```
  - All existing frontend components (`CatalogSection`, `PartDetailModal`, `ProductDetailPage`, `CartDrawer`) immediately render the CDN images without code modifications.

---

## 5. Rollback Plan

If any issue is detected (e.g., CDN latency, permissions error on storage bucket, broken links):

### 5.1 Immediate Soft Rollback (Zero DB Restoration Required)
Because legacy columns (`image` and `specifications`) were never touched, reverting the backend mapping logic to prioritize legacy base64 immediately restores the previous behavior in seconds:
```javascript
// Temporary soft rollback in supabase.js:
const resolvedImageUrl = `/api/parts/${row.id}/image/main`;
```
Or reset the new columns via SQL:
```sql
-- SHOWN NOT RUN: Clear new columns to revert to fallback mode
UPDATE spare_parts 
SET image_url = NULL, 
    additional_image_urls = '[]'::jsonb;
```

### 5.2 Hard Rollback (From Database Backup Table)
If any data corruption were to occur on existing columns:
```sql
-- SHOWN NOT RUN: Full restore from snapshot table
UPDATE spare_parts s
SET image = b.image,
    specifications = b.specifications
FROM spare_parts_backup_20261006 b
WHERE s.id = b.id;
```

---

## 6. Cleanup Strategy (7-Day Quarantine)

To avoid premature data loss, legacy base64 strings will remain intact for an observation period of **7 full days** in production.

### 6.1 Monitoring Criteria During 7-Day Window
1. Confirm zero fallback hits to `/api/parts/:id/image/main` in server logs.
2. Confirm zero image loading errors (404/403) on all product detail and catalog views.
3. Verify Lighthouse scores remain at or above target baselines.

### 6.2 Legacy Base64 Deletion (Day 8+)
After 7 days of verified stability, null the legacy columns to recover table storage and eliminate bloated row sizes:

```sql
-- SHOWN NOT RUN: Execute ONLY after 7 days of verified production operation
UPDATE spare_parts
SET image = NULL
WHERE image_url IS NOT NULL;
```

### 6.3 Secondary Specification Cleanup
For `specifications.__meta`:
- Strip the `additionalImages` array from the `__meta` JSON object once `additional_image_urls` has operated cleanly for 7 days, preserving other metadata fields (dimensions, shipping notes, vehicle fitments).

### 6.4 Backup Table Drop (Day 30+)
The backup table `spare_parts_backup_YYYYMMDD` should be retained for 30 days before dropping:
```sql
-- SHOWN NOT RUN: Drop snapshot table after 30 days
DROP TABLE IF EXISTS spare_parts_backup_20261006;
```

---

## Summary Matrix

| Step | Action | Safety Mechanism | Approval Required |
| :--- | :--- | :--- | :---: |
| **Phase 1** | Table snapshot + JSON export | Exact byte-count verification | Yes |
| **Phase 2** | Add `image_url` & `additional_image_urls` | Non-blocking additive DDL | Yes |
| **Phase 3** | Script dry-run simulation | `--dry-run` default, no DB writes | Yes |
| **Phase 4** | Script live execution | Single-row ID queries, HTTP 200 verification | Yes |
| **Phase 5** | Backend switch-over | Graceful fallback to legacy base64 | Yes |
| **Phase 6** | 7-day observation | Legacy data preserved in active rows | Yes |
| **Phase 7** | Null legacy base64 | Post-quarantine cleanup only | Yes |
