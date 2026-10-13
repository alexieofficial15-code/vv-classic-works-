import React, { useEffect } from 'react';
import { RotateCcw, ArrowLeft, Phone, AlertTriangle, CheckCircle } from 'lucide-react';
import { updateDocumentMeta } from '../utils/router';
import { PHONE_NUMBER, PHONE_TEL, SUPPORT_EMAIL } from '../config/contact.js';

export default function ReturnsPolicy({ onNavigate }) {
  useEffect(() => {
    updateDocumentMeta({
      title: 'Returns & Refund Policy | Classic Aircooled VW Works',
      description: 'Return policy, core deposit terms, and RMA guidelines for vintage aircooled VW components.',
      canonicalPath: '/returns',
      ogType: 'website'
    });
  }, []);
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
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">Returns & Refunds Policy</h1>
            <p className="text-xs text-[#a78b7d]">Classic Aircooled VW Works • Houston, Texas</p>
          </div>
        </div>
      </div>

      <div className="bg-[#181719] border border-[#584236]/50 rounded-xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            1. Return Window & Eligibility
          </h2>
          <p>
            We take pride in our aircooled engines and parts. If you need to return an item, the following terms apply:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#e5e2e3]">
            <li><strong>Return Window:</strong> Returns must be requested within 3 days of the delivery date.</li>
            <li><strong>Condition:</strong> Parts must be in brand new, uninstalled, unpainted condition, with all original hardware, gaskets, and factory packaging.</li>
            <li><strong>Electrical Components:</strong> Electrical components are non-returnable.</li>
            <li><strong>Custom Machined Engines & Cases:</strong> Custom built-to-order longblocks and custom line-bored engine cases are handled case by case. Contact us before ordering and we will confirm the terms in writing.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            2. Return Merchandise Authorization (RMA) Required
          </h2>
          <p>
            To ensure your return is received and inspected promptly by our mechanics, all returns must have an authorized RMA number:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs text-[#e5e2e3]">
            <li>Call our workshop at <a href={PHONE_TEL} className="text-amber-400 underline font-bold">{PHONE_NUMBER}</a> (Mon-Fri 8am-6pm CST, Sat 9am-4pm) {SUPPORT_EMAIL ? <>or email <a href={`mailto:${SUPPORT_EMAIL}`} className="text-amber-400 underline font-bold">{SUPPORT_EMAIL}</a> </> : null}with your original order reference.</li>
            <li>Our team will issue an RMA number and return shipping instructions.</li>
            <li>Clearly mark the RMA number on the exterior of the return crate or package.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            3. Restocking Fees & Shipping Costs
          </h2>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs space-y-2 font-mono">
            <div><strong>Restocking Fee:</strong> No restocking fee.</div>
            <div><strong>Return Freight Responsibility:</strong> For non-defective returns, return shipping costs are confirmed when your RMA is issued.</div>
            <div><strong>Defective or Incorrect Items:</strong> If you receive an incorrect or defective part, Classic Aircooled VW Works covers 100% of return shipping and provides an immediate replacement or full refund.</div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            4. Refund Processing
          </h2>
          <p>
            Once our mechanics receive and inspect your returned part at our Houston workshop (14826 Yarberry St, Houston, TX 77039), refunds are processed via the original payment method within 1-7 business days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            5. Questions & Assistance
          </h2>
          <p>
            If you have questions regarding fitment, installation tolerances, or return eligibility, speak directly with a master technician:
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-white">
            <Phone className="w-4 h-4 text-amber-400" />
            <span>Call us directly: </span>
            <a href={PHONE_TEL} className="text-amber-400 font-bold underline">{PHONE_NUMBER}</a>
          </div>
        </section>
      </div>
    </div>
  );
}
