import React, { useEffect } from 'react';
import { Phone, MapPin, Clock, Mail, MessageCircle, ArrowLeft, Wrench, ShieldCheck } from 'lucide-react';
import { updateDocumentMeta } from '../utils/router';

export default function ContactPage({ onNavigate }) {
  useEffect(() => {
    updateDocumentMeta({
      title: 'Contact Workshop & Garage | Classic Aircooled VW Works',
      description: 'Contact Classic Aircooled VW Works in Houston, TX. Phone: +1 (945) 287-9865. Address: 14826 Yarberry St.',
      canonicalPath: '/contact',
      ogType: 'website'
    });
  }, []);
  const rawWhatsapp = import.meta.env.VITE_WHATSAPP_NUMBER;
  const whatsappNumber = rawWhatsapp ? String(rawWhatsapp).replace(/\D/g, '') : null;
  const hasWhatsapp = Boolean(whatsappNumber && whatsappNumber.length >= 7);

  const whatsappUrl = hasWhatsapp
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I'm contacting Classic Aircooled VW Works regarding engine parts / restoration.")}`
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-[#e0c0b1] font-technical-data">
      <div className="mb-8">
        <a
          href="/"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate('/');
            }
          }}
          className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workshop Home
        </a>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">Contact Our Workshop</h1>
            <p className="text-xs text-[#a78b7d]">Classic Aircooled VW Works • Houston, Texas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info Card */}
        <div className="bg-[#181719] border border-[#584236]/50 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            Direct Shop Communication
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white uppercase text-[11px] font-mono">Telephone Support</div>
                <a href="tel:19452879865" className="text-amber-400 font-bold font-mono text-base hover:underline">
                  +1 (945) 287-9865
                </a>
                <p className="text-[#a78b7d] text-[11px] mt-0.5">Direct line to engine machinists & technicians</p>
              </div>
            </div>

            {hasWhatsapp && (
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white uppercase text-[11px] font-mono">WhatsApp Dispatch</div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 font-bold font-mono hover:underline"
                  >
                    Chat on WhatsApp
                  </a>
                  <p className="text-[#a78b7d] text-[11px] mt-0.5">Send photos of casting stamps & engine codes</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white uppercase text-[11px] font-mono">Workshop Location</div>
                <div className="text-white font-mono">14826 Yarberry St</div>
                <div className="text-[#a78b7d]">Houston, TX 77039, USA</div>
                <p className="text-[#a78b7d] text-[11px] mt-0.5">Customer pickups & workshop consultations by appointment</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white uppercase text-[11px] font-mono">Operating Hours (CST)</div>
                <div className="text-white">Monday – Friday: 8:00 AM – 6:00 PM</div>
                <div className="text-white">Saturday: 9:00 AM – 4:00 PM</div>
                <div className="text-[#a78b7d]">Sunday: Closed</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white uppercase text-[11px] font-mono">Official Email</div>
                <div className="text-slate-300 font-mono">[OWNER: official support email address]</div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="tel:19452879865"
              className="w-full min-h-[46px] flex items-center justify-center gap-2 bg-[#ff7a1a] hover:bg-[#ff964d] text-slate-950 font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg transition-colors"
            >
              <Phone className="w-4 h-4 fill-current" />
              <span>Call Master Technician Now</span>
            </a>
          </div>
        </div>

        {/* Engine Fitment & Technical Inquiries */}
        <div className="bg-[#181719] border border-[#584236]/50 rounded-xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
              Technical & Restoration Assistance
            </h2>
            <p className="text-xs leading-relaxed">
              Need assistance determining whether a 1600cc Dual Port head, 85.5mm Mahle piston set, or Weber 44 IDF carburetor is correct for your Type 1, Type 2, or Ghia project?
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-white">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>What to Have Ready When Calling:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-[#a78b7d]">
                <li>Engine case stamping code (stamped below alternator/generator stand).</li>
                <li>Single-port vs. Dual-port cylinder head intake configuration.</li>
                <li>Electrical system voltage (6-Volt vs. 12-Volt generator/alternator).</li>
                <li>Clutch & flywheel diameter (180mm vs. 200mm, 6V 109-tooth vs. 12V 130-tooth).</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-mono space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Workshop Inspection</span>
            </div>
            <p className="text-[11px]">
              Components are inspected and prepared before packaging and crating.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
