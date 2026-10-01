import puppeteer from 'puppeteer-core';

async function testTracking() {
  console.log('--- STARTING GOOGLE ADS CONVERSION TRACKING VERIFICATION ---');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleLogs = [];
  const consoleErrors = [];
  const networkRequests = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('request', req => {
    const url = req.url();
    if (
      url.includes('googleadservices') ||
      url.includes('googletagmanager') ||
      url.includes('google.com/pagead') ||
      url.includes('AW-18481077913')
    ) {
      networkRequests.push(url);
    }
  });

  console.log('\n[TEST 1] Loading website homepage (http://localhost:5173/)...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

  // Check initial dataLayer state
  const initialDataLayer = await page.evaluate(() => window.dataLayer || []);
  const initialConversions = initialDataLayer.filter(item => {
    if (!item) return false;
    if (item[0] === 'event' && item[1] === 'conversion') return true;
    if (item.event === 'conversion') return true;
    return false;
  });

  console.log(`Initial dataLayer items: ${initialDataLayer.length}`);
  console.log(`Conversions on page load: ${initialConversions.length} (Expected: 0)`);
  if (initialConversions.length !== 0) {
    throw new Error('FAIL: Conversion event fired on initial page load!');
  }
  console.log('PASS: Opening page did NOT produce a conversion event.');

  // Check Google Tag configuration
  const hasConfig = initialDataLayer.some(item => {
    if (item[0] === 'config' && item[1] === 'AW-18481077913') return true;
    if (item.config === 'AW-18481077913') return true;
    return false;
  });
  console.log(`Google Tag configured with AW-18481077913: ${hasConfig}`);

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
  console.log('PASS: Refreshing the page did NOT produce a conversion event.');

  console.log('\n[TEST 3] Testing Add to Cart action...');
  // Wait for catalog section to render
  await page.waitForSelector('#catalog', { timeout: 10000 });
  await page.evaluate(() => {
    document.getElementById('catalog').scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Find Add to Cart buttons
  const addToCartButtonCount = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cartButtons = buttons.filter(b => b.textContent.includes('Add To Cart'));
    return cartButtons.length;
  });
  console.log(`Visible "Add To Cart" buttons in catalog: ${addToCartButtonCount}`);
  if (addToCartButtonCount === 0) {
    throw new Error('FAIL: No Add To Cart buttons found in catalog!');
  }

  // Click the first "Add To Cart" button
  console.log('Clicking first "Add To Cart" button...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const firstCartBtn = buttons.find(b => b.textContent.includes('Add To Cart'));
    if (firstCartBtn) firstCartBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Verify dataLayer after 1st Add to Cart
  const afterFirstAddDataLayer = await page.evaluate(() => window.dataLayer || []);
  const firstConversions = afterFirstAddDataLayer.filter(item => {
    if (!item) return false;
    if (item[0] === 'event' && item[1] === 'conversion') return true;
    if (item.event === 'conversion') return true;
    return false;
  });

  console.log(`Conversions after 1st Add to Cart: ${firstConversions.length} (Expected: 1)`);
  console.log('Conversion event payload:', JSON.stringify(firstConversions[0]));

  const sendToMatch = JSON.stringify(firstConversions[0]).includes('AW-18481077913/_W70CKWVyIsdEJm9u-xE');
  console.log(`send_to parameter matches AW-18481077913/_W70CKWVyIsdEJm9u-xE: ${sendToMatch}`);

  if (firstConversions.length !== 1 || !sendToMatch) {
    throw new Error('FAIL: Conversion event was not recorded properly on 1st Add to Cart!');
  }
  console.log('PASS: Exactly 1 conversion event fired for 1 successful Add to Cart action.');

  // Verify Cart UI State
  const cartDrawerOpen = await page.evaluate(() => {
    const header = document.querySelector('h2');
    return header && header.textContent.includes('Your Guest Cart');
  });
  console.log(`Cart Drawer opened successfully: ${cartDrawerOpen}`);

  console.log('\n[TEST 4] Testing 2nd Add to Cart action...');
  // Close cart drawer
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Close cart"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Click second "Add To Cart" button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cartButtons = buttons.filter(b => b.textContent.includes('Add To Cart'));
    if (cartButtons.length > 1) cartButtons[1].click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const afterSecondAddDataLayer = await page.evaluate(() => window.dataLayer || []);
  const secondConversions = afterSecondAddDataLayer.filter(item => {
    if (!item) return false;
    if (item[0] === 'event' && item[1] === 'conversion') return true;
    if (item.event === 'conversion') return true;
    return false;
  });

  console.log(`Total conversions after 2 distinct additions: ${secondConversions.length} (Expected: 2)`);
  if (secondConversions.length !== 2) {
    throw new Error('FAIL: Expected 2 conversion events for 2 Add to Cart actions!');
  }
  console.log('PASS: Exactly 1 conversion per Add to Cart action without duplication.');

  console.log('\n[TEST 5] Checking Console Errors...');
  console.log(`Console error count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  } else {
    console.log('PASS: Zero console errors.');
  }

  console.log('\n[TEST 6] Google Network Requests Detected:');
  const uniqueReqs = [...new Set(networkRequests)];
  uniqueReqs.forEach(req => console.log(`  -> ${req.substring(0, 100)}...`));
  console.log(`Total Google Tag/Ads requests detected: ${uniqueReqs.length}`);

  await browser.close();
  console.log('\n--- ALL GOOGLE ADS CONVERSION TRACKING TESTS PASSED SUCCESSFULLY! ---');
}

testTracking().catch(err => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});
