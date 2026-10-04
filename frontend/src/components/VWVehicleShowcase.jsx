import React, { useState, useEffect, useMemo } from 'react';
import { VW_NAV_CATEGORIES, VEHICLE_SYSTEMS, DETAILED_ENGINES } from '../data/vwNavigationData';
import { API_BASE_URL } from '../config/api';
import { 
  Car, Cpu, Wrench, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Image as ImageIcon, 
  Sparkles, CheckCircle2, SlidersHorizontal, Flame, Zap, Cog, Wind, Sliders, 
  Disc, Shield, Armchair, Layers, Box, Eye, Check, Key, Gauge
} from 'lucide-react';

// Auto-Rotating & Swipeable Image Slider for Landing Page Category Cards
function CategoryImageRotator({ images, categoryName, onOpenGallery, activeVehicle }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-shift pictures every 3.5 seconds when multiple images exist
  useEffect(() => {
    if (!images || images.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images, isPaused]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  // Touch swipe support (left / right)
  const minSwipeDistance = 40;
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = (e) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      e.stopPropagation();
      handleNext(e);
    } else if (distance < -minSwipeDistance) {
      e.stopPropagation();
      handlePrev(e);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-[#1b1a1c] to-[#131314] flex flex-col items-center justify-center text-[#584236] group-hover:text-[#ff7a1a] transition-all p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[#131314] border border-[#584236]/60 flex items-center justify-center mb-2.5 group-hover:border-[#ff7a1a]/60 group-hover:scale-105 transition-all shadow-inner">
          <Car className="w-7 h-7 text-[#a78b7d] group-hover:text-[#ff7a1a] transition-colors" />
        </div>
        <span className="text-xs text-[#e5e2e3] font-bold uppercase tracking-wider font-mono">
          {categoryName}
        </span>
        <span className="text-[10px] text-[#ff7a1a]/80 mt-1 font-mono">
          Upload Category Photo in Admin
        </span>
      </div>
    );
  }

  const currentImage = images[currentIndex % images.length];

  return (
    <div 
      className="relative w-full h-full overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <img 
        key={currentIndex}
        src={currentImage} 
        alt={`${categoryName} photo ${currentIndex + 1}`} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100 animate-in fade-in duration-500" 
      />

      {/* Manual Left/Right Arrow Buttons on Hover / Mobile */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/75 hover:bg-[#ff7a1a] text-white hover:text-black border border-[#584236] hover:border-[#ff7a1a] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/75 hover:bg-[#ff7a1a] text-white hover:text-black border border-[#584236] hover:border-[#ff7a1a] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Indicator Dots at Bottom */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full border border-black/40 pointer-events-auto">
            {images.map((_, i) => (
              <span
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                className={`transition-all rounded-full cursor-pointer ${
                  currentIndex === i
                    ? 'w-3.5 h-1.5 bg-[#ff7a1a]'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          {/* Rotating badge */}
          <div className="absolute bottom-2.5 right-2.5 z-10 hidden sm:flex items-center gap-1 bg-black/70 backdrop-blur-sm border border-[#ff7a1a]/30 px-1.5 py-0.5 rounded text-[8px] font-mono text-[#ff7a1a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a1a] animate-pulse"></span>
            <span>{currentIndex + 1}/{images.length}</span>
          </div>
        </>
      )}

      {/* Inspect Photo Gallery Button */}
      {onOpenGallery && activeVehicle && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenGallery(activeVehicle);
          }}
          className="absolute bottom-2.5 left-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 hover:bg-[#ff7a1a] text-[#83cffb] hover:text-black border border-[#584236] hover:border-[#ff7a1a] text-[9px] font-mono font-bold px-2 py-1 rounded-xs flex items-center gap-1 cursor-pointer shadow-md"
          title="Inspect All Photos & Specs"
        >
          <Eye className="w-3 h-3" />
          <span>Gallery</span>
        </button>
      )}
    </div>
  );
}

export default function VWVehicleShowcase({ 
  onSelectVehicle, 
  onOpenGuidedSearch,
  onViewVehicleDetails,
  onRequestVehicle,
  onReserveVehicle,
  onAddToCart,
  refreshKey
}) {
  const [navMode, setNavMode] = useState('vehicle'); // 'vehicle' | 'systems'
  const [activeViewMode, setActiveViewMode] = useState('both'); // 'both' | 'vehicles-only' | 'parts-only'
  const [currentStep, setCurrentStep] = useState(1); // 1: Category, 2: Model, 3: Engine, 4: Systems & Subcategories
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedMod, setSelectedMod] = useState(null);
  const [selectedEng, setSelectedEng] = useState(null);
  const [selectedSys, setSelectedSys] = useState(null);
  const [expandedSystemId, setExpandedSystemId] = useState(null);

  // Complete Vehicles Database State - loads all complete vehicles cleanly at once
  const [completeVehicles, setCompleteVehicles] = useState([]);

  // Fetch Complete Vehicles from API
  useEffect(() => {
    let isMounted = true;
    const fetchVehicles = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/parts`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && isMounted) {
            const deletedIds = new Set(JSON.parse(localStorage.getItem('deleted_part_ids') || '[]'));
            const vehicles = json.data.filter(p => 
              !deletedIds.has(p.id) && (
                p.listingType === 'vehicle' || 
                p.systemCategory === 'vehicle-complete' ||
                p.partSubcategory === 'Complete Vehicle' ||
                p.specificPartCategory === 'Complete Vehicle' ||
                p.subcatId === 'complete-vehicle'
              )
            );
            setCompleteVehicles(vehicles);
          }
        }
      } catch (err) {
        console.warn('Could not fetch complete vehicles from API:', err);
      }
    };
    fetchVehicles();
    return () => { isMounted = false; };
  }, [refreshKey]);

  // Helper: Match a vehicle to a category in VW_NAV_CATEGORIES
  const isVehicleInCategory = (vehicle, categoryId) => {
    if (!vehicle || !categoryId) return false;
    const cat = (vehicle.vehicleCategory || vehicle.carModelId || '').toLowerCase();
    const title = (vehicle.title || '').toLowerCase();
    const model = (vehicle.modelYearRange || vehicle.carModelName || '').toLowerCase();

    if (categoryId === 'beetle-models' || categoryId === 'type-1') {
      return cat === 'type-1' || cat === 'beetle-models' || title.includes('beetle') || model.includes('beetle') || title.includes('bug');
    }
    if (categoryId === 'bus-vans' || categoryId === 'type-2') {
      return cat === 'type-2' || cat === 'bus-vans' || cat === 'bus-models' || title.includes('bus') || model.includes('bus') || title.includes('transporter') || title.includes('van') || title.includes('westfalia');
    }
    if (categoryId === 'classic-sports' || categoryId === 'type-14') {
      return cat === 'classic-sports' || cat === 'type-14' || cat === 'ghia-models' || title.includes('ghia') || model.includes('ghia') || title.includes('356') || title.includes('karmann');
    }
    if (categoryId === 'type-3-type-4' || categoryId === 'type-3' || categoryId === 'type-4') {
      return cat === 'type-3-type-4' || cat === 'type-3' || cat === 'type-4' || cat === 'type3-models' || title.includes('type 3') || title.includes('type 4') || title.includes('notchback') || title.includes('squareback') || title.includes('fastback');
    }
    if (categoryId === 'military-offroad') {
      return cat === 'military-offroad' || cat === 'military' || title.includes('thing') || title.includes('kübelwagen') || title.includes('kuebelwagen') || title.includes('schwimmwagen') || title.includes('sand rail');
    }
    if (categoryId === 'custom-kit-cars') {
      return cat === 'custom-kit-cars' || cat === 'custom' || title.includes('manx') || title.includes('buggy') || title.includes('kit') || title.includes('sterling') || title.includes('bradley');
    }
    return false;
  };

  // Icon Map Helper for 10 Vehicle Systems
  const renderSystemIcon = (systemId) => {
    switch (systemId) {
      case 'engine-system': return <Cpu className="w-6 h-6 text-[#ff7a1a]" />;
      case 'fuel-system': return <Flame className="w-6 h-6 text-[#ff7a1a]" />;
      case 'electrical-system': return <Zap className="w-6 h-6 text-[#ff7a1a]" />;
      case 'transmission-system': return <Cog className="w-6 h-6 text-[#ff7a1a]" />;
      case 'cooling-system': return <Wind className="w-6 h-6 text-[#ff7a1a]" />;
      case 'suspension-system': return <Sliders className="w-6 h-6 text-[#ff7a1a]" />;
      case 'brake-system': return <Disc className="w-6 h-6 text-[#ff7a1a]" />;
      case 'body-system': return <Shield className="w-6 h-6 text-[#ff7a1a]" />;
      case 'interior-system': return <Armchair className="w-6 h-6 text-[#ff7a1a]" />;
      case 'restoration-system': return <Sparkles className="w-6 h-6 text-[#ff7a1a]" />;
      default: return <Wrench className="w-6 h-6 text-[#ff7a1a]" />;
    }
  };

  // Browser Back / Forward support for Vehicle Showcase Steps
  useEffect(() => {
    const handleShowcasePop = (e) => {
      const hash = window.location.hash;
      const state = e.state || {};

      if (hash.startsWith('#model-') || (state.type === 'vw-step' && state.step === 3)) {
        setCurrentStep(3);
        const catId = state.catId;
        if (catId) {
          const cat = VW_NAV_CATEGORIES.find(c => c.id === catId);
          if (cat) setSelectedCat(cat);
          if (state.modId) {
            const mod = cat?.models?.find(m => m.id === state.modId);
            if (mod) setSelectedMod(mod);
          }
        }
      } else if (hash.startsWith('#cat-') || (state.type === 'vw-step' && state.step === 2)) {
        setCurrentStep(2);
        const catId = state.catId || hash.replace('#cat-', '');
        if (catId) {
          const cat = VW_NAV_CATEGORIES.find(c => c.id === catId);
          if (cat) setSelectedCat(cat);
        }
        setSelectedMod(null);
      } else if (
        !hash.startsWith('#part-') && 
        hash !== '#cart' && 
        hash !== '#guided-search' && 
        hash !== '#auth' && 
        hash !== '#admin-login' && 
        hash !== '#admin' && 
        hash !== '#dashboard'
      ) {
        setCurrentStep(1);
        setSelectedCat(null);
        setSelectedMod(null);
      }
    };

    window.addEventListener('popstate', handleShowcasePop);
    return () => window.removeEventListener('popstate', handleShowcasePop);
  }, []);

  // Vehicle Step Handlers
  const handleSelectCategory = (category) => {
    setSelectedCat(category);
    setSelectedMod(null);
    setSelectedEng(null);
    setSelectedSys(null);
    setCurrentStep(2);
    if (window.location.hash !== `#cat-${category.id}`) {
      window.history.pushState({ type: 'vw-step', step: 2, catId: category.id }, '', `#cat-${category.id}`);
    }
  };

  const handleSelectModel = (model) => {
    setSelectedMod(model);
    setSelectedEng(null);
    setSelectedSys(null);
    setCurrentStep(3);
    if (window.location.hash !== `#model-${model.id}`) {
      window.history.pushState({ type: 'vw-step', step: 3, catId: selectedCat?.id, modId: model.id }, '', `#model-${model.id}`);
    }
  };

  const handleSelectEngine = (engine) => {
    setSelectedEng(engine);
    setSelectedSys(null);
    setCurrentStep(4);
  };

  const handleSelectSystem = (system) => {
    setSelectedSys(system);
    onSelectVehicle({
      categoryId: selectedCat?.id || 'ALL',
      modelId: selectedMod?.id || 'ALL',
      engineSize: selectedEng?.size || 'ALL',
      systemId: system.id,
      navMode: 'vehicle'
    });

    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectSubcategory = (systemId, subcatId) => {
    onSelectVehicle({
      categoryId: selectedCat?.id || 'ALL',
      modelId: selectedMod?.id || 'ALL',
      engineSize: selectedEng?.size || 'ALL',
      systemId,
      subcatId,
      navMode: navMode === 'systems' ? 'parts' : 'vehicle'
    });

    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetToCategory = () => {
    if (currentStep > 1 && (window.location.hash.startsWith('#cat-') || window.location.hash.startsWith('#model-'))) {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
    }
    setCurrentStep(1);
    setSelectedCat(null);
    setSelectedMod(null);
    setSelectedEng(null);
    setSelectedSys(null);
  };


  return (
    <section id="vw-showcase" className="py-10 sm:py-16 md:py-20 bg-[#131314] relative border-b border-[#584236]/30 overflow-hidden font-technical-data">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[350px] bg-[#ff7a1a]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-[#584236]/30 gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff7a1a]/10 border border-[#ff7a1a]/30 text-[#ff7a1a] text-[10px] sm:text-xs font-bold mb-2 sm:mb-3 tracking-wider uppercase font-mono">
              <Car className="w-3.5 h-3.5" />
              <span>PRECISION SPARE PARTS CATALOG // CLASSIC AIRCOOLED VW WORKS</span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#e5e2e3] font-h2 tracking-tight">
              We Sell Quality Spare Parts For All <span className="text-[#ff7a1a]">Classic VW Categories</span>
            </h2>
            <p className="text-[#e0c0b1] text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              We specialize in genuine OEM replacement parts, performance upgrades, and restoration components for each classic air-cooled Volkswagen platform. Select your vehicle category below to explore compatible spare parts.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={onOpenGuidedSearch}
              className="min-h-[44px] px-4 py-2.5 sm:px-5 sm:py-2.5 text-[11px] sm:text-xs font-bold bg-[#ff7a1a] hover:bg-[#ffb68e] text-black rounded-xs transition-all uppercase tracking-wider flex items-center gap-1.5 glow-button cursor-pointer font-mono"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guided Parts Finder</span>
            </button>
          </div>
        </div>

        {/* MODE 1: VEHICLE-FIRST NAVIGATION FLOW */}
        {navMode === 'vehicle' && (
          <div>
            {/* 3-Step Breadcrumb Navigation (Category -> Model -> Systems) */}
            <div className="mb-6 sm:mb-10 bg-[#181719]/90 backdrop-blur-md border border-[#584236]/40 p-3 sm:p-4 rounded-xs flex items-center justify-between flex-wrap gap-2.5 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs font-bold flex-wrap">
                
                {/* Step 1 Pill */}
                <button
                  onClick={handleResetToCategory}
                  className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xs transition-all cursor-pointer ${
                    currentStep === 1 
                      ? 'bg-[#ff7a1a] text-black font-bold shadow-md' 
                      : 'bg-[#201f20] text-[#e0c0b1] hover:text-[#ff7a1a] border border-[#584236]/40'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-black/20 text-current text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>1. Category</span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-[#584236]" />

                {/* Step 2 Pill */}
                <button
                  onClick={() => selectedCat && setCurrentStep(2)}
                  disabled={!selectedCat}
                  className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xs transition-all ${
                    currentStep === 2 
                      ? 'bg-[#ff7a1a] text-black font-bold shadow-md cursor-pointer' 
                      : selectedCat 
                        ? 'bg-[#201f20] text-[#e0c0b1] hover:text-[#ff7a1a] border border-[#584236]/40 cursor-pointer' 
                        : 'bg-[#181719] text-[#584236] cursor-not-allowed border border-[#584236]/20'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-black/20 text-current text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>2. Model {selectedMod ? `(${selectedMod.name})` : selectedCat ? `(${selectedCat.name})` : ''}</span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-[#584236]" />

                {/* Step 3 Pill */}
                <button
                  onClick={() => selectedMod && setCurrentStep(3)}
                  disabled={!selectedMod}
                  className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xs transition-all ${
                    currentStep === 3 
                      ? 'bg-[#ff7a1a] text-black font-bold shadow-md cursor-pointer' 
                      : selectedMod 
                        ? 'bg-[#201f20] text-[#e0c0b1] hover:text-[#ff7a1a] border border-[#584236]/40 cursor-pointer' 
                        : 'bg-[#181719] text-[#584236] cursor-not-allowed border border-[#584236]/20'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-black/20 text-current text-[10px] flex items-center justify-center font-bold">3</span>
                  <span>3. Vehicle Systems</span>
                </button>

              </div>

              {currentStep > 1 && (
                <button
                  onClick={() => {
                    if (window.location.hash.startsWith('#cat-') || window.location.hash.startsWith('#model-')) {
                      if (window.history.length > 1) {
                        window.history.back();
                        return;
                      }
                    }
                    setCurrentStep(currentStep - 1);
                  }}
                  className="min-h-[38px] px-2.5 py-1.5 text-[11px] sm:text-xs text-[#83cffb] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}
            </div>

            {/* STEP 1: VEHICLE CATEGORY CARDS */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {VW_NAV_CATEGORIES.map((category) => {
                  const matchingVehicles = completeVehicles.filter(v => isVehicleInCategory(v, category.id));
                  
                  // Collect all photos from posts in this category for rotating showcase
                  const categoryImages = [];
                  matchingVehicles.forEach(v => {
                    if (v.image && !categoryImages.includes(v.image)) {
                      categoryImages.push(v.image);
                    }
                    if (Array.isArray(v.additionalImages)) {
                      v.additionalImages.forEach(img => {
                        if (img && !categoryImages.includes(img)) {
                          categoryImages.push(img);
                        }
                      });
                    }
                  });
                  if (categoryImages.length === 0 && category.image) {
                    categoryImages.push(category.image);
                  }

                  const latestVehicle = matchingVehicles[matchingVehicles.length - 1] || matchingVehicles[0] || null;

                  return (
                    <div
                      key={category.id}
                      onClick={() => handleSelectCategory(category)}
                      className="group relative cursor-pointer rounded-xs overflow-hidden border border-[#584236]/40 hover:border-[#ff7a1a] transition-all duration-300 bg-[#201f20]/60 backdrop-blur-md shadow-xl hover:shadow-[0_10px_35px_rgba(255,122,26,0.25)] hover:-translate-y-1 click-press flex flex-col justify-between"
                    >
                      <div className="relative h-44 sm:h-52 md:h-60 bg-gradient-to-b from-[#181719] to-[#121112] overflow-hidden flex items-center justify-center">
                        <CategoryImageRotator 
                          images={categoryImages}
                          categoryName={category.name}
                          onOpenGallery={onViewVehicleDetails}
                          activeVehicle={latestVehicle}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-[#131314] via-transparent to-black/40 pointer-events-none"></div>

                        {/* Top Badges: Platform Models Count & Available Spare Parts */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                          <span className="bg-[#131314]/90 backdrop-blur-md border border-[#ff7a1a]/40 text-[#ff7a1a] text-[9px] sm:text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xs font-mono">
                            {category.modelsCount}
                          </span>
                          <span className="bg-[#131314]/90 backdrop-blur-md border border-[#584236]/60 text-[#83cffb] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xs font-mono">
                            {category.partsCount}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 sm:p-5 md:p-6 bg-[#201f20]/90 backdrop-blur-xl border-t border-[#584236]/30 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                        <div>
                          <span className="text-[9px] sm:text-[10px] text-[#ff7a1a] uppercase font-bold tracking-widest block mb-0.5 font-mono">
                            {category.subtitle}
                          </span>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#e5e2e3] group-hover:text-[#ff7a1a] transition-colors font-h2">
                            {category.name}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-[#a78b7d] mt-1.5 leading-relaxed line-clamp-2">
                            {category.description}
                          </p>
                        </div>

                        <div className="pt-2.5 sm:pt-3 border-t border-[#584236]/30 flex items-center justify-between">
                          <span className="text-[11px] sm:text-xs font-bold text-[#e0c0b1] group-hover:text-[#ff7a1a] transition-colors flex items-center gap-1 uppercase tracking-wider font-mono">
                            <span>Browse Spare Parts</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#ff7a1a]" />
                          </span>
                          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#131314] border border-[#584236]/60 group-hover:border-[#ff7a1a] flex items-center justify-center text-[#ff7a1a]">
                            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* STEP 2: VEHICLE MODEL SELECTION */}
            {currentStep === 2 && selectedCat && (
              <div>

                <div className="mb-4 sm:mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#e5e2e3] font-h2">
                      Step 2: Select Model for <span className="text-[#ff7a1a]">{selectedCat.name}</span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#a78b7d] mt-1">Select a specific chassis model to browse compatible spare parts.</p>
                  </div>
                  <span className="text-[11px] sm:text-xs text-[#a78b7d]">Showing {selectedCat.models.length} Models</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {selectedCat.models.map((model) => (
                    <div
                      key={model.id}
                      onClick={() => handleSelectModel(model)}
                      className="group cursor-pointer p-3.5 sm:p-5 bg-[#201f20]/80 backdrop-blur-md border border-[#584236]/40 hover:border-[#ff7a1a] rounded-xs transition-all duration-300 hover:-translate-y-1 click-press flex flex-col justify-between hover:shadow-[0_8px_25px_rgba(255,122,26,0.2)]"
                    >
                      <div className="space-y-3 sm:space-y-4">
                        <div className="h-28 sm:h-36 bg-[#131314] border border-[#584236]/40 rounded-xs overflow-hidden flex items-center justify-center group-hover:border-[#ff7a1a]/60 transition-colors relative">
                          {model.image ? (
                            <img src={model.image} alt={model.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center text-[#584236] group-hover:text-[#ff7a1a] transition-colors p-3">
                              <Car className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1" />
                              <span className="text-[9px] sm:text-[10px] text-[#a78b7d] block font-bold">{model.name}</span>
                            </div>
                          )}
                          
                          <span className="absolute top-2 right-2 bg-[#131314]/90 text-[#83cffb] text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 border border-[#83cffb]/30">
                            {model.era}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-[#e5e2e3] group-hover:text-[#ff7a1a] transition-colors">
                            {model.name}
                          </h4>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {model.engines?.map((eng) => (
                              <span key={eng} className="text-[9px] bg-[#131314] text-[#a78b7d] px-1.5 py-0.5 border border-[#584236]/30">
                                {eng}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#584236]/30 flex items-center justify-between text-[11px] sm:text-xs text-[#ff7a1a] font-bold uppercase">
                        <span>Browse Systems</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: SHOW 10 VEHICLE SYSTEMS */}
            {currentStep === 3 && (
              <div>
                <div className="mb-4 sm:mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#e5e2e3] font-h2">
                      Step 3: Select Vehicle System for <span className="text-[#ff7a1a]">{selectedMod?.name || selectedCat?.name}</span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#a78b7d] mt-1">Select a mechanical system to isolate 100% compatible spare parts.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
                  {VEHICLE_SYSTEMS.map((system) => (
                    <div
                      key={system.id}
                      onClick={() => handleSelectSystem(system)}
                      className="group cursor-pointer p-2.5 sm:p-3 bg-[#201f20] border border-[#584236]/50 hover:border-[#ff7a1a] rounded-xs transition-all click-press flex flex-col justify-between hover:shadow-[0_6px_20px_rgba(255,122,26,0.2)] space-y-2"
                    >
                      <div className="space-y-1.5">
                        <div className="w-8 h-8 rounded-xs bg-[#131314] border border-[#584236]/50 flex items-center justify-center group-hover:border-[#ff7a1a] text-base">
                          {system.emoji || renderSystemIcon(system.id)}
                        </div>
                        <h4 className="text-[11px] sm:text-xs font-bold text-[#e5e2e3] group-hover:text-[#ff7a1a] truncate">
                          {system.name}
                        </h4>
                        <p className="text-[9px] sm:text-[10px] text-[#a78b7d] line-clamp-2">
                          {system.description}
                        </p>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-[#584236]/30 flex items-center justify-between text-[9px] sm:text-[10px] text-[#ff7a1a] font-bold uppercase">
                        <span>Browse</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* MODE 2: PARTS-FIRST SYSTEM TREE (CB PERFORMANCE DEPTH) */}
        {navMode === 'systems' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VEHICLE_SYSTEMS.map((system) => {
                const isExpanded = expandedSystemId === system.id;

                return (
                  <div
                    key={system.id}
                    className="bg-[#201f20] border border-[#584236]/40 hover:border-[#ff7a1a]/60 rounded-xs p-5 transition-all"
                  >
                    <div 
                      onClick={() => setExpandedSystemId(isExpanded ? null : system.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xs bg-[#131314] border border-[#584236]/50 flex items-center justify-center text-[#ff7a1a]">
                          {renderSystemIcon(system.id)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[#e5e2e3] hover:text-[#ff7a1a] font-h2">
                            {system.name}
                          </h3>
                          <p className="text-xs text-[#a78b7d]">{system.description}</p>
                        </div>
                      </div>

                      <span className="text-xs font-technical-data font-bold text-[#83cffb] bg-[#131314] px-3 py-1.5 rounded-xs border border-[#584236]/40 flex items-center gap-1">
                        <span>{system.subcategories?.length || 0} Subcats</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90 text-[#ff7a1a]' : ''}`} />
                      </span>
                    </div>

                    {/* Expandable Subcategories Grid */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[#584236]/30 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                        {system.subcategories?.map((subcat) => (
                          <div
                            key={subcat.id}
                            onClick={() => handleSelectSubcategory(system.id, subcat.id)}
                            className="p-3 bg-[#131314] border border-[#584236]/40 hover:border-[#ff7a1a] rounded-xs cursor-pointer group transition-all"
                          >
                            <span className="text-xs font-bold text-[#e5e2e3] group-hover:text-[#ff7a1a] flex items-center justify-between">
                              <span>{subcat.name}</span>
                              <ArrowRight className="w-3 h-3 text-[#584236] group-hover:text-[#ff7a1a] group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {subcat.parts?.slice(0, 3).map((p) => (
                                <span key={p} className="text-[9px] bg-[#201f20] text-[#a78b7d] px-1.5 py-0.5 border border-[#584236]/30">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
