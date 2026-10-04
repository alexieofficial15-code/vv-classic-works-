import React, { useEffect } from 'react';
import { Phone, ShieldCheck, Wrench, ArrowRight, Hammer, CheckCircle2 } from 'lucide-react';
import CatalogSection from '../components/CatalogSection';
import { updateDocumentMeta } from '../utils/router';

export default function RestorationPage({
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
      title: 'Vintage Aircooled VW Restoration Services | Houston, TX',
      description: 'Full chassis, mechanical, and engine restorations for vintage VW Beetle, Bus T1/T2, Karmann Ghia, and Type 3. Blueprint precision in Houston, TX.',
      canonicalPath: '/restoration',
      ogType: 'website'
    });
  }, []);

  return (
    <div className="text-[#e5e2e3] font-technical-data">
      {/* Landing Header */}
      <section className="bg-gradient-to-b from-[#181719] to-[#131314] border-b border-[#584236]/40 py-12 sm:py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-400 font-mono">
            <Hammer className="w-3.5 h-3.5" />
            <span>Chassis, Transmission & Engine Restorations</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
            Vintage Aircooled VW Restoration &amp; Rebuild Services
          </h1>

          <p className="text-sm sm:text-base text-[#e0c0b1] max-w-3xl leading-relaxed">
            Authentic mechanical and structural restorations for classic Volkswagen models. Our Houston workshop specializes in period-correct engine rebuilds, Freeway Flyer transaxle setup, dual-carburetor synchronization, and chassis preservation for Type 1 Beetles, T1/T2 Westfalia Campers, Karmann Ghias, and Type 3 variants.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="tel:19452879865"
              className="min-h-[48px] px-6 bg-[#ff7a1a] hover:bg-[#ff964d] text-slate-950 font-bold text-xs sm:text-sm font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-xl transition-all"
            >
              <Phone className="w-4 h-4 fill-current shrink-0" />
              <span>Discuss Your Build: +1 (945) 287-9865</span>
            </a>

            <a
              href="/contact"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/contact');
                }
              }}
              className="min-h-[48px] px-6 bg-[#181719] hover:bg-[#252426] border border-[#584236] text-white font-bold text-xs sm:text-sm font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all"
            >
              <span>Visit Houston Workshop</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#584236]/30 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Period-Correct German Hardware</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Crankcase Line Boring &amp; Balancing</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Wrench className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>In-House Engine Dyno Testing</span>
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
            categoryId: 'ALL'
          }}
        />
      </section>
    </div>
  );
}
