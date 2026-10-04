import React from 'react';
import { FileText, ArrowLeft, Phone, ShieldCheck } from 'lucide-react';

export default function TermsOfService({ onNavigate }) {
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
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">Terms of Service</h1>
            <p className="text-xs text-[#a78b7d]">Classic Aircooled VW Works • Houston, Texas</p>
          </div>
        </div>
      </div>

      <div className="bg-[#181719] border border-[#584236]/50 rounded-xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or purchasing from Classic Aircooled VW Works (classicaircooledvwworks.com), you agree to be bound by these Terms of Service. If you do not agree, please do not use our services or submit orders.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            2. Orders, Invoicing & Pricing
          </h2>
          <p>
            All orders submitted through the website represent a formal request for parts and a workshop crating quote. Because aircooled engine assemblies and vintage components require mechanical fitment verification:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#e5e2e3]">
            <li>No payment card is charged automatically at the time of website order placement.</li>
            <li>A verified workshop invoice is issued to your email after technical verification and shipping calculation.</li>
            <li>Accepted payment methods: [OWNER: specify accepted payment methods, e.g. ACH / Bank Wire, Debit/Credit Card via telephone confirmation, Invoiced payment].</li>
            <li>All prices are quoted in United States Dollars (USD). We reserve the right to correct pricing or inventory typographical errors prior to invoice settlement.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            3. Vintage Automotive Parts & Mechanical Fitment
          </h2>
          <p>
            Vintage air-cooled Volkswagen vehicles (Type 1 Beetle, Type 2 Bus / Transporter, Type 3, Karmann Ghia, and Porsche 356/912 conversions) have frequently undergone engine swaps, displacement modifications, and dual-port conversions throughout their service lives.
          </p>
          <p className="text-xs text-[#a78b7d]">
            The customer is responsible for verifying engine case code, displacement, dual-port vs single-port cylinder heads, and electrical voltage (6V vs 12V) before installation. We encourage contacting our shop at <a href="tel:19452879865" className="text-amber-400 underline font-bold">+1 (945) 287-9865</a> with casting numbers for pre-purchase compatibility confirmation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            4. Engine Warranty & Disclaimers
          </h2>
          <p>
            Turn-key longblocks, dyno-tested engines, and machined components are backed by [OWNER: specify engine warranty duration and conditions, e.g. 12-month / 12,000-mile limited warranty against defects in machining and assembly, provided professional installation and proper break-in procedures are followed].
          </p>
          <p className="text-xs text-[#a78b7d]">
            Warranty does not cover failure resulting from competition/racing use, oil starvation, improper ignition timing, overheating due to missing cooling tinware/shrouds, or unauthorized disassembly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            5. Limitation of Liability
          </h2>
          <p>
            Classic Aircooled VW Works shall not be liable for any incidental, consequential, or punitive damages arising from the use or installation of parts, including labor costs, towing fees, or loss of vehicle use.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            6. Governing Law & Contact
          </h2>
          <p>
            These terms are governed by the laws of the State of Texas, without regard to conflict of law principles. Any dispute shall be resolved in the state or federal courts located in Harris County, Texas.
          </p>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs space-y-1 font-mono">
            <div><strong>Company:</strong> Classic Aircooled VW Works</div>
            <div><strong>Location:</strong> 14826 Yarberry St, Houston, TX 77039, USA</div>
            <div><strong>Phone:</strong> <a href="tel:19452879865" className="text-amber-400 underline">+1 (945) 287-9865</a></div>
            <div><strong>Email:</strong> [OWNER: official support email address]</div>
          </div>
        </section>
      </div>
    </div>
  );
}
