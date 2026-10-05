import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

import { SPARE_PARTS } from '../src/data/partsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 5188;

async function run() {
  console.log('--- Starting Dead API Conversion & Error Test ---');

  // Start vite dev server with dead host API
  const vite = spawn('npx.cmd', ['vite', '--port', String(PORT), '--strictPort'], {
    cwd: rootDir,
    env: { ...process.env, VITE_API_URL: 'http://127.0.0.1:9999' },
    stdio: 'pipe',
    shell: true
  });

  vite.stdout.on('data', (d) => {
    // console.log('[Vite]', d.toString());
  });
  vite.stderr.on('data', (d) => {
    // console.error('[Vite err]', d.toString());
  });

  // Wait for server to be up
  await new Promise((resolve) => setTimeout(resolve, 3500));

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: EDGE_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    // Track conversions
    await page.evaluateOnNewDocument(() => {
      window.__conversionsFired = [];
      window.__alertsTriggered = [];
      window.alert = (msg) => {
        window.__alertsTriggered.push(msg);
      };
      const origGtag = window.gtag;
      window.gtag = function(...args) {
        if (args[0] === 'event' && (args[1] === 'conversion' || args[1] === 'purchase' || args[1] === 'generate_lead')) {
          window.__conversionsFired.push(args);
        }
        if (origGtag) origGtag.apply(this, args);
      };
    });

    // Intercept requests: return authentic parts for catalog rendering, block requests & orders
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/api/catalog') || url.includes('/api/admin/parts') || url.includes('/api/parts')) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: SPARE_PARTS
          })
        });
      } else if (url.includes('/api/requests') || url.includes('/api/orders')) {
        // Dead API simulation: abort / network failure
        req.abort('failed');
      } else {
        req.continue();
      }
    });

    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle2' });
    console.log('Loaded homepage with blocked API endpoints');

    // TEST 1: Guest Reservation
    console.log('\n--- Testing Guest Reservation with dead API ---');
    // Wait for catalog parts to load
    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent && b.textContent.trim().includes('Reserve'));
    }, { timeout: 15000 });

    // Click "Reserve" button on the first product card
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const reserve = btns.find(b => b.textContent && b.textContent.trim().includes('Reserve'));
      if (reserve) reserve.click();
    });

    // Check modal appears
    await page.waitForSelector('input[name="name"]', { timeout: 3000 });
    console.log('Guest Reservation modal opened.');

    // Fill form
    await page.type('input[placeholder*="Michael Schmidt"]', 'John DeadHost Tester');
    await page.type('input[placeholder="name@email.com"]', 'tester@example.com');
    await page.type('input[placeholder="+1 (555) 019-2834"]', '+15551234567');
    await page.type('input[placeholder*="Austin"]', 'Austin, TX');

    // Submit form
    const submitResBtn = await page.$('button[type="submit"]');
    await submitResBtn.click();
    console.log('Submitted guest reservation...');

    // Wait for submission failure
    await page.waitForFunction(() => {
      return document.body.innerText.includes("We couldn't send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865.");
    }, { timeout: 5000 });
    console.log('PASS: Guest reservation displays inline red error: "We couldn\'t send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865."');

    // Check form inputs preserved
    const nameVal = await page.$eval('input[placeholder*="Michael Schmidt"]', el => el.value);
    if (nameVal !== 'John DeadHost Tester') {
      throw new Error(`Customer form data was lost! Got: "${nameVal}"`);
    }
    console.log('PASS: Customer form data was preserved upon API failure.');

    // TEST 2: Checkout Handler with dead API
    console.log('\n--- Testing handleProceedToCheckout with dead API ---');
    const checkoutResult = await page.evaluate(async () => {
      try {
        window.__appTestHandlers.setCartItems([
          { id: 'part-test-101', title: 'Vintage Solex 34 PICT-3 Carburetor', price: 245, quantity: 1 }
        ]);
        await window.__appTestHandlers.handleProceedToCheckout({
          name: 'Jane Checkout Tester',
          email: 'jane@checkout.com',
          phone: '+15559876543',
          shippingAddress: '123 Aircooled Way, Los Angeles, CA'
        });
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    });

    console.log('Checkout result:', checkoutResult);
    if (checkoutResult.success || !checkoutResult.error.includes("We couldn't send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865.")) {
      throw new Error(`FAIL: Expected exact error string but got: ${JSON.stringify(checkoutResult)}`);
    }
    console.log('PASS: handleProceedToCheckout rejected with exact error: "We couldn\'t send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865."');

    // TEST 3: Logged-in Reserve Item with dead API
    console.log('\n--- Testing Member handleReserveItem with dead API ---');
    await page.evaluate(() => {
      localStorage.setItem('currentUser', JSON.stringify({ id: 'user-123', name: 'Member Restorer', email: 'member@aircooled.com' }));
      localStorage.setItem('authToken', 'mock-jwt-token');
    });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    await page.evaluate(async () => {
      await window.__appTestHandlers.handleReserveItem({
        id: 'part-test-101',
        title: 'Vintage Solex 34 PICT-3 Carburetor',
        price: 245
      });
    });

    await page.waitForFunction(() => {
      return document.body.innerText.includes("We couldn't send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865.");
    }, { timeout: 5000 });
    console.log('PASS: Member Reserve displays global inline banner error: "We couldn\'t send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865."');

    // TEST 4: Logged-in Request Item with dead API
    console.log('\n--- Testing Member handleRequestItem with dead API ---');
    await page.evaluate(async () => {
      window.__appTestHandlers.setActionStatus(null);
      await window.__appTestHandlers.handleRequestItem({
        id: 'part-test-102',
        title: 'Vintage Bosch 009 Distributor',
        price: 185
      });
    });

    await page.waitForFunction(() => {
      return document.body.innerText.includes("We couldn't send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865.");
    }, { timeout: 5000 });
    console.log('PASS: Member Request displays global inline banner error: "We couldn\'t send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865."');

    // Check conversions fired
    const conversions = await page.evaluate(() => window.__conversionsFired);
    const alerts = await page.evaluate(() => window.__alertsTriggered);

    console.log('\n--- Conversion & Alert Audit ---');
    console.log('Conversions fired:', conversions);
    console.log('Alert() popups triggered:', alerts);

    if (conversions.length > 0) {
      throw new Error(`FAIL: Fake conversions were fired: ${JSON.stringify(conversions)}`);
    }
    console.log('PASS: ZERO conversions fired when API is blocked/dead host.');

    if (alerts.length > 0) {
      throw new Error(`FAIL: alert() was called: ${JSON.stringify(alerts)}`);
    }
    console.log('PASS: ZERO alert() popups triggered.');

    console.log('\n====================================');
    console.log('ALL TESTS PASSED SUCCESSFULLY!');
    console.log('====================================');
  } finally {
    if (browser) await browser.close();
    vite.kill();
  }
}

run().catch((err) => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});
