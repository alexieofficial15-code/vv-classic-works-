// Centralized contact configuration for Classic Aircooled VW Works

const rawWhatsapp = (import.meta.env.VITE_WHATSAPP_NUMBER || '19452879865').toString();
export const WHATSAPP_NUMBER = rawWhatsapp.replace(/\D/g, '') || '19452879865';

export const PHONE_NUMBER = '1-945-287-9865';
export const PHONE_TEL = 'tel:+19452879865';

// Public support email shown on the policy and contact pages. No guessed default:
// the email lines stay hidden until VITE_SUPPORT_EMAIL is set (in Vercel).
export const SUPPORT_EMAIL = (import.meta.env.VITE_SUPPORT_EMAIL || '').trim();

export const FACEBOOK_PAGE_URL = import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com/share/1BwLuMhq42/';
// No guessed default: the Messenger button is hidden until VITE_FACEBOOK_MESSENGER_URL (https://m.me/<page-username>) is set
export const FACEBOOK_MESSENGER_URL = (import.meta.env.VITE_FACEBOOK_MESSENGER_URL || '').trim();

/**
 * Generate a WhatsApp click-to-chat URL with an optional prefilled message
 * @param {string} text - Optional prefilled message text
 * @returns {string} - Full WhatsApp URL (e.g. https://wa.me/19452879865?text=...)
 */
export function whatsappLink(text = '') {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!text || !String(text).trim()) return base;
  return `${base}?text=${encodeURIComponent(String(text).trim())}`;
}

/**
 * Generate a prefilled inquiry message including part title and ID
 * @param {object} part - The part object (title/name and id)
 * @returns {string} - Prefilled message text
 */
export function prefilledPartMessage(part) {
  if (!part) return "Hi, I'm contacting Classic Aircooled VW Works regarding vintage VW parts & engines.";
  const title = part.title || part.name || 'Part';
  const id = part.id || part._id || 'N/A';
  return `Hi, I'm interested in "${title}" (Part ID: ${id}). Is this part currently available?`;
}
