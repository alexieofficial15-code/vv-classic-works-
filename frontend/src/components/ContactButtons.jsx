import React from 'react';
import { Phone, MessageCircle, MessageSquare } from 'lucide-react';
import {
  PHONE_NUMBER,
  PHONE_TEL,
  FACEBOOK_MESSENGER_URL,
  whatsappLink,
  prefilledPartMessage
} from '../config/contact.js';

/**
 * Unified ContactButtons component
 * Provides 44px+ tap targets for WhatsApp, Direct Call, and Facebook Messenger.
 * Matches the site's dark/orange automotive workshop aesthetic.
 *
 * Tracking note: Handled automatically by delegated listeners in analytics.js (tel: and wa.me).
 *
 * @param {object} props
 * @param {object} [props.part] - Optional part object for prefilled WhatsApp messages
 * @param {string} [props.text] - Optional custom message text for WhatsApp (ignored if part is passed)
 * @param {string} [props.className] - Additional class for the button container
 * @param {string} [props.buttonClassName] - Additional class applied to each button
 * @param {boolean} [props.stacked] - If true, stack buttons vertically; otherwise flex row wrapping
 * @param {boolean} [props.showLabels] - Whether to render text labels beside icons (default: true)
 */
export default function ContactButtons({
  part,
  text,
  className = '',
  buttonClassName = '',
  stacked = false,
  showLabels = true
}) {
  const waUrl = part ? whatsappLink(prefilledPartMessage(part)) : whatsappLink(text);

  const containerLayout = stacked
    ? 'flex flex-col gap-2.5 w-full'
    : 'flex flex-wrap items-center gap-2.5 w-full sm:w-auto';

  const baseBtnClass =
    'min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-[0.98]';

  return (
    <div className={`${containerLayout} ${className}`.trim()} role="group" aria-label="Contact options">
      {/* 1. Direct Phone Call Button */}
      <a
        href={PHONE_TEL}
        className={`${baseBtnClass} bg-[#ff7a1a] hover:bg-[#ff964d] text-slate-950 border border-[#ff7a1a] shadow-md hover:shadow-amber-500/20 ${buttonClassName}`.trim()}
        aria-label={`Call workshop support at ${PHONE_NUMBER}`}
        title={`Call ${PHONE_NUMBER}`}
      >
        <Phone className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
        {showLabels && <span>Call {PHONE_NUMBER}</span>}
      </a>

      {/* 2. WhatsApp Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseBtnClass} bg-[#181719] hover:bg-[#242326] text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 shadow-sm ${buttonClassName}`.trim()}
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-4 h-4 shrink-0 text-emerald-400" aria-hidden="true" />
        {showLabels && <span>WhatsApp Us</span>}
      </a>

      {/* 3. Facebook Messenger Button (only rendered when a real Messenger URL is configured) */}
      {FACEBOOK_MESSENGER_URL && (
      <a
        href={FACEBOOK_MESSENGER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseBtnClass} bg-[#181719] hover:bg-[#242326] text-[#83cffb] hover:text-white border border-[#83cffb]/40 hover:border-[#83cffb] shadow-sm ${buttonClassName}`.trim()}
        aria-label="Message on Facebook Messenger"
        title="Message on Facebook Messenger"
      >
        <MessageSquare className="w-4 h-4 shrink-0 text-[#83cffb]" aria-hidden="true" />
        {showLabels && <span>FB Message</span>}
      </a>
      )}
    </div>
  );
}
