import React, { useEffect } from 'react';
import { Truck, ArrowLeft, Phone, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';
import { updateDocumentMeta } from '../utils/router';

export default function ShippingPolicy({ onNavigate }) {
  useEffect(() => {
    updateDocumentMeta({
      title: 'Shipping Policy & Palletized Freight | Classic Aircooled VW Works',
      description: 'Shipping and freight policy for classic VW engines, transaxles, and parts dispatched from Houston, TX.',
      canonicalPath: '/shipping',
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
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">Shipping & Freight Policy</h1>
            <p className="text-xs text-[#a78b7d]">Classic Aircooled VW Works • Houston, Texas</p>
          </div>
        </div>
      </div>

      <div className="bg-[#181719] border border-[#584236]/50 rounded-xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            1. Dispatch Origin & Workshop Location
          </h2>
          <p>
            All precision aircooled engines, transmission casings, cylinder heads, and vintage restoration parts are dispatched directly from our dedicated Houston facility:
          </p>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs space-y-1.5 font-mono">
            <div><strong>Dispatch Facility:</strong> 14826 Yarberry St, Houston, TX 77039, USA</div>
            <div><strong>Dispatch Inquiries:</strong> <a href="tel:19452879865" className="text-amber-400 underline">+1 (945) 287-9865</a></div>
            <div><strong>Operational Hours:</strong> Monday – Friday 8:00 AM – 6:00 PM CST | Saturday 9:00 AM – 4:00 PM CST</div>
            <div><strong>Local Pickup:</strong> Workshop pickup available by appointment at our Houston location.</div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            2. Freight Estimates & Order Confirmation
          </h2>
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 font-mono flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>IMPORTANT NOTICE ON FREIGHT PRICING:</strong> The $150 freight figure presented during guest or member cart checkout is an <em>initial estimate</em>. Because vintage engine assemblies, longblocks, and transmission cases vary significantly in weight and crating volume, our master technicians verify exact crating dimensions and calculate the final freight quote prior to billing. No credit card is charged upfront.
            </div>
          </div>
          <p>
            Once you submit an order, our shop team will contact you directly via phone or email to confirm:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-[#e5e2e3]">
            <li>Delivery address access (residential lift-gate required vs. commercial loading dock).</li>
            <li>Exact palletized crating weight and courier freight fee.</li>
            <li>Tracking number and carrier delivery schedule.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            3. Processing & Handling Times
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#e5e2e3]">
            <li><strong>In-Stock Small Parts & Components:</strong> [OWNER: specify dispatch preparation time for in-stock parts, e.g. 1-2 business days].</li>
            <li><strong>Machined Heads, Cases & Engine Assemblies:</strong> Custom longblocks and inspected turn-key engines undergo dyno-verification and secure wooden crating before dispatch ([OWNER: specify custom build / crate preparation lead time, e.g. 5-10 business days]).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            4. Shipping Carriers & Transit Times
          </h2>
          <p>
            Couriers and carriers utilized:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-[#e5e2e3]">
            <li><strong>Standard Parcel Shipments:</strong> [OWNER: specify standard parcel carriers, e.g. UPS Ground or FedEx Ground]. Typical transit time: [OWNER: specify domestic transit time window, e.g. 3-7 business days].</li>
            <li><strong>Heavy Freight & Complete Engines:</strong> [OWNER: specify LTL freight carriers, e.g. R+L Carriers, TForce Freight, or Freightways].</li>
            <li><strong>International Orders:</strong> [OWNER: specify international shipping availability, customs responsibility, and terms].</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            5. Freight Inspection & Damage Claims
          </h2>
          <p>
            All crated engines and precision parts are insured during transit. Upon arrival:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs text-[#e5e2e3]">
            <li>Inspect the crate or box thoroughly for exterior damage prior to signing the delivery receipt.</li>
            <li>If external damage is noted, photograph the packaging immediately and note "Damaged upon delivery" on the Bill of Lading (BOL).</li>
            <li>Notify Classic Aircooled VW Works within [OWNER: specify damage reporting window, e.g. 48 hours] at <a href="tel:19452879865" className="text-amber-400 underline font-bold">+1 (945) 287-9865</a> so we can initiate an insurance claim and arrange replacement parts.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
