// Central analytics / Google Ads conversion helper.
//
// gtag.js itself (Google tag AW-18481077913) is installed in index.html.
//
// Conversion labels:
//  - addToCart keeps the existing label created for the "Add to cart" conversion action.
//  - purchase / lead default to that same label so current Google Ads reporting is not
//    disturbed. To give them their own conversion actions (recommended: purchase and lead
//    as Primary, add_to_cart as Secondary) create the actions in Google Ads and set
//    VITE_ADS_LABEL_PURCHASE / VITE_ADS_LABEL_LEAD / VITE_ADS_LABEL_CALL in the frontend
//    environment, e.g. "AW-18481077913/AbCdEfGhIjKl".
//  - Set VITE_GA4_ID (e.g. G-XXXXXXXXXX) to also send GA4 ecommerce events.

const ADS_ID = 'AW-18481077913';
const EXISTING_LABEL = `${ADS_ID}/_W70CKWVyIsdEJm9u-xE`;
const CURRENCY = 'USD';

const env = import.meta.env || {};
const LABELS = {
  addToCart: EXISTING_LABEL,
  purchase: env.VITE_ADS_LABEL_PURCHASE || EXISTING_LABEL,
  lead: env.VITE_ADS_LABEL_LEAD || EXISTING_LABEL,
  call: env.VITE_ADS_LABEL_CALL || ''
};

function gtagSafe(...args) {
  try {
    if (typeof window === 'undefined') return;
    if (typeof window.gtag === 'function') {
      window.gtag(...args);
    } else {
      // gtag.js has not defined its stub (e.g. blocked by an ad blocker): queue harmlessly
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(args);
    }
  } catch (err) {
    console.warn('Analytics error:', err);
  }
}

const toItem = (part, quantity) => ({
  item_id: String(part?.id ?? ''),
  item_name: part?.title || part?.name || '',
  price: Number(part?.price) || 0,
  quantity: quantity ?? Number(part?.quantity) ?? 1
});

const adsConversion = (label, params = {}) => {
  if (!label) return;
  gtagSafe('event', 'conversion', { send_to: label, ...params });
};

export function trackAddToCart(part) {
  if (!part) return;
  const item = toItem(part, 1);
  gtagSafe('event', 'add_to_cart', { currency: CURRENCY, value: item.price, items: [item] });
  adsConversion(LABELS.addToCart);
}

// Legacy behaviour: fire the existing shared conversion label with no extra data.
// Used by flows that have not been moved to the specific trackers below yet.
export function trackLegacyConversion() {
  adsConversion(EXISTING_LABEL);
}

export function trackBeginCheckout(cartItems = [], value = 0) {
  gtagSafe('event', 'begin_checkout', {
    currency: CURRENCY,
    value: Number(value) || 0,
    items: cartItems.map((p) => toItem(p, p.quantity))
  });
}

export function trackPurchase({ orderId, value = 0, items = [] }) {
  const total = Number(value) || 0;
  gtagSafe('event', 'purchase', {
    transaction_id: String(orderId),
    currency: CURRENCY,
    value: total,
    items: items.map((p) => toItem(p, p.quantity))
  });
  // transaction_id lets Google Ads de-duplicate a repeated conversion for the same order
  adsConversion(LABELS.purchase, { value: total, currency: CURRENCY, transaction_id: String(orderId) });
}

export function trackLead({ id, type = 'request', part }) {
  const value = Number(part?.price) || 0;
  gtagSafe('event', 'generate_lead', {
    currency: CURRENCY,
    value,
    lead_type: type,
    items: part ? [toItem(part, 1)] : []
  });
  adsConversion(LABELS.lead, id ? { transaction_id: String(id) } : {});
}

export function trackContactClick(method) {
  gtagSafe('event', 'contact', { method });
  adsConversion(LABELS.call);
}

export function initAnalytics() {
  if (typeof window === 'undefined') return;

  const ga4Id = env.VITE_GA4_ID;
  if (ga4Id) {
    gtagSafe('config', ga4Id);
  }

  // Track click-to-call and WhatsApp clicks anywhere on the page
  document.addEventListener(
    'click',
    (event) => {
      const link = event.target?.closest?.('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      if (href.startsWith('tel:')) trackContactClick('phone');
      else if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) trackContactClick('whatsapp');
    },
    { passive: true }
  );
}
