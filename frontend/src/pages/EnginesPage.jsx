import React, { useEffect } from 'react';
import { Phone, ShieldCheck, Wrench, ArrowRight, Gauge, CheckCircle2 } from 'lucide-react';
import CatalogSection from '../components/CatalogSection';
import { updateDocumentMeta } from '../utils/router';

export default function EnginesPage({
  onAddToCart,
  onRequestItem,
  onReserveItem,
  onViewPartDetails,
  onToggleWishlist,
  wishlistIds,
  searchTerm,
  onNavigate
}) {
  useEffect(() => {
    updateDocumentMeta({
      title: 'Complete Aircooled VW Engines | Classic Aircooled VW Works',
      description: 'Turn-key and longblock air-cooled VW engines for Beetle, Bus T1/T2, Karmann Ghia. Dyno-tested with verified factory tolerances. Houston, TX.',
      canonicalPath: '/engines',
      ogType: 'website'
    });
  }, []);

  return (
    <div className="text-[#e5e2e3] font-technical-data">
      {/* Landing Header */}
      <section className="bg-gradient-to-b from-[#181719] to-[#131314] border-b border-[#584236]/40 py-12 sm:py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-400 font-mono">
            <Gauge className="w-3.5 h-3.5" />
            <span>Turn-Key Longblocks & Competition Flat-Fours</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
            Complete Aircooled VW Engines &amp; Turn-Key Builds
          </h1>

          <p className="text-sm sm:text-base text-[#e0c0b1] max-w-3xl leading-relaxed">
            Precision engineered air-cooled flat-four engines built to authentic factory mechanical blueprints. From 1600cc dual-port factory restorations to dyno-balanced 2276cc high-performance builds for Beetle, Bus, and Karmann Ghia. Every engine features verified line-bored cases, micrometer-inspected clearances, and dyno-tested oil pressure.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="tel:19452879865"
              className="min-h-[48px] px-6 bg-[#ff7a1a] hover:bg-[#ff964d] text-slate-950 font-bold text-xs sm:text-sm font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-xl transition-all"
            >
              <Phone className="w-4 h-4 fill-current shrink-0" />
              <span>Call Shop: +1 (945) 287-9865</span>
            </a>

            <a
              href="#catalog"
              className="min-h-[48px] px-6 bg-[#181719] hover:bg-[#252426] border border-[#584236] text-white font-bold text-xs sm:text-sm font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all"
            >
              <span>Explore Engine Inventory</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#584236]/30 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Houston Dyno Lab Tested</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Verified OEM Magnesium / Aluminum</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Wrench className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Palletized Insured Freight Crate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog with Preset Filters */}
      <section className="py-8">
        <CatalogSection
          onAddToCart={onAddToCart}
          onRequestItem={onRequestItem}
          onReserveItem={onReserveItem}
          onViewPartDetails={onViewPartDetails}
          onToggleWishlist={onToggleWishlist}
          wishlistIds={wishlistIds}
          searchTerm={searchTerm}
          activeFilter={{
            systemId: 'engine-system',
            categoryId: 'engines'
          }}
        />
      </section>
    </div>
  );
}
