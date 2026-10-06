import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { PHONE_NUMBER, PHONE_TEL, WHATSAPP_NUMBER, whatsappLink } from '../config/contact.js';

/**
 * Sticky bottom "Call now" bar on mobile only (max-width 767px).
 * - 48px high with safe-area-inset padding
 * - High contrast styling
 * - Hidden when cart drawer, auth modal, or any other modal is open
 * - Displays WhatsApp button only if WHATSAPP_NUMBER is set
 */
export default function StickyCallBar({ isModalOpen }) {
  if (isModalOpen) return null;

  const hasWhatsapp = Boolean(WHATSAPP_NUMBER && WHATSAPP_NUMBER.length >= 7);
  const whatsappUrl = hasWhatsapp
    ? whatsappLink("Hi, I'm interested in vintage aircooled VW parts and restoration services.")
    : null;

  return (
    <aside
      aria-label="Mobile Call & Contact Bar"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-md border-t border-amber-500/30 shadow-[0_-4px_20px_rgba(0,0,0,0.6)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="h-12 max-w-lg mx-auto px-3 flex items-center gap-2">
        <a
          href={PHONE_TEL}
          className="flex-1 h-9 px-3 bg-[#ff7a1a] hover:bg-[#ff964d] text-slate-950 font-bold text-xs font-mono uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors"
          aria-label={`Call Classic Aircooled VW Works at ${PHONE_NUMBER}`}
        >
          <Phone className="w-4 h-4 fill-current shrink-0" />
          <span className="truncate">Call Now ({PHONE_NUMBER})</span>
        </a>

        {hasWhatsapp && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-colors shrink-0"
            aria-label="Chat with shop on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>WhatsApp</span>
          </a>
        )}
      </div>
    </aside>
  );
}
