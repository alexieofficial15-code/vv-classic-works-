/**
 * Google Ads & GA4 Analytics Module
 * 
 * - Dual tracking: Google Ads conversions + standard GA4 e-commerce events
 * - Safe wrappers around window.gtag (never throws; queues to dataLayer if not loaded)
 * - Purchase conversion optimized for Google Merchant Center / Shopping campaigns
 * - Add-to-cart tracked as secondary/reporting event to prevent skewing bidding
 * - Product reservations and parts requests tracked as "lead" events, NEVER purchases
 * - Deduplication via transaction_id + sessionStorage guard to prevent re-render/refresh double firing
 * - Merchant Center linkage: part.id (spare_parts.id) passed as item id
 */

export const GADS_AW_ID = 'AW-18481077913';
export const DEFAULT_PURCHASE_LABEL = 'REPLACE_WITH_PURCHASE_LABEL';
const DEFAULT_ADD_TO_CART_LABEL = '_W70CKWVyIsdEJm9u-xE';

/**
 * Normalizes a Google Ads conversion label:
 * If given just the label (e.g. "AbCdEfGhIjK"), prefixes with "AW-18481077913/".
 * If given full send_to (e.g. "AW-18481077913/AbCdEfGhIjK"), preserves it as-is.
 */
export function resolveGoogleAdsSendTo(labelOrSendTo, fallbackLabel = '') {
  const val = (labelOrSendTo || '').trim() || fallbackLabel;
  if (!val) return '';
  if (val.startsWith('AW-')) {
    return val;
  }
  return `${GADS_AW_ID}/${val}`;
}

// 1. Add-to-Cart Conversion Label (Secondary / Reporting conversion)
const rawAddToCartConfig = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GADS_ADD_TO_CART_LABEL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADS_LABEL_ADD_TO_CART) ||
  DEFAULT_ADD_TO_CART_LABEL;
export const ADS_LABEL_ADD_TO_CART = resolveGoogleAdsSendTo(rawAddToCartConfig, DEFAULT_ADD_TO_CART_LABEL);

// 2. Purchase Conversion Label (Primary conversion for Google Ads Shopping & bidding)
// Read from VITE_GADS_PURCHASE_LABEL with clear placeholder
const rawPurchaseConfig = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GADS_PURCHASE_LABEL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADS_LABEL_PURCHASE) ||
  DEFAULT_PURCHASE_LABEL;
export const ADS_LABEL_PURCHASE = resolveGoogleAdsSendTo(rawPurchaseConfig, DEFAULT_PURCHASE_LABEL);

// 3. Lead Conversion Label (Optional - for reservation & request leads)
const rawLeadConfig = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GADS_LEAD_LABEL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADS_LABEL_LEAD) ||
  '';
export const ADS_LABEL_LEAD = rawLeadConfig ? resolveGoogleAdsSendTo(rawLeadConfig, '') : null;

// 4. Call Conversion Label (Optional - for phone taps)
export const ADS_LABEL_CALL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADS_LABEL_CALL) || null;

/**
 * Safe invocation of Google gtag function.
 */
export function safeGtag(...args) {
  if (typeof window === 'undefined') return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag(...args);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(args);
    }
  } catch (err) {
    console.warn('Analytics event dispatch note:', err);
  }
}

/**
 * Sanitize image to ensure data: URIs (base64) are NEVER sent to the API or stored
 */
export function sanitizeImage(img) {
  if (!img || typeof img !== 'string') return null;
  const trimmed = img.trim();
  if (trimmed.startsWith('data:')) return null;
  if (/^(https?:\/\/|\/|\.\/)/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Format a sanitized order item with only allowed attributes and safe image URL.
 * Preserves spare_parts.id so product-level reporting links with Google Merchant Center.
 */
export function sanitizeOrderItem(item) {
  const cleanImage = sanitizeImage(item.image);
  const clean = {
    id: item.id,
    title: item.title,
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
    sku: item.sku || item.oemNumber || 'GENUINE',
    oemNumber: item.oemNumber || item.sku || 'GENUINE',
    category: item.category || item.systemCategory || 'Spare Parts'
  };
  if (cleanImage) {
    clean.image = cleanImage;
  }
  return clean;
}

/**
 * Format a part item for GA4 and Google Ads e-commerce items array.
 * CRITICAL: item_id and id MUST match spare_parts.id (the ID used in Google Merchant Center feed).
 */
export function formatItem(part, qty = 1) {
  if (!part) return {};
  const itemId = String(part.id || '');
  const itemName = String(part.title || part.name || 'Air-Cooled VW Part');
  const price = Number(part.price || 0);
  const category = String(part.category || part.systemCategory || 'Spare Parts');
  const quantity = Number(qty || part.quantity || 1);

  return {
    id: itemId,               // Standard Merchant Center product ID linkage
    item_id: itemId,          // GA4 standard item ID
    name: itemName,
    item_name: itemName,      // GA4 standard item name
    price: price,
    item_category: category,
    quantity: quantity
  };
}

/**
 * Deduplication storage to guard against double-firing on re-renders,
 * multiple clicks, or page refresh.
 */
const trackedPurchaseOrders = new Set();
const trackedLeads = new Set();

export function isOrderAlreadyTracked(orderId) {
  if (!orderId) return true;
  const key = `gads_purchase_tracked_${orderId}`;
  if (trackedPurchaseOrders.has(String(orderId))) {
    return true;
  }
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (sessionStorage.getItem(key)) {
        return true;
      }
    }
  } catch {
    // sessionStorage not available (e.g. private browsing storage disabled)
  }
  return false;
}

export function markOrderAsTracked(orderId) {
  if (!orderId) return;
  const strId = String(orderId);
  trackedPurchaseOrders.add(strId);
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(`gads_purchase_tracked_${strId}`, '1');
    }
  } catch {}
}

export function isLeadAlreadyTracked(leadId) {
  if (!leadId) return false;
  const strId = String(leadId);
  if (trackedLeads.has(strId)) return true;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (sessionStorage.getItem(`gads_lead_tracked_${strId}`)) return true;
    }
  } catch {}
  return false;
}

export function markLeadAsTracked(leadId) {
  if (!leadId) return;
  const strId = String(leadId);
  trackedLeads.add(strId);
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(`gads_lead_tracked_${strId}`, '1');
    }
  } catch {}
}

/**
 * Track Add to Cart event.
 * Keeps existing conversion for reporting/secondary observation while sending
 * standard GA4 add_to_cart so it does not drive bidding away from purchases.
 */
export function trackAddToCart(part) {
  if (!part || !part.id) return;
  const price = Number(part.price || 0);
  const formattedItem = formatItem(part, 1);

  // 1. GA4 Standard Event (e-commerce event for reporting)
  safeGtag('event', 'add_to_cart', {
    currency: 'USD',
    value: price,
    items: [formattedItem]
  });

  // 2. Google Ads Conversion Event (Secondary/Reporting conversion)
  safeGtag('event', 'conversion', {
    send_to: ADS_LABEL_ADD_TO_CART,
    value: price,
    currency: 'USD',
    items: [formattedItem]
  });
}

/**
 * Track Begin Checkout event (GA4 begin_checkout)
 */
export function trackBeginCheckout(items = [], total = 0) {
  safeGtag('event', 'begin_checkout', {
    currency: 'USD',
    value: Number(total || 0),
    items: items.map(item => formatItem(item, item.quantity || 1))
  });
}

/**
 * Track Purchase event on verified backend order confirmation.
 * Fires ONCE only after successful backend response (res.ok && data.success && data.data.id).
 *
 * Sends:
 * 1) Google Ads conversion with send_to 'AW-18481077913/<PURCHASE_LABEL>', value, currency, transaction_id
 * 2) GA4 purchase event with items[] (id, name, price, quantity)
 */
export function trackPurchase({ orderId, value, items = [] }) {
  if (!orderId) {
    console.warn('[Analytics] trackPurchase called without orderId. Ignored.');
    return;
  }

  // Guard against refresh or re-render double-firing
  if (isOrderAlreadyTracked(orderId)) {
    console.info(`[Analytics] Purchase for order ${orderId} already tracked. Skipping duplicate.`);
    return;
  }

  const numValue = Number(value || 0);
  const formattedItems = items.map(item => formatItem(item, item.quantity || 1));

  // 1. Google Ads Primary Purchase Conversion
  safeGtag('event', 'conversion', {
    send_to: ADS_LABEL_PURCHASE,
    value: numValue,
    currency: 'USD',
    transaction_id: String(orderId)
  });

  // 2. GA4 Standard E-commerce Purchase Event with Merchant Center matched items
  safeGtag('event', 'purchase', {
    transaction_id: String(orderId),
    value: numValue,
    currency: 'USD',
    items: formattedItems
  });

  // Mark as tracked in memory + sessionStorage
  markOrderAsTracked(orderId);
}

/**
 * Track Lead event (Parts Request or Product Hold Reservation).
 * Treats "Reserve Product" (no payment) as a separate "lead" event, NEVER a purchase.
 */
export function trackLead({ id, type = 'request', part = null, value = 0 }) {
  if (id && isLeadAlreadyTracked(id)) {
    console.info(`[Analytics] Lead ${id} already tracked. Skipping duplicate.`);
    return;
  }

  const numValue = Number(value || part?.price || 0);
  const formattedItems = part ? [formatItem(part, 1)] : [];

  // 1. GA4 Standard Event: generate_lead (NOT purchase)
  safeGtag('event', 'generate_lead', {
    transaction_id: String(id || ''),
    lead_type: type,
    value: numValue,
    currency: 'USD',
    items: formattedItems
  });

  // 2. Google Ads Lead Conversion (only if a distinct lead label is configured)
  if (ADS_LABEL_LEAD && ADS_LABEL_LEAD.trim() !== '' && !ADS_LABEL_LEAD.includes('REPLACE_WITH_')) {
    safeGtag('event', 'conversion', {
      send_to: ADS_LABEL_LEAD.trim(),
      transaction_id: String(id || ''),
      value: numValue,
      currency: 'USD'
    });
  }

  if (id) {
    markLeadAsTracked(id);
  }
}

/**
 * Track Contact Click event (Telephone tap or WhatsApp message)
 */
export function trackContactClick(channel = 'phone') {
  // 1. GA4 Event
  safeGtag('event', 'contact', {
    method: channel,
    event_category: 'engagement',
    event_label: channel
  });

  // 2. Google Ads Conversion for Calls (only if explicitly configured with valid label)
  if (channel === 'phone' && ADS_LABEL_CALL && ADS_LABEL_CALL.trim() !== '') {
    safeGtag('event', 'conversion', {
      send_to: ADS_LABEL_CALL.trim()
    });
  }
}

/**
 * Global click delegation listener for tel: and whatsapp links
 */
export function initAnalyticsListeners() {
  if (typeof window === 'undefined') return;

  // Initialize optional GA4 property if provided
  const ga4Id = import.meta.env.VITE_GA4_ID;
  if (ga4Id && ga4Id.trim()) {
    safeGtag('config', ga4Id.trim());
  }

  // Expose global helper function for Tag Assistant and manual testing
  window.gtag_report_purchase = (orderData) => trackPurchase(orderData);

  // Delegated click listener on document for telephone and WhatsApp links
  document.addEventListener('click', (event) => {
    const anchor = event.target?.closest?.('a');
    if (!anchor || !anchor.href) return;

    const href = anchor.href;
    if (href.startsWith('tel:')) {
      trackContactClick('phone');
    } else if (href.includes('wa.me') || href.includes('api.whatsapp.com')) {
      trackContactClick('whatsapp');
    }
  }, { passive: true });
}
