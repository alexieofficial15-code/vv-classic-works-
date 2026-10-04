/**
 * Google Ads & GA4 Analytics Module
 * 
 * - Safe wrappers around window.gtag (never throw; queues to dataLayer if needed)
 * - Configurable conversion labels from environment variables with safe fallbacks
 * - GA4 standard e-commerce & lead events
 * - Delegated click tracking for telephone (tel:) and WhatsApp links
 */

const DEFAULT_ADS_LABEL = 'AW-18481077913/_W70CKWVyIsdEJm9u-xE';

export const ADS_LABEL_ADD_TO_CART = DEFAULT_ADS_LABEL;
export const ADS_LABEL_PURCHASE = import.meta.env.VITE_ADS_LABEL_PURCHASE || DEFAULT_ADS_LABEL;
export const ADS_LABEL_LEAD = import.meta.env.VITE_ADS_LABEL_LEAD || DEFAULT_ADS_LABEL;
export const ADS_LABEL_CALL = import.meta.env.VITE_ADS_LABEL_CALL || null;

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
 * Format a sanitized order item with only allowed attributes and safe image URL
 */
export function sanitizeOrderItem(item) {
  const cleanImage = sanitizeImage(item.image);
  const clean = {
    id: item.id,
    title: item.title,
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
    sku: item.sku || item.oemNumber || 'GENUINE',
    oemNumber: item.oemNumber || item.sku || 'GENUINE'
  };
  if (cleanImage) {
    clean.image = cleanImage;
  }
  return clean;
}

/**
 * Format a part item for GA4 e-commerce payload
 */
function formatItem(part, qty = 1) {
  if (!part) return {};
  return {
    item_id: String(part.id || ''),
    item_name: String(part.title || 'Air-Cooled VW Part'),
    price: Number(part.price || 0),
    item_category: String(part.category || part.systemCategory || 'Spare Parts'),
    quantity: Number(qty || 1)
  };
}

/**
 * Track Add to Cart event (GA4 add_to_cart + Google Ads conversion)
 */
export function trackAddToCart(part) {
  if (!part) return;
  const price = Number(part.price || 0);

  // 1. GA4 Standard Event
  safeGtag('event', 'add_to_cart', {
    currency: 'USD',
    value: price,
    items: [formatItem(part, 1)]
  });

  // 2. Google Ads Conversion Event
  safeGtag('event', 'conversion', {
    send_to: ADS_LABEL_ADD_TO_CART,
    value: price,
    currency: 'USD'
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
 * Track Purchase event on verified backend order creation
 */
export function trackPurchase({ orderId, value, items = [] }) {
  if (!orderId) return;
  const numValue = Number(value || 0);

  // 1. GA4 Standard Event
  safeGtag('event', 'purchase', {
    transaction_id: String(orderId),
    value: numValue,
    currency: 'USD',
    items: items.map(item => formatItem(item, item.quantity || 1))
  });

  // 2. Google Ads Purchase Conversion
  safeGtag('event', 'conversion', {
    send_to: ADS_LABEL_PURCHASE,
    transaction_id: String(orderId),
    value: numValue,
    currency: 'USD'
  });
}

/**
 * Track Lead event (Parts Request or Product Hold Reservation)
 */
export function trackLead({ id, type = 'request', part = null, value = 0 }) {
  const numValue = Number(value || part?.price || 0);

  // 1. GA4 Standard Event
  safeGtag('event', 'generate_lead', {
    transaction_id: String(id || ''),
    lead_type: type,
    value: numValue,
    currency: 'USD',
    items: part ? [formatItem(part, 1)] : []
  });

  // 2. Google Ads Lead Conversion
  safeGtag('event', 'conversion', {
    send_to: ADS_LABEL_LEAD,
    transaction_id: String(id || ''),
    value: numValue,
    currency: 'USD'
  });
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
