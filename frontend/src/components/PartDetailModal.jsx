import React, { useState, useEffect, useMemo } from 'react';
import { X, ShoppingBag, ShieldCheck, CheckCircle2, Award, Cpu, FileText, Wrench, Box, MessageCircle, Phone, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function PartDetailModal({ part, onClose, onAddToCart, onRequestItem, onReserveItem }) {
  if (!part) return null;

  // Gather all photos for this post
  const allImages = useMemo(() => {
    const list = [];
    if (part.image) list.push(part.image);
    if (Array.isArray(part.additionalImages)) {
      part.additionalImages.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80'];
  }, [part]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  // Touch Swipe Gesture Handlers (Mobile & Touchscreen)
  const minSwipeDistance = 45;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      // Swiped left -> Go to next picture
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> Go to previous picture
      handlePrev();
    }
  };

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allImages.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl my-auto text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 min-w-[36px] min-h-[36px] flex items-center justify-center p-2 rounded-full bg-slate-950/80 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          aria-label="Close part details"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="grid md:grid-cols-12">
          
          {/* Left Column: Swipeable Image Gallery & Badges */}
          <div className="md:col-span-5 bg-slate-950 p-3.5 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
            <div className="space-y-3 sm:space-y-4">
              
              {/* Main Photo Container with Swipe Support */}
              <div 
                className="relative h-52 sm:h-64 md:h-72 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-800 group select-none cursor-grab active:cursor-grabbing bg-black/90 flex items-center justify-center"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <img
                  key={activeImageIndex}
                  src={allImages[activeImageIndex]}
                  alt={`${part.title} - photo ${activeImageIndex + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-opacity duration-300 animate-in fade-in"
                />

                {/* Condition Badge */}
                <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-[#ff7a1a] text-slate-950 text-[10px] sm:text-xs font-mono font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md shadow-md z-10 pointer-events-none">
                  {part.condition || 'Certified'}
                </span>

                {/* Photo Counter Pill */}
                {allImages.length > 1 && (
                  <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-black/80 backdrop-blur-md border border-[#ff7a1a]/40 text-[#ff7a1a] text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-md z-10 pointer-events-none">
                    {activeImageIndex + 1} / {allImages.length} Photos
                  </span>
                )}

                {/* Left / Right Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-[#ff7a1a] text-white hover:text-black border border-slate-700 hover:border-[#ff7a1a] flex items-center justify-center transition-all opacity-85 hover:opacity-100 shadow-lg cursor-pointer"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-[#ff7a1a] text-white hover:text-black border border-slate-700 hover:border-[#ff7a1a] flex items-center justify-center transition-all opacity-85 hover:opacity-100 shadow-lg cursor-pointer"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {/* Bottom Swipe Hint */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-mono text-slate-300 pointer-events-none flex items-center gap-1.5 border border-slate-800">
                      <span>← Swipe or Click to browse →</span>
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails Row (if multiple images) */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                  {allImages.map((thumbUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#ff7a1a] ring-2 ring-[#ff7a1a]/50 scale-105'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={thumbUrl} 
                        alt={`Thumbnail ${idx + 1}`} 
                        loading="lazy" 
                        decoding="async" 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs font-mono">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Rarity: {part.rarityScore || 'Specialist Grade'}</span>
                </div>
                <div className="text-slate-400 truncate">
                  SKU / P/N: <span className="text-slate-200">{part.sku || part.oemNumber || 'NOS-GENUINE'}</span>
                </div>
                <div className="text-slate-400 truncate">
                  SYSTEM: <span className="text-slate-200">{part.partSubcategory || part.specificPartCategory || part.systemCategory || 'Engine System'}</span>
                </div>
                {part.storageLocation && (
                  <div className="text-slate-400 truncate">
                    LOCATION: <span className="text-slate-200">{part.storageLocation}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 sm:pt-4 border-t border-slate-800 text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 mt-2 sm:mt-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
              <span>Certified Vintage Authenticity Guarantee</span>
            </div>
          </div>

          {/* Right Column: Part Specs & Details */}
          <div className="md:col-span-7 p-3.5 sm:p-6 space-y-4 sm:space-y-6 flex flex-col justify-between">
            <div>
              <div className="text-[10px] sm:text-xs font-mono text-amber-400 uppercase tracking-wide mb-1 flex items-center justify-between">
                <span className="truncate pr-2">{part.carModelName || part.modelYearRange || 'VW Air-Cooled'} • {part.era || part.modelYearRange || 'All Years'}</span>
                <span className="text-emerald-400 font-bold shrink-0">{part.status || (part.inStock ? 'Available' : 'Out of Stock')}</span>
              </div>

              <h2 className="text-lg sm:text-2xl font-bold text-white font-display mb-1 sm:mb-2 leading-tight">
                {part.title}
              </h2>

              <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-display mb-3 sm:mb-4">
                ${part.price ? part.price.toLocaleString() : '0.00'} USD
              </div>

              {/* Complete Vehicle Documentation & Attributes (only if specs exist) */}
              {(part.vinNumber || part.mileage || part.engineInstalled || part.transmissionType || part.exteriorColor) && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 space-y-2">
                  <div className="text-[10px] sm:text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>🚗 VEHICLE SPECIFICATION</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 text-[9px]">
                      {part.titleStatus || 'Clean Title'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] sm:text-xs font-mono">
                    {part.vinNumber && (
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[9px]">VIN</span>
                        <span className="text-white font-bold truncate block">{part.vinNumber}</span>
                      </div>
                    )}
                    {part.mileage && (
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[9px]">MILEAGE</span>
                        <span className="text-amber-300 font-bold truncate block">{part.mileage}</span>
                      </div>
                    )}
                    {part.engineInstalled && (
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[9px]">ENGINE</span>
                        <span className="text-white font-bold truncate block">{part.engineInstalled}</span>
                      </div>
                    )}
                    {part.transmissionType && (
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[9px]">TRANSMISSION</span>
                        <span className="text-white font-bold truncate block">{part.transmissionType}</span>
                      </div>
                    )}
                    {part.exteriorColor && (
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[9px]">EXTERIOR COLOR</span>
                        <span className="text-white font-bold truncate block">{part.exteriorColor}</span>
                      </div>
                    )}
                    {part.interiorColor && (
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[9px]">INTERIOR COLOR</span>
                        <span className="text-white font-bold truncate block">{part.interiorColor}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Provenance / Technical Description */}
              <div className="bg-slate-950/80 rounded-xl p-3 sm:p-3.5 border border-slate-800 mb-3 sm:mb-4">
                <div className="text-[9px] sm:text-[10px] font-mono text-amber-400 uppercase mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> PROVENANCE & TECHNICAL DESCRIPTION
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-sans line-clamp-4">
                  {part.description || part.provenance || 'No description provided.'}
                </p>
              </div>

              {/* Technical Specifications List */}
              {Array.isArray(part.specifications) && part.specifications.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-6">
                  <div className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Wrench className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" /> Specifications:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono">
                    {part.specifications.map((spec, i) => (
                      <div key={i} className="bg-slate-950 p-2 sm:p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] sm:text-[10px] truncate">{spec.key}</span>
                        <span className="text-slate-200 font-semibold truncate block">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Engine & Vehicle Compatibility List */}
              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-6">
                <div className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" /> Compatibility Matrix:
                </div>
                <ul className="text-[11px] sm:text-xs text-slate-300 space-y-1 font-mono pl-1">
                  {(part.compatibleModels || part.compatibleVehicles || [part.modelYearRange || 'Universal Fitment']).slice(0, 3).map((v, i) => (
                    <li key={i} className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 sm:pt-4 border-t border-slate-800 space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    if (onAddToCart) onAddToCart(part);
                    onClose();
                  }}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-[#ff7a1a] hover:bg-[#ffb68e] text-black py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-xl transition-all uppercase tracking-wider cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add To Cart (${part.price ? part.price.toLocaleString() : '0.00'})</span>
                </button>

                <button
                  onClick={() => {
                    if (onReserveItem) onReserveItem(part);
                    else if (onRequestItem) onRequestItem(part);
                    onClose();
                  }}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-[#181719] hover:bg-[#252426] border border-[#83cffb]/50 text-[#83cffb] hover:text-white py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all uppercase tracking-wider cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#83cffb]" />
                  <span>Reserve Product</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
