import React, { useState, useMemo, useEffect } from 'react';
import { Filter, Search, ShoppingBag, Eye, Heart, Layers, Check, CheckCircle2, Car, X, Image as ImageIcon, SlidersHorizontal, RotateCcw, ShieldCheck, Wrench, Box } from 'lucide-react';
import { VW_NAV_CATEGORIES, VEHICLE_SYSTEMS, ENGINE_COMPATIBILITIES, USAGE_TYPES } from '../data/vwNavigationData';
import { API_BASE_URL } from '../config/api';

export default function CatalogSection({ 
  onAddToCart, 
  onRequestItem,
  onReserveItem,
  onViewPartDetails, 
  onToggleWishlist, 
  wishlistIds, 
  searchTerm, 
  activeFilter,
  onSelectFilter
}) {
  const [selectedCategory, setSelectedCategory] = useState(activeFilter?.categoryId || 'ALL');
  const [selectedModel, setSelectedModel] = useState(activeFilter?.modelId || 'ALL');
  const [selectedSystem, setSelectedSystem] = useState(activeFilter?.systemId || 'ALL');
  const [selectedSubcat, setSelectedSubcat] = useState(activeFilter?.subcatId || 'ALL');
  const [selectedDirectPart, setSelectedDirectPart] = useState(activeFilter?.directPartId || 'ALL');
  const [selectedEngine, setSelectedEngine] = useState(activeFilter?.engineSize || 'ALL');
  const [selectedUsage, setSelectedUsage] = useState('ALL');
  const [addedIds, setAddedIds] = useState([]);

  // Sync active filter props
  useEffect(() => {
    if (activeFilter) {
      if (activeFilter.categoryId !== undefined) setSelectedCategory(activeFilter.categoryId);
      if (activeFilter.modelId !== undefined) setSelectedModel(activeFilter.modelId);
      if (activeFilter.systemId !== undefined) setSelectedSystem(activeFilter.systemId);
      if (activeFilter.subcatId !== undefined) setSelectedSubcat(activeFilter.subcatId);
      if (activeFilter.directPartId !== undefined) setSelectedDirectPart(activeFilter.directPartId);
      if (activeFilter.engineSize !== undefined) setSelectedEngine(activeFilter.engineSize);
    }
  }, [activeFilter]);

  const currentCategoryObj = VW_NAV_CATEGORIES.find(c => c.id === selectedCategory);
  const availableModels = currentCategoryObj ? currentCategoryObj.models : [];

  const currentSystemObj = VEHICLE_SYSTEMS.find(s => s.id === selectedSystem);
  
  // Initialize ONLY from real cached DB items (or empty array) - NEVER hardcoded mock items
  const [catalogItems, setCatalogItems] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_db_parts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const localParts = JSON.parse(localStorage.getItem('custom_parts') || '[]');
      if (Array.isArray(localParts) && localParts.length > 0) return localParts;
    } catch (e) {}
    return [];
  });
  const [isLoadingParts, setIsLoadingParts] = useState(false);

  // Fetch dynamic items posted via Admin Panel / Supabase DB
  useEffect(() => {
    const fetchCatalogParts = async () => {
      setIsLoadingParts(true);
      let serverParts = null;
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/parts`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          serverParts = data.data;
        }
      } catch (err) {
        console.warn('Backend server unreachable, reading from local cache.');
      }

      const localParts = JSON.parse(localStorage.getItem('custom_parts') || '[]');
      const deletedIds = new Set(JSON.parse(localStorage.getItem('deleted_part_ids') || '[]'));

      if (serverParts !== null && Array.isArray(serverParts)) {
        // Server Supabase database is the sole authoritative source of truth across all devices
        const filteredServerParts = serverParts.filter(p => !deletedIds.has(p.id));
        const serverIdSet = new Set(serverParts.map(p => p.id));
        const unsyncedLocal = localParts.filter(p => !deletedIds.has(p.id) && !serverIdSet.has(p.id));
        const finalParts = [...unsyncedLocal, ...filteredServerParts];
        setCatalogItems(finalParts);
        try {
          localStorage.setItem('cached_db_parts', JSON.stringify(finalParts));
        } catch (e) {}
      } else {
        // Local cache fallback when server is completely offline
        const filteredLocal = localParts.filter(p => !deletedIds.has(p.id));
        setCatalogItems(filteredLocal);
      }
      setIsLoadingParts(false);
    };
    fetchCatalogParts();
  }, []);

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedModel('ALL');
    setSelectedSystem('ALL');
    setSelectedSubcat('ALL');
    setSelectedDirectPart('ALL');
    setSelectedEngine('ALL');
    setSelectedUsage('ALL');
    onSelectFilter({ categoryId: 'ALL', modelId: 'ALL', systemId: 'ALL', subcatId: 'ALL', directPartId: 'ALL', engineSize: 'ALL' });
  };

  // Smart Filtering Logic
  const filteredParts = useMemo(() => {
    return catalogItems.filter((part) => {
      const searchLower = searchTerm ? searchTerm.toLowerCase() : '';
      const matchesSearch = !searchTerm || 
        (part.title && part.title.toLowerCase().includes(searchLower)) ||
        (part.sku && part.sku.toLowerCase().includes(searchLower)) ||
        (part.oemNumber && part.oemNumber.toLowerCase().includes(searchLower)) ||
        (part.description && part.description.toLowerCase().includes(searchLower));

      const matchesCategory = selectedCategory === 'ALL' || 
        part.categoryId === selectedCategory || 
        part.vehicleCategory === selectedCategory ||
        (selectedCategory === 'type-1' && (part.vehicleCategory === 'type-1' || part.vehicleFamily === 'beetle-models')) ||
        (selectedCategory === 'type-2' && (part.vehicleCategory === 'type-2' || part.vehicleFamily === 'bus-models')) ||
        (selectedCategory === 'type-3' && (part.vehicleCategory === 'type-3' || part.vehicleFamily === 'type3-models')) ||
        (selectedCategory === 'type-14' && (part.vehicleCategory === 'type-14' || part.vehicleFamily === 'ghia-models'));

      const matchesModel = selectedModel === 'ALL' || 
        part.modelId === selectedModel || 
        part.vehicleModelId === selectedModel ||
        part.modelYearRange === selectedModel ||
        (Array.isArray(part.compatibleModels) && part.compatibleModels.includes(selectedModel));

      const matchesSystem = selectedSystem === 'ALL' || 
        part.systemId === selectedSystem || 
        part.systemCategory === selectedSystem || 
        part.partSystem === selectedSystem ||
        part.mainSystem === selectedSystem;

      const matchesSubcat = selectedSubcat === 'ALL' || 
        part.subcatId === selectedSubcat || 
        part.partSubcategory === selectedSubcat || 
        part.specificPartCategory === selectedSubcat || 
        part.subcategory === selectedSubcat;

      const matchesDirectPart = selectedDirectPart === 'ALL' || part.directPartId === selectedDirectPart;

      const matchesEngine = selectedEngine === 'ALL' || 
        part.engineSize === selectedEngine || 
        part.engineCompatibility === selectedEngine ||
        (Array.isArray(part.compatibleEngineSizes) && part.compatibleEngineSizes.includes(selectedEngine));

      const matchesUsage = selectedUsage === 'ALL' || part.usage === selectedUsage;

      return matchesSearch && matchesCategory && matchesModel && matchesSystem && matchesSubcat && matchesDirectPart && matchesEngine && matchesUsage;
    });
  }, [catalogItems, searchTerm, selectedCategory, selectedModel, selectedSystem, selectedSubcat, selectedDirectPart, selectedEngine, selectedUsage]);

  const handleAdd = (part) => {
    onAddToCart(part);
    setAddedIds(prev => [...prev, part.id]);
    setTimeout(() => {
      setAddedIds(prev => prev.filter(id => id !== part.id));
    }, 2000);
  };

  const availableSubcategories = currentSystemObj ? currentSystemObj.subcategories : [];

  return (
    <section id="catalog" className="py-10 sm:py-16 bg-[#131314] relative border-b border-[#584236]/20 font-technical-data">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 md:px-8">
        
        {/* Catalog Filter Header & Toolbar */}
        <div className="bg-[#181719] border border-[#584236]/50 rounded-xs p-3 sm:p-5 mb-6 sm:mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#584236]/30 mb-3 sm:mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[#ff7a1a] uppercase tracking-wider mb-0.5 sm:mb-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>SPARE PARTS CATALOG // CLASSIFIED FILTERING</span>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#e5e2e3]">
                Inventory Parts ({filteredParts.length} Available)
              </h2>
            </div>

            {(selectedCategory !== 'ALL' || selectedModel !== 'ALL' || selectedSystem !== 'ALL' || selectedSubcat !== 'ALL' || selectedEngine !== 'ALL') && (
              <button
                onClick={handleResetFilters}
                className="self-start md:self-auto text-[11px] sm:text-xs text-[#83cffb] hover:text-white bg-[#201f20] px-2.5 py-1 sm:px-3 sm:py-1.5 border border-[#83cffb]/30 rounded-xs flex items-center gap-1 font-bold transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          {/* Primary System Selector Bar */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <span className="text-[10px] sm:text-[11px] text-[#a78b7d] uppercase font-bold block mb-1.5">
                1. Select Vehicle System:
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => {
                    setSelectedSystem('ALL');
                    setSelectedSubcat('ALL');
                  }}
                  className={`text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xs font-bold transition-all border ${
                    selectedSystem === 'ALL'
                      ? 'bg-[#ff7a1a] text-black border-[#ff7a1a]'
                      : 'bg-[#201f20] text-[#e0c0b1] border-[#584236]/40 hover:border-[#ff7a1a] hover:text-[#ff7a1a]'
                  }`}
                >
                  All Systems
                </button>
                {VEHICLE_SYSTEMS.map((sys) => {
                  const isActive = selectedSystem === sys.id;
                  return (
                    <button
                      key={sys.id}
                      onClick={() => {
                        setSelectedSystem(sys.id);
                        setSelectedSubcat('ALL');
                      }}
                      className={`text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xs font-bold transition-all border flex items-center gap-1 ${
                        isActive
                          ? 'bg-[#ff7a1a] text-black border-[#ff7a1a]'
                          : 'bg-[#201f20] text-[#e0c0b1] border-[#584236]/40 hover:border-[#ff7a1a] hover:text-[#ff7a1a]'
                      }`}
                    >
                      <span className="text-xs">{sys.emoji}</span>
                      <span>{sys.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subcategories Selector Bar when a System is active */}
            {selectedSystem !== 'ALL' && currentSystemObj && (
              <div className="p-2.5 sm:p-3 bg-[#131314] border border-[#ff7a1a]/40 rounded-xs animate-in fade-in duration-200">
                <span className="text-[11px] sm:text-xs font-bold text-[#ff7a1a] block mb-1.5">
                  2. Subcategories in {currentSystemObj.emoji} {currentSystemObj.name}:
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setSelectedSubcat('ALL')}
                    className={`text-[10px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xs font-bold transition-all border ${
                      selectedSubcat === 'ALL'
                        ? 'bg-[#ff7a1a] text-black border-[#ff7a1a]'
                        : 'bg-[#201f20] text-[#e0c0b1] border-[#584236]/50 hover:border-[#ff7a1a]'
                    }`}
                  >
                    All {currentSystemObj.name} Subcategories
                  </button>
                  {availableSubcategories.map((sub) => {
                    const isSubActive = selectedSubcat === sub.name || selectedSubcat === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedSubcat(sub.name)}
                        className={`text-[10px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xs font-bold transition-all border ${
                          isSubActive
                            ? 'bg-[#ff7a1a] text-black border-[#ff7a1a]'
                            : 'bg-[#201f20] text-[#e0c0b1] border-[#584236]/50 hover:border-[#ff7a1a] hover:text-[#ff7a1a]'
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        {isLoadingParts && catalogItems.length === 0 ? (
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-[#201f20]/60 border border-[#584236]/30 p-4 rounded-xs space-y-3">
                <div className="h-44 bg-[#141415] rounded-xs flex items-center justify-center text-[#a78b7d] text-xs font-mono">
                  Loading Live Inventory...
                </div>
                <div className="h-4 bg-[#141415] rounded w-3/4"></div>
                <div className="h-3 bg-[#141415] rounded w-1/2"></div>
                <div className="h-8 bg-[#ff7a1a]/20 rounded w-full mt-3"></div>
              </div>
            ))}
          </div>
        ) : filteredParts.length === 0 ? (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Notification Banner */}
            <div className="text-center py-6 sm:py-8 bg-[#181719] border border-dashed border-[#584236]/60 rounded-xs p-4 sm:p-6 max-w-3xl mx-auto shadow-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#ff7a1a]/10 border border-[#ff7a1a]/40 flex items-center justify-center mx-auto mb-2 sm:mb-3 text-[#ff7a1a]">
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#e5e2e3] mb-1 font-h2">
                0 Inventory Items Currently Available
              </h3>
              <p className="text-[#a78b7d] text-[11px] sm:text-xs max-w-md mx-auto leading-relaxed mb-3 sm:mb-4">
                No spare parts match the active criteria. Clear filters or browse other systems.
              </p>
              <button
                onClick={handleResetFilters}
                className="text-[11px] sm:text-xs font-bold text-black bg-[#ff7a1a] hover:bg-[#ffb68e] px-4 py-1.5 sm:px-5 sm:py-2 rounded-xs uppercase tracking-wider transition-all glow-button inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>

            {/* Empty Inventory Cards Grid (Visual Placeholder Boxes) */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {[1, 2, 3, 4].map((slot) => (
                <div 
                  key={slot}
                  className="bg-[#181719]/80 border border-dashed border-[#584236]/50 p-3 sm:p-4 rounded-xs flex flex-col justify-between space-y-3 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="space-y-2">
                    <div className="h-32 sm:h-36 md:h-44 bg-[#131314] border border-[#584236]/40 rounded-xs flex flex-col items-center justify-center text-[#584236] p-2 text-center">
                      <ImageIcon className="w-6 h-6 mb-1 text-[#584236]" />
                      <span className="text-[9px] sm:text-[11px] font-bold text-[#a78b7d] uppercase tracking-wider">Empty Slot</span>
                      <span className="text-[8px] sm:text-[9px] text-[#584236]">Awaiting Upload</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[8px] sm:text-[9px] text-[#ff7a1a] uppercase font-bold block">
                        Slot #{slot}
                      </span>
                      <h4 className="text-[11px] sm:text-xs font-bold text-[#e5e2e3] line-clamp-1">
                        Ready for Upload
                      </h4>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#584236]/30 flex items-center justify-between text-[9px] sm:text-[10px] text-[#584236] font-bold uppercase">
                    <span>UNPOPULATED</span>
                    <span className="text-[#ff7a1a]">$0.00</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-6">
            {filteredParts.map((part) => {
              const isWishlisted = wishlistIds.includes(part.id);
              const isAdded = addedIds.includes(part.id);

              return (
                <div
                  key={part.id}
                  className="bg-[#201f20] border border-[#584236]/40 p-3 sm:p-4 flex flex-col justify-between rounded-xs group hover:border-[#ff7a1a] transition-all shadow-md"
                >
                  <div>
                    <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden bg-[#0e0e0f] rounded-xs mb-2.5 sm:mb-4 flex items-center justify-center border border-[#584236]/30">
                      {part.image ? (
                        <img
                          src={part.image}
                          alt={part.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center text-[#a78b7d] space-y-1">
                          <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-[#584236]" />
                          <span className="text-[9px] sm:text-[10px] block">Image Slot</span>
                        </div>
                      )}

                      <button
                        onClick={() => onToggleWishlist(part.id)}
                        className={`absolute top-2 right-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xs backdrop-blur-md transition-all cursor-pointer ${
                          isWishlisted
                            ? 'bg-[#ff7a1a] text-black'
                            : 'bg-[#131314]/80 text-[#e0c0b1] hover:text-[#ff7a1a]'
                        }`}
                        title="Save to Wishlist"
                        aria-label="Wishlist item"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="space-y-1 sm:space-y-1.5 mb-3">
                      <span className="text-[9px] sm:text-[10px] text-[#ff7a1a] uppercase font-bold block truncate">
                        {part.systemCategory || part.partSystem || 'Vehicle Part'} { (part.partSubcategory || part.specificPartCategory || part.subcatId) ? `• ${part.partSubcategory || part.specificPartCategory || part.subcatId}` : '' }
                      </span>
                      <h3 className="font-h3 text-xs sm:text-sm font-bold text-[#e5e2e3] group-hover:text-[#ff7a1a] transition-colors line-clamp-2 leading-tight">
                        {part.title}
                      </h3>
                      {part.oemNumber && (
                        <div className="text-[10px] text-[#83cffb] truncate">
                          OEM // {part.oemNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2.5 sm:pt-3 border-t border-[#584236]/30 flex flex-col space-y-2">
                    <button
                      onClick={() => onRequestItem ? onRequestItem(part) : onAddToCart(part)}
                      className="w-full min-h-[40px] sm:min-h-[44px] text-xs bg-[#ff7a1a] hover:bg-[#ffb68e] text-black font-bold py-2 px-3 rounded-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Box className="w-3.5 h-3.5" /> Request Item
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewPartDetails(part)}
                        className="flex-1 min-h-[36px] text-xs text-[#e0c0b1] hover:text-white bg-[#131314] hover:bg-[#1c1b1c] py-1.5 px-2 border border-[#584236]/50 rounded-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3 h-3" /> Specs
                      </button>

                      <button
                        onClick={() => onReserveItem && onReserveItem(part)}
                        className="flex-1 min-h-[36px] text-xs text-[#ff7a1a] hover:text-white bg-[#201f20] hover:bg-[#353436] py-1.5 px-2 border border-[#584236]/60 rounded-xs font-bold uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <ShieldCheck className="w-3 h-3" /> Reserve
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
