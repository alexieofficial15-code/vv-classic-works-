import dotenv from 'dotenv';
dotenv.config();

import app from '../app.js';
import http from 'http';
import { dbService, invalidatePartsCache, supabase, mapLightPartFromDb } from '../config/supabase.js';

async function runVerification() {
  console.log('===========================================================');
  console.log('⚡ STEP 8 VERIFICATION: Catalog Performance & Single-Flight');
  console.log('===========================================================');

  // 1. Start server on dynamic port for realistic HTTP verification
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`✓ Test backend server running on port ${port}`);

  // 2. Instrument Supabase query counter
  let dbQueryCount = 0;
  const originalFrom = supabase.from.bind(supabase);
  supabase.from = function (table) {
    const builder = originalFrom(table);
    const originalSelect = builder.select.bind(builder);
    builder.select = function (...args) {
      if (table === 'spare_parts') {
        dbQueryCount++;
      }
      return originalSelect(...args);
    };
    return builder;
  };

  // 3. Invalidate cache to ensure cold start
  invalidatePartsCache();

  // 4. Fire 10 parallel /api/catalog requests simultaneously
  console.log('\n🚀 Firing 10 concurrent requests to /api/catalog...');
  const startTime = performance.now();

  const fetchPromises = Array.from({ length: 10 }, async (_, i) => {
    const res = await fetch(`http://localhost:${port}/api/catalog`, {
      headers: { 'Accept': 'application/json' }
    });
    const text = await res.text();
    return {
      status: res.status,
      sizeBytes: Buffer.byteLength(text, 'utf8'),
      data: JSON.parse(text)
    };
  });

  const results = await Promise.all(fetchPromises);
  const totalDuration = performance.now() - startTime;

  // 5. Evaluate Single-Flight & Performance Targets
  const firstResult = results[0];
  const catalogSizeKB = (firstResult.sizeBytes / 1024).toFixed(2);
  const durationSec = (totalDuration / 1000).toFixed(3);
  const partsCount = firstResult.data?.count || (firstResult.data?.data?.length) || 0;

  console.log(`\n📊 RESULTS:`);
  console.log(`- 10 Parallel Requests Status: ${results.every(r => r.status === 200) ? 'ALL 200 OK' : 'FAILED'}`);
  console.log(`- Database Reads for 10 Parallel Requests: ${dbQueryCount} (Target: exactly 1)`);
  console.log(`- Catalog Payload Size: ${catalogSizeKB} KB (Target: < 200 KB)`);
  console.log(`- Total Parallel Fetch Time: ${durationSec} s (${totalDuration.toFixed(1)} ms, Target: < 1.0 s)`);
  console.log(`- Total Parts Returned: ${partsCount}`);

  // Assertions
  if (dbQueryCount === 1) {
    console.log('✅ Single-flight PASSED: Exactly 1 database query was made for 10 concurrent callers.');
  } else {
    console.error(`❌ Single-flight FAILED: ${dbQueryCount} queries made instead of 1.`);
  }

  if (parseFloat(catalogSizeKB) < 200) {
    console.log('✅ Catalog size PASSED (< 200 KB).');
  } else {
    console.warn('⚠️ Catalog size exceeds 200 KB target.');
  }

  if (totalDuration < 1000) {
    console.log('✅ Response time PASSED (< 1.0 s).');
  } else {
    console.warn('⚠️ Response time exceeds 1.0 s target.');
  }

  // 6. Verify Photo Counters & Specs Panel for 1 photo and 3 photos
  console.log('\n🖼️ VERIFYING PHOTO COUNTERS & SPECS PANEL:');

  const sampleRow1 = {
    id: 'test-part-1-photo',
    title: 'Vintage Cylinder Head (Single Photo)',
    image: '/pictures/WhatsApp Image 2026-08-05 at 1.10.06 PM.jpeg',
    image_count: 1,
    specifications: [
      { key: 'Material', value: 'Cast Aluminum' },
      { key: 'Valve Size', value: '40mm x 35.5mm' }
    ]
  };

  const part1 = mapLightPartFromDb(sampleRow1);
  console.log(`\nPart with 1 Photo:`);
  console.log(`- Main image: ${part1.image}`);
  console.log(`- Additional images count: ${part1.additionalImages.length} (Expected: 1)`);
  console.log(`- imageCount property: ${part1.imageCount}`);
  console.log(`- Specs preserved: ${part1.specifications.length} items (${part1.specifications.map(s => s.key).join(', ')})`);

  const sampleRow3 = {
    id: 'test-part-3-photos',
    title: 'Complete 2276cc Turbo Engine (3 Photos)',
    image: '/pictures/WhatsApp Image 2026-08-05 at 1.10.06 PM.jpeg',
    image_count: 3,
    specifications: [
      { key: 'Displacement', value: '2276cc' },
      { key: 'Cooling', value: 'Porsche 911 Upright Fan' },
      { key: '__meta', value: '{"additionalImages":["/api/parts/test-part-3-photos/image/a0","/api/parts/test-part-3-photos/image/a1"]}' }
    ]
  };

  const part3 = mapLightPartFromDb(sampleRow3);
  console.log(`\nPart with 3 Photos:`);
  console.log(`- Main image: ${part3.image}`);
  console.log(`- Additional images list:`, part3.additionalImages);
  console.log(`- Additional images count: ${part3.additionalImages.length} (Expected: 3)`);
  console.log(`- imageCount property: ${part3.imageCount}`);
  console.log(`- Specs preserved without __meta: ${part3.specifications.length} items (${part3.specifications.map(s => s.key).join(', ')})`);

  const photo1Pass = part1.additionalImages.length === 1 && part1.imageCount === 1;
  const photo3Pass = part3.additionalImages.length === 3 && part3.imageCount === 3 && !part3.specifications.some(s => s.key === '__meta');

  if (photo1Pass && photo3Pass) {
    console.log('\n✅ Specs panel and photo counters for 1-photo and 3-photo parts PASSED!');
  } else {
    console.error('\n❌ Photo counter or specs verification FAILED.');
  }

  // 7. Test Admin Protection on GET /api/admin/parts & /api/admin/cars
  console.log('\n🔒 VERIFYING ADMIN ROUTE AUTHENTICATION:');
  const unauthParts = await fetch(`http://localhost:${port}/api/admin/parts`);
  const unauthCars = await fetch(`http://localhost:${port}/api/admin/cars`);
  console.log(`- GET /api/admin/parts without token: Status ${unauthParts.status} (Expected: 401)`);
  console.log(`- GET /api/admin/cars without token: Status ${unauthCars.status} (Expected: 401)`);

  server.close();
  console.log('\n✓ Server stopped. All Step 8 verifications complete.');
}

runVerification().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
