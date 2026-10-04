import React, { useEffect } from 'react';
import { Phone, ShieldCheck, Wrench, ArrowRight, PackageCheck, CheckCircle2 } from 'lucide-react';
import CatalogSection from '../components/CatalogSection';
import { updateDocumentMeta } from '../utils/router';
import { DIRECT_PART_CATEGORIES } from '../data/vwNavigationData';

const CATEGORY_DETAILS = {
  'cylinder-heads': {
    title: 'Aircooled VW Cylinder Heads & Valvetrain',
    h1: 'Aircooled VW Cylinder Heads & Valvetrain',
    desc: 'Genuine dual-port and single-port cylinder heads, stainless steel valves, dual valve springs, and rocker assemblies for 1600cc to 2276cc air-cooled engines.',
    filter: { subcatId: 'cylinder-heads', directPartId: 'cylinder-heads' }
  },
  'camshafts': {
    title: 'VW Camshafts & Crankshafts | Performance & Stock',
    h1: 'VW Camshafts, Crankshafts & Rotating Assemblies',
    desc: 'Forged 4140 chromoly counterweighted crankshafts, performance ground camshafts, lightweight lifters, and 8-dowel flywheels.',
    filter: { subcatId: 'camshafts', directPartId: 'camshafts' }
  },
  'brake-kits': {
    title: 'Vintage VW Disc Brake Kits & Hydraulics',
    h1: 'Vintage VW Disc Brake Kits & Hydraulic Systems',
    desc: 'Front and rear disc brake conversion kits, dual-circuit master cylinders, premium German brake drums, and stainless braided lines for Beetle and Bus.',
    filter: { systemId: 'brake-system', directPartId: 'brake-kits' }
  },
  'electrical-components': {
    title: 'Vintage VW Electrical, Starters & Ignition',
    h1: 'Vintage VW Electrical, Starters & Ignition Systems',
    desc: '12V alternator conversion kits, high-torque starters, Bosch 009 mechanical advance distributors, and complete German-spec wiring harnesses.',
    filter: { systemId: 'electrical-system', directPartId: 'electrical-components' }
  },
  'suspension-shocks': {
    title: 'Aircooled VW Suspension, Coilovers & Shocks',
    h1: 'Aircooled VW Suspension, Beams & Shocks',
    desc: 'Adjustable front axle beams, dropped spindles, heavy-duty torsion bars, and performance gas shocks for street and off-road applications.',
    filter: { systemId: 'suspension-system', directPartId: 'suspension-shocks' }
  },
  'transmission-clutch': {
    title: 'Vintage VW Transmissions, Clutches & Transaxles',
    h1: 'Vintage VW Transmissions, Transaxles & Clutches',
    desc: 'Freeway Flyer transaxles, heavy-duty side covers, Kennedy stage 1/2 clutch packages, and heavy-duty throwout bearings.',
    filter: { systemId: 'transmission-system', directPartId: 'transmission-clutch' }
  }
};

export default function PartsPage({
  category = null,
  onAddToCart,
  onRequestItem,
  onReserveItem,
  onViewPartDetails,
  onToggleWishlist,
  wishlistIds,
  searchTerm,
  onNavigate
}) {
  const catKey = category ? category.toLowerCase().trim() : null;
  const catInfo = catKey && CATEGORY_DETAILS[catKey] ? CATEGORY_DETAILS[catKey] : null;

  const pageTitle = catInfo 
    ? `${catInfo.title} | Classic Aircooled VW Works`
    : 'Vintage Aircooled VW Spare Parts Catalog | Classic Aircooled VW Works';

  const pageH1 = catInfo ? catInfo.h1 : 'Vintage Aircooled VW Spare Parts & Restoration Catalog';

  const pageDesc = catInfo 
    ? catInfo.desc 
    : 'Explore verified OEM and performance components for classic Volkswagen Beetle, Super Beetle, Bus T1/T2, Type 3, and Karmann Ghia. Inspected in Houston, TX.';

  const canonicalPath = catKey ? `/parts/${catKey}` : '/parts';

  useEffect(() => {
    updateDocumentMeta({
      title: pageTitle,
      description: pageDesc,
      canonicalPath,
      ogType: 'website'
    });
  }, [pageTitle, pageDesc, canonicalPath]);

  const activeFilter = catInfo ? catInfo.filter : { categoryId: 'ALL' };

  return (
    <div className="text-[#e5e2e3] font-technical-data">
      {/* Landing Header */}
      <section className="bg-gradient-to-b from-[#181719] to-[#131314] border-b border-[#584236]/40 py-12 sm:py-14 px-4 sm:px-6 md:px-8">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-400 font-mono">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>OEM Blueprinted Aircooled Volkswagen Components</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
            {pageH1}
          </h1>

          <p className="text-xs sm:text-sm text-[#e0c0b1] max-w-3xl leading-relaxed">
            {pageDesc}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="tel:19452879865"
              className="min-h-[44px] px-5 bg-[#ff7a1a] hover:bg-[#ff964d] text-slate-950 font-bold text-xs font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg transition-all"
            >
              <Phone className="w-4 h-4 fill-current shrink-0" />
              <span>Call For Parts Fitment: +1 (945) 287-9865</span>
            </a>

            <a
              href="#catalog"
              className="min-h-[44px] px-5 bg-[#181719] hover:bg-[#252426] border border-[#584236] text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all"
            >
              <span>View Filtered Parts</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Quick Category Chips */}
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="text-[#a78b7d] self-center pr-1">Popular Categories:</span>
            {DIRECT_PART_CATEGORIES.slice(0, 6).map(c => (
              <a
                key={c.id}
                href={`/parts/${c.id}`}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate(`/parts/${c.id}`);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg border transition-colors ${
                  catKey === c.id 
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-white'
                }`}
              >
                {c.name}
              </a>
            ))}
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
          activeFilter={activeFilter}
        />
      </section>
    </div>
  );
}
