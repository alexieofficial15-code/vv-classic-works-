import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, User, Menu, X, Wrench, ChevronDown, ChevronRight, Layers, Sparkles, Lock, LogOut, MapPin, Phone } from 'lucide-react';
import { VW_NAV_CATEGORIES } from '../data/vwNavigationData';
import MegaMenu from './MegaMenu';

export default function Navbar({ 
  cartCount, 
  userRequestsCount = 0,
  wishlistCount, 
  onOpenCart, 
  onOpenUserDashboard,
  onSearchChange, 
  searchTerm, 
  onOpenAuth,
  onOpenAdminLogin,
  activeFilter,
  onSelectFilter,
  currentUser,
  onLogout,
  onNavigateToShop,
  onNavigate
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHoverCat, setActiveHoverCat] = useState(null);
  const [pinnedCat, setPinnedCat] = useState(null);
  const [expandedMobileCat, setExpandedMobileCat] = useState(null);

  // Active Menu display object (pinned takes precedence)
  const currentMenuObj = pinnedCat || activeHoverCat;

  // Hover delay handling for smooth response
  const handleMouseEnter = (cat) => {
    if (!pinnedCat) {
      setActiveHoverCat(cat);
    }
  };

  const handleMouseLeave = () => {
    if (!pinnedCat) {
      setActiveHoverCat(null);
    }
  };

  const handleCategoryClick = (cat, filterObj) => {
    const isSameCat = pinnedCat && (pinnedCat.id === cat.id && pinnedCat.menuType === cat.menuType);

    if (isSameCat) {
      // Toggle off pin
      setPinnedCat(null);
      setActiveHoverCat(null);
    } else {
      // Pin menu open directly without scrolling down
      setPinnedCat(cat);
      setActiveHoverCat(cat);
      if (filterObj) {
        onSelectFilter(filterObj, { preventScroll: true });
      }
    }
  };

  const handleCloseMenu = () => {
    setPinnedCat(null);
    setActiveHoverCat(null);
  };

  const toggleMobileAccordion = (catId) => {
    setExpandedMobileCat(expandedMobileCat === catId ? null : catId);
  };

  const handleMobileSelectFilter = (filterObj) => {
    onSelectFilter(filterObj);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#131314]/95 backdrop-blur-xl border-b border-[#584236]/30 text-white transition-all duration-300">
      
      {/* Top Header Bar */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 md:px-8 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 border-b border-[#584236]/20">
        
        {/* Brand Logo Header */}
        <button 
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate('/');
            } else if (onNavigateToShop) {
              onNavigateToShop();
            }
          }} 
          className="flex items-center space-x-2 sm:space-x-3 group shrink-0 text-left focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xs overflow-hidden border border-[#ff7a1a]/60 shadow-[0_0_12px_rgba(255,122,26,0.35)] group-hover:border-[#ff7a1a] transition-all bg-[#141416] flex items-center justify-center shrink-0">
            <img 
              src="/logo.png" 
              alt="Classic Aircooled VW Works Emblem" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div>
            <div className="font-h2 text-xs sm:text-base md:text-lg font-bold tracking-tighter text-[#ff7a1a] flex items-center leading-none select-none">
              {"CLASSIC AIRCOOLED VW WORKS".split('').map((char, index) => (
                <span
                  key={index}
                  className="animate-jump-swing"
                  style={{
                    animationDelay: `${index * 0.06}s`,
                    display: 'inline-block',
                    width: char === ' ' ? '0.25em' : 'auto'
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </div>
            <span className="text-[7px] sm:text-[9px] tracking-widest text-[#a78b7d] uppercase font-technical-data font-bold block mt-0.5">
              ENGINES, SPARE PARTS & WORKSHOP
            </span>
          </div>
        </button>

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full font-technical-data">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a78b7d]" />
            <input
              type="text"
              placeholder="Search VW parts, casting codes, OEM numbers..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#201f20] border border-[#584236]/50 pl-9 pr-3 py-1.5 text-xs text-[#e5e2e3] placeholder-[#a78b7d] focus:outline-none focus:border-[#ff7a1a] transition-all"
            />
          </div>
        </div>

        {/* Action Buttons: Phone Call, Cart, Wishlist, Location, Auth / Dashboard */}
        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
          
          {/* Direct Phone Call Button (desktop) */}
          <a
            href="tel:19452879865"
            className="hidden xl:flex items-center gap-1.5 font-technical-data text-xs text-[#e0c0b1] hover:text-[#ff7a1a] bg-[#201f20] hover:bg-[#2c2b2d] border border-[#584236]/40 px-2.5 py-2 min-h-[40px] sm:min-h-[44px] rounded-xs transition-all shadow-sm shrink-0"
            title="Call Workshop Support: 1945-287-9865"
          >
            <Phone className="w-3.5 h-3.5 text-[#ff7a1a]" />
            <span className="font-mono font-bold">1945-287-9865</span>
          </a>

          {/* Cart Button */}
          <button 
            onClick={onOpenCart}
            className="relative min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 text-[#e0c0b1] hover:text-[#ff7a1a] bg-[#201f20]/60 hover:bg-[#201f20] border border-[#584236]/40 rounded-xs transition-all cursor-pointer"
            title="Shopping Cart"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ff7a1a] text-black text-[9px] sm:text-[10px] font-technical-data font-bold px-1.5 py-0.5 rounded-full leading-none shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Workshop Location Button */}
          <a
            href="/contact"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('/contact');
              }
            }}
            className="hidden md:flex items-center gap-1.5 font-label-caps text-xs text-[#e0c0b1] hover:text-[#ff7a1a] bg-[#201f20] hover:bg-[#2c2b2d] border border-[#584236]/40 px-2.5 py-2 min-h-[40px] sm:min-h-[44px] uppercase font-bold tracking-wider rounded-xs transition-all shadow-sm"
            title="Houston Workshop & Garage Map"
          >
            <MapPin className="w-3.5 h-3.5 text-[#ff7a1a]" />
            <span>Workshop Map</span>
          </a>

          {/* Wishlist Button */}
          <button 
            className="relative min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 text-[#e0c0b1] hover:text-[#ff7a1a] transition-colors" 
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ff7a1a] text-black text-[9px] sm:text-[10px] font-technical-data font-bold px-1.5 py-0.5 rounded-full leading-none">
                {wishlistCount}
              </span>
            )}
          </button>

          {currentUser ? (
            <>
              {/* User Dashboard & Requests Trigger */}
              <button 
                onClick={onOpenUserDashboard}
                className="relative min-h-[40px] sm:min-h-[44px] flex items-center gap-1.5 sm:gap-2 bg-[#ff7a1a] hover:bg-[#ffb68e] text-black border border-[#ff7a1a] px-2.5 py-1.5 sm:px-3.5 sm:py-2 transition-all rounded-xs font-bold text-xs cursor-pointer shadow-sm"
                title="User Dashboard & Garage"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                <span className="hidden sm:inline font-label-caps text-xs uppercase tracking-wider">Dashboard</span>
                <span className="bg-black text-[#ff7a1a] text-[9px] sm:text-[10px] font-technical-data font-bold px-1.5 py-0.5 rounded-xs">
                  {userRequestsCount}
                </span>
              </button>

              {/* Logout Button */}
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="min-h-[40px] sm:min-h-[44px] flex items-center gap-1 font-label-caps text-[11px] sm:text-xs bg-[#201f20] hover:bg-red-600 hover:text-white border border-red-500/40 text-red-400 px-2 sm:px-3 py-1.5 sm:py-2 uppercase font-bold tracking-wider rounded-xs transition-all cursor-pointer shadow-sm"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </>
          ) : (
            /* Auth Modal Trigger (Login / Register) */
            <button 
              onClick={onOpenAuth}
              className="min-h-[40px] sm:min-h-[44px] flex items-center gap-1 sm:gap-1.5 font-label-caps text-[11px] sm:text-xs text-black bg-[#ff7a1a] hover:bg-[#ffb68e] border border-[#ff7a1a] px-2.5 py-1.5 sm:px-3.5 sm:py-2 uppercase font-bold tracking-wider rounded-xs transition-all shadow-md cursor-pointer"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
              <span>Login</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 text-[#e0c0b1] hover:text-[#ff7a1a] bg-[#201f20]/40 border border-[#584236]/30 rounded-xs cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Desktop Navigation Bar with Dual Mode Switcher & Click-to-Pin Dropdown */}
      <nav className="hidden lg:block bg-[#181719] border-b border-[#584236]/30">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between font-label-caps text-xs tracking-wider uppercase">
          
          {/* Left Side: Clean Vehicle Categories */}
          <div className="flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
            {VW_NAV_CATEGORIES.map((cat) => {
              const catObj = { ...cat, menuType: 'vehicle' };
              const isHovered = activeHoverCat?.id === cat.id && activeHoverCat?.menuType === 'vehicle';
              const isPinned = pinnedCat?.id === cat.id && pinnedCat?.menuType === 'vehicle';
              const isActive = isHovered || isPinned;

              return (
                <div 
                  key={cat.id}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(catObj)}
                >
                  <button
                    onClick={() => handleCategoryClick(catObj, { categoryId: cat.id, navMode: 'vehicle' })}
                    className={`py-3 px-3.5 flex items-center gap-1.5 transition-colors font-bold ${
                      isPinned
                        ? 'text-black bg-[#ff7a1a] font-bold shadow-md'
                        : isHovered
                          ? 'text-[#ff7a1a] bg-[#201f20]' 
                          : 'text-[#e0c0b1] hover:text-[#ff7a1a] hover:bg-[#201f20]/50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isActive ? 'rotate-180 text-current' : 'text-[#a78b7d]'}`} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right Side: Landing Pages + Browse All Parts Dropdown Button */}
          <div className="flex items-center space-x-1 sm:space-x-2" onMouseLeave={handleMouseLeave}>
            <a
              href="/engines"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/engines');
                }
              }}
              className="py-2 px-3 text-[#e0c0b1] hover:text-[#ff7a1a] transition-colors font-bold tracking-wider"
            >
              Engines
            </a>
            <a
              href="/parts"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/parts');
                }
              }}
              className="py-2 px-3 text-[#e0c0b1] hover:text-[#ff7a1a] transition-colors font-bold tracking-wider"
            >
              Parts
            </a>
            <a
              href="/restoration"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/restoration');
                }
              }}
              className="py-2 px-3 text-[#e0c0b1] hover:text-[#ff7a1a] transition-colors font-bold tracking-wider mr-1"
            >
              Restoration
            </a>

            {(() => {
              const partsObj = { menuType: 'parts', id: 'all-parts' };
              const isPinned = pinnedCat?.menuType === 'parts';
              const isHovered = activeHoverCat?.menuType === 'parts';

              return (
                <button
                  onMouseEnter={() => handleMouseEnter(partsObj)}
                  onClick={() => handleCategoryClick(partsObj, { navMode: 'parts', categoryId: 'ALL', systemId: 'ALL' })}
                  className={`py-2 px-4 font-bold rounded-xs flex items-center gap-2 transition-all glow-button uppercase tracking-wider ${
                    isPinned
                      ? 'bg-white text-black ring-2 ring-[#ff7a1a]'
                      : 'bg-[#ff7a1a] text-black hover:bg-[#ffb68e]'
                  }`}
                >
                  <Layers className="w-4 h-4 text-black" />
                  <span>Browse All Parts</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-black transition-transform ${isPinned || isHovered ? 'rotate-180' : ''}`} />
                </button>
              );
            })()}
          </div>

        </div>
      </nav>

      {/* Desktop Mega Dropdown Overlay (Pinned or Hover-based) */}
      <div onMouseEnter={() => {}} onMouseLeave={handleMouseLeave}>
        {currentMenuObj && (
          <MegaMenu 
            category={currentMenuObj}
            isPinned={!!pinnedCat}
            onSelectFilter={onSelectFilter} 
            onCloseMenu={handleCloseMenu} 
          />
        )}
      </div>

      {/* Mobile Accordion Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#131314] border-b border-[#584236]/40 px-4 sm:px-6 py-5 space-y-4 font-technical-data max-h-[85vh] overflow-y-auto">
          
          {/* Search Input for Mobile */}
          <div className="relative w-full mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a78b7d]" />
            <input
              type="text"
              placeholder="Search catalog, OEM, parts..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#201f20] border border-[#584236] pl-10 pr-3 py-2.5 min-h-[44px] text-xs text-white rounded-xs focus:outline-none focus:border-[#ff7a1a]"
            />
          </div>

          {/* Quick Cart Button in Mobile Menu */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCart();
            }}
            className="w-full min-h-[44px] font-label-caps text-xs text-black bg-[#ff7a1a] hover:bg-[#ffb68e] py-2.5 px-4 uppercase font-bold tracking-wider flex items-center justify-between rounded-xs transition-all shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-black" />
              <span>Shopping Cart</span>
            </div>
            <span className="bg-black text-[#ff7a1a] text-xs px-2 py-0.5 rounded-full font-technical-data font-bold">
              {cartCount} Items
            </span>
          </button>

          {/* Direct Browse All Parts in Mobile */}
          <button
            onClick={() => handleMobileSelectFilter({ navMode: 'parts', categoryId: 'ALL', systemId: 'ALL' })}
            className="w-full min-h-[44px] font-label-caps text-xs text-[#e5e2e3] bg-[#201f20] hover:bg-[#2c2b2d] border border-[#584236]/60 py-2.5 px-4 uppercase font-bold tracking-wider flex items-center justify-between rounded-xs transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#ff7a1a]" />
              <span>Browse All Parts Catalog</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#ff7a1a]" />
          </button>

          {/* Quick Landing Page Navigation Links */}
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
            <a
              href="/engines"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/engines');
                  setMobileMenuOpen(false);
                }
              }}
              className="py-2.5 px-2 bg-[#201f20] hover:bg-[#2c2b2d] border border-[#584236]/50 text-[#ffb68e] text-[11px] font-bold uppercase rounded-xs transition-colors"
            >
              Engines
            </a>
            <a
              href="/parts"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/parts');
                  setMobileMenuOpen(false);
                }
              }}
              className="py-2.5 px-2 bg-[#201f20] hover:bg-[#2c2b2d] border border-[#584236]/50 text-[#ffb68e] text-[11px] font-bold uppercase rounded-xs transition-colors"
            >
              Parts
            </a>
            <a
              href="/restoration"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/restoration');
                  setMobileMenuOpen(false);
                }
              }}
              className="py-2.5 px-2 bg-[#201f20] hover:bg-[#2c2b2d] border border-[#584236]/50 text-[#ffb68e] text-[11px] font-bold uppercase rounded-xs transition-colors"
            >
              Restoration
            </a>
          </div>

          {/* Accordion Categories */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] text-[#ff7a1a] uppercase tracking-wider font-bold block mb-1">
              VW AIR-COOLED CATEGORIES
            </span>

            {VW_NAV_CATEGORIES.map((cat) => {
              const isExpanded = expandedMobileCat === cat.id;

              return (
                <div key={cat.id} className="bg-[#201f20] border border-[#584236]/40 rounded-xs overflow-hidden">
                  <button
                    onClick={() => toggleMobileAccordion(cat.id)}
                    className="w-full min-h-[44px] p-3 flex items-center justify-between text-xs font-bold text-[#e5e2e3] hover:text-[#ff7a1a] cursor-pointer"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className={`w-4 h-4 text-[#a78b7d] transition-transform duration-200 ${isExpanded ? 'rotate-90 text-[#ff7a1a]' : ''}`} />
                  </button>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="p-3 bg-[#181719] border-t border-[#584236]/30 space-y-3">
                      
                      {/* Models List */}
                      {cat.models.length > 0 && (
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-[#ff7a1a] font-bold block mb-1">Models:</span>
                          <div className="space-y-1 pl-1">
                            {cat.models.map(m => (
                              <div 
                                key={m.id}
                                onClick={() => handleMobileSelectFilter({ categoryId: cat.id, modelId: m.id })}
                                className="min-h-[36px] flex items-center text-xs text-[#e0c0b1] hover:text-[#ff7a1a] py-1 px-2 rounded-xs hover:bg-[#201f20] cursor-pointer transition-colors"
                              >
                                • {m.name} ({m.era})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Engines List */}
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#ff7a1a] font-bold block mb-1.5">Engine Sizes:</span>
                        <div className="flex flex-wrap gap-1.5 pl-1">
                          {cat.engines.map(s => (
                            <button 
                              key={s}
                              onClick={() => handleMobileSelectFilter({ categoryId: cat.id, engineSize: s })}
                              className="min-h-[32px] text-[10px] bg-[#201f20] hover:bg-[#2c2b2d] hover:text-[#ff7a1a] text-[#e0c0b1] px-2.5 py-1 border border-[#584236]/40 rounded-xs cursor-pointer transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Browse All Category */}
                      <button
                        onClick={() => handleMobileSelectFilter({ categoryId: cat.id })}
                        className="w-full min-h-[44px] mt-2 text-xs bg-[#ff7a1a] hover:bg-[#ffb68e] text-black font-bold py-2.5 px-3 uppercase tracking-wider text-center rounded-xs transition-all cursor-pointer"
                      >
                        Browse All {cat.name}
                      </button>

                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Direct Call & Workshop Location Links */}
          <a
            href="tel:19452879865"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full min-h-[44px] mt-2 font-label-caps text-xs text-black bg-[#ff7a1a] hover:bg-[#ffb68e] py-3 px-3 uppercase font-bold tracking-wider flex items-center justify-center gap-2 rounded-xs transition-all shadow-md"
          >
            <Phone className="w-4 h-4 text-black" />
            <span>Call Workshop: 1945-287-9865</span>
          </a>

          <a
            href="#workshop-location"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full min-h-[44px] font-label-caps text-xs text-[#ffb68e] bg-[#201f20] hover:bg-[#282729] border border-[#ff7a1a]/40 py-3 px-3 uppercase font-bold tracking-wider flex items-center justify-center gap-2 rounded-xs transition-all"
          >
            <MapPin className="w-4 h-4 text-[#ff7a1a]" />
            <span>Visit Houston Workshop (14826 Yarberry St)</span>
          </a>

          {currentUser ? (
            <div className="space-y-2 pt-2">
              <button 
                onClick={() => { setMobileMenuOpen(false); onOpenUserDashboard(); }}
                className="w-full min-h-[44px] font-label-caps text-xs text-black bg-[#ff7a1a] hover:bg-[#ffb68e] py-3 px-3 uppercase font-bold tracking-wider flex items-center justify-center gap-2 rounded-xs transition-all cursor-pointer shadow-md"
              >
                <User className="w-4 h-4" />
                <span>My Dashboard ({userRequestsCount})</span>
              </button>
              {onLogout && (
                <button 
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="w-full min-h-[44px] font-label-caps text-xs text-[#a78b7d] hover:text-red-400 bg-[#201f20] hover:bg-[#282729] border border-[#584236]/40 py-2.5 uppercase font-bold tracking-wider rounded-xs transition-all cursor-pointer"
                >
                  Sign Out ({currentUser.name || 'User'})
                </button>
              )}
            </div>
          ) : (
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
              className="w-full min-h-[44px] mt-2 font-label-caps text-xs text-black bg-[#ff7a1a] hover:bg-[#ffb68e] py-3 px-3 uppercase font-bold tracking-wider flex items-center justify-center gap-2 rounded-xs transition-all shadow-md cursor-pointer"
            >
              <User className="w-4 h-4 text-black" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      )}

    </header>
  );
}
