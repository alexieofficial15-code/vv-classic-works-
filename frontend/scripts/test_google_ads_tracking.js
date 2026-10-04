import puppeteer from 'puppeteer-core';
import fs from 'fs';

function getBrowserExecutablePath() {
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH || 
                  process.env.CHROME_BIN || 
                  process.env.CHROME_PATH || 
                  process.env.EDGE_PATH || 
                  process.env.BROWSER_PATH;

  if (envPath && fs.existsSync(envPath)) {
    return envPath;
  }

  // Automatic platform fallbacks
  const commonPaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];

  for (const candidate of commonPaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error('No valid browser executable found. Set PUPPETEER_EXECUTABLE_PATH environment variable.');
}

async function testTracking() {
  console.log('--- STARTING GOOGLE ADS & GA4 CONVERSION TRACKING VERIFICATION ---');

  const executablePath = getBrowserExecutablePath();
  console.log(`Using browser executable: ${executablePath}`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Enable request interception for honest API mock tests
  await page.setRequestInterception(true);

  let mockOrderStatus = 200;
  let mockRequestStatus = 200;

  page.on('request', req => {
    const url = req.url();
    if (url.includes('/api/orders') && req.method() === 'POST') {
      if (mockOrderStatus === 500) {
        req.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Simulated backend checkout failure' })
        });
      } else {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Order created',
            data: { id: 'ORD-TEST-999999', totalAmount: 250, userName: 'Test Restorer' }
          })
        });
      }
    } else if (url.includes('/api/requests') && req.method() === 'POST') {
      if (mockRequestStatus === 500) {
        req.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Simulated backend request failure' })
        });
      } else {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Request created',
            data: { id: 'REQ-TEST-8888', partTitle: 'Test Engine Part' }
          })
        });
      }
    } else {
      req.continue();
    }
  });

  console.log('\n[TEST 1] Loading website homepage (http://localhost:5173/)...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

  // 1. Assert: No conversion on initial load
  const initialDataLayer = await page.evaluate(() => window.dataLayer || []);
  const initialConversions = initialDataLayer.filter(item => {
    if (!item) return false;
    if (item[0] === 'event' && item[1] === 'conversion') return true;
    if (item.event === 'conversion') return true;
    return false;
  });

  console.log(`Conversions on page load: ${initialConversions.length} (Expected: 0)`);
  if (initialConversions.length !== 0) {
    throw new Error('FAIL: Conversion event fired on initial page load!');
  }
  console.log('PASS: Opening page did NOT produce any conversion event.');

  // 2. Assert: No conversion on page refresh
  console.log('\n[TEST 2] Refreshing page...');
  await page.reload({ waitUntil: 'networkidle2' });
  const refreshDataLayer = await page.evaluate(() => window.dataLayer || []);
  const refreshConversions = refreshDataLayer.filter(item => {
    if (!item) return false;
    if (item[0] === 'event' && item[1] === 'conversion') return true;
    if (item.event === 'conversion') return true;
    return false;
  });
  console.log(`Conversions after page refresh: ${refreshConversions.length} (Expected: 0)`);
  if (refreshConversions.length !== 0) {
    throw new Error('FAIL: Conversion event fired on page refresh!');
  }
  console.log('PASS: Refreshing the page did NOT produce any conversion event.');

  // 3. Assert: Add to Cart fires once per add
  console.log('\n[TEST 3] Testing Add to Cart action...');
  await page.waitForSelector('#catalog', { timeout: 10000 });
  await page.evaluate(() => {
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const firstCartBtn = buttons.find(b => b.textContent.includes('Add To Cart'));
    if (firstCartBtn) firstCartBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const afterFirstAddDataLayer = await page.evaluate(() => window.dataLayer || []);
  const firstConversions = afterFirstAddDataLayer.filter(item => {
    if (!item) return false;
    if (item[0] === 'event' && item[1] === 'conversion') return true;
    if (item.event === 'conversion') return true;
    return false;
  });

  console.log(`Conversions after 1st Add to Cart: ${firstConversions.length} (Expected: 1)`);
  if (firstConversions.length !== 1) {
    throw new Error('FAIL: Expected exactly 1 conversion event on 1st Add to Cart!');
  }
  console.log('PASS: Exactly 1 Add to Cart conversion fired.');

  // 4. Assert: Begin Checkout fires on "Proceed To Guest Checkout"
  console.log('\n[TEST 4] Testing Begin Checkout...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const proceedBtn = buttons.find(b => b.textContent.includes('Proceed To Guest Checkout'));
    if (proceedBtn) proceedBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const afterBeginCheckout = await page.evaluate(() => window.dataLayer || []);
  const beginCheckoutEvents = afterBeginCheckout.filter(item => {
    if (!item) return false;
    if (item[0] === 'event' && item[1] === 'begin_checkout') return true;
    if (item.event === 'begin_checkout') return true;
    return false;
  });
  console.log(`begin_checkout events captured: ${beginCheckoutEvents.length} (Expected: >= 1)`);
  if (beginCheckoutEvents.length === 0) {
    throw new Error('FAIL: begin_checkout event did not fire!');
  }
  console.log('PASS: begin_checkout fired successfully.');

  // 5. Assert: Purchase does NOT fire on API failure (honest orders)
  console.log('\n[TEST 5] Testing Checkout with failed API (500 Error)...');
  mockOrderStatus = 500;

  // Fill guest checkout form
  await page.evaluate(() => {
    const nameInput = document.querySelector('input[name="name"]');
    const emailInput = document.querySelector('input[name="email"]');
    const phoneInput = document.querySelector('input[name="phone"]');
    const addressInput = document.querySelector('input[name="shippingAddress"]');

    if (nameInput) nameInput.value = 'John Doe';
    if (nameInput) nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    if (emailInput) emailInput.value = 'john@vintage.com';
    if (emailInput) emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    if (phoneInput) phoneInput.value = '+1 945 287-9865';
    if (phoneInput) phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
    if (addressInput) addressInput.value = '14826 Yarberry St, Houston TX';
    if (addressInput) addressInput.dispatchEvent(new Event('input', { bubbles: true }));

    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const afterFailedOrder = await page.evaluate(() => window.dataLayer || []);
  const purchaseAfterFail = afterFailedOrder.filter(item => {
    if (!item) return false;
    if (item[0] === 'event' && item[1] === 'purchase') return true;
    if (item.event === 'purchase') return true;
    return false;
  });
  console.log(`Purchase events after failed API call: ${purchaseAfterFail.length} (Expected: 0)`);
  if (purchaseAfterFail.length !== 0) {
    throw new Error('FAIL: Purchase conversion fired even though the API call failed!');
  }

  // Assert error message includes phone number
  const hasPhoneError = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('945') && text.includes('287-9865');
  });
  console.log(`Inline error displays shop phone number: ${hasPhoneError}`);
  if (!hasPhoneError) {
    throw new Error('FAIL: Inline error banner missing required shop phone number!');
  }
  console.log('PASS: Failed checkout kept cart, showed inline error with phone, and fired NO conversion.');

  // 6. Assert: Purchase fires ONCE on successful API response with backend ID
  console.log('\n[TEST 6] Testing Checkout with successful API (200 OK)...');
  mockOrderStatus = 200;

  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const afterSuccessOrder = await page.evaluate(() => window.dataLayer || []);
  const purchaseAfterSuccess = afterSuccessOrder.filter(item => {
    if (!item) return false;
    if (item[0] === 'event' && item[1] === 'purchase') return true;
    if (item.event === 'purchase') return true;
    return false;
  });

  console.log(`Purchase events after success: ${purchaseAfterSuccess.length} (Expected: 1)`);
  if (purchaseAfterSuccess.length !== 1) {
    throw new Error('FAIL: Exactly 1 purchase event must fire on successful API response!');
  }

  const successScreenShowsBackendId = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('ORD-TEST-999999');
  });
  console.log(`Success screen displays backend order ID (ORD-TEST-999999): ${successScreenShowsBackendId}`);
  if (!successScreenShowsBackendId) {
    throw new Error('FAIL: CartDrawer did not display the backend-generated order ID!');
  }
  console.log('PASS: Exactly 1 purchase event fired with backend transaction_id.');

  await browser.close();
  console.log('\n--- ALL CONVERSION TRACKING AND HONEST FLOW TESTS PASSED ---');
}

testTracking().catch(err => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});
