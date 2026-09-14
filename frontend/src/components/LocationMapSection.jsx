import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  Plus,
  Minus,
  RotateCcw, 
  Wrench, 
  ShieldCheck, 
  Package, 
  Compass, 
  Building2, 
  Sparkles,
  Phone
} from 'lucide-react';

const WORKSHOP_INFO = {
  name: 'CLASSIC AIRCOOLED VW WORKS',
  tagline: 'Main Restoration Garage, Engine Dyno Lab & Parts Distribution Hub',
  address: '14826 Yarberry St',
  cityStateZip: 'Houston, TX 77039',
  country: 'United States',
  fullAddress: '14826 Yarberry St, Houston, TX 77039, USA',
  phone: '1347-226-8235',
  phoneFormatted: '+1 (347) 226-8235',
  phoneTel: 'tel:13472268235',
  coordinates: {
    lat: 29.9045,
    lng: -95.3341
  },
  hours: [
    { days: 'Monday – Friday', time: '8:00 AM – 6:00 PM CST', note: 'Full Workshop & Parts Counter' },
    { days: 'Saturday', time: '9:00 AM – 4:00 PM CST', note: 'Dyno Testing & Order Pickups' },
    { days: 'Sunday', time: 'Closed', note: 'Restoration Appointments Only' }
  ],
  services: [
    {
      icon: Wrench,
      title: 'Engine Rebuild Bays',
      desc: 'Aircooled 1200cc–2332cc precision assembly and blueprinting.'
    },
    {
      icon: Package,
      title: 'Same-Day Parts Counter',
      desc: 'Local pickup for verified OEM, CB Performance, and NOS components.'
    },
    {
      icon: ShieldCheck,
      title: 'Casting & Spec Verification',
      desc: 'Bring your core engine case or cylinder heads for microscopic inspection.'
    },
    {
      icon: Sparkles,
      title: 'Dyno Tuning Lab',
      desc: 'Live dual-port Weber carburetor synchronization and exhaust gas analysis.'
    }
  ]
};

export default function LocationMapSection() {
  const [copied, setCopied] = useState(false);
  const [mapViewType, setMapViewType] = useState('m'); // 'm' for standard roadmap, 'k' for satellite imagery
  const [zoomLevel, setZoomLevel] = useState(15);
  const [searchQuery, setSearchQuery] = useState(WORKSHOP_INFO.fullAddress);

  // Calculate if the workshop is currently open in Texas CST
  const [isOpenNow, setIsOpenNow] = useState(true);

  useEffect(() => {
    try {
      const now = new Date();
      const centralTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour12: false, hour: 'numeric' });
      const centralDayStr = now.toLocaleDateString('en-US', { timeZone: 'America/Chicago', weekday: 'short' });
      const currentHour = parseInt(centralTimeStr, 10);

      if (centralDayStr === 'Sun') {
        setIsOpenNow(false);
      } else if (centralDayStr === 'Sat') {
        setIsOpenNow(currentHour >= 9 && currentHour < 16);
      } else {
        // Mon-Fri
        setIsOpenNow(currentHour >= 8 && currentHour < 18);
      }
    } catch {
      setIsOpenNow(true);
    }
  }, []);

  const handleCopyAddress = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(WORKSHOP_INFO.fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const encodedAddress = encodeURIComponent(searchQuery);
  const googleMapsIframeUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=${mapViewType}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(WORKSHOP_INFO.fullAddress)}`;
  const googleMapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(WORKSHOP_INFO.fullAddress)}`;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 1, 10));
  const handleReset = () => {
    setSearchQuery(WORKSHOP_INFO.fullAddress);
    setZoomLevel(15);
    setMapViewType('m');
  };

  return (
    <section id="workshop-location" className="py-10 sm:py-16 md:py-20 bg-[#0e0e0f] relative border-t border-b border-[#584236]/30 overflow-hidden">
      
      {/* Subtle blueprint grid background */}
      <div className="absolute inset-0 bg-blueprint-grid opacity-10 pointer-events-none"></div>

      <div className="relative max-w-[1440px] mx-auto px-3 sm:px-6 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#ff7a1a]/10 border border-[#ff7a1a]/30 text-[#ff7a1a] font-technical-data text-[10px] sm:text-xs uppercase tracking-widest">
            <MapPin className="w-3.5 h-3.5 text-[#ff7a1a] animate-bounce" />
            <span>HOUSTON WORKSHOP & DISTRIBUTION CENTER</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#e5e2e3] font-h2 tracking-tight">
            Visit Our <span className="text-[#ff7a1a]">Workshop & Garage</span>
          </h2>

          <p className="text-[#e0c0b1] text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed px-2">
            Experience authentic aircooled restorations in person. Inspect blueprint engine castings, consult with master VW mechanics, or pick up your reserved parts directly from our Houston facility.
          </p>
        </div>

        {/* Main Grid: Left is Info Card, Right is Live Google Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* LEFT COLUMN: Workshop Info & Hours (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 sm:gap-6">
            
            {/* Primary Address & Status Box */}
            <div className="glass-panel p-4 sm:p-6 sm:p-7 border border-[#584236]/40 relative bg-gradient-to-b from-[#181719] to-[#121213] shadow-xl rounded-xs">
              
              {/* Header with Live Status badge */}
              <div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-[#584236]/30">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff7a1a]" />
                  <span className="font-technical-data text-[11px] sm:text-xs uppercase tracking-wider text-[#a78b7d]">Headquarters</span>
                </div>

                <div className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-technical-data font-bold uppercase rounded-xs border ${
                  isOpenNow 
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                    : 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                }`}>
                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  <span>{isOpenNow ? 'Open Now // Bays Active' : 'Closed // Opens 8:00 AM'}</span>
                </div>
              </div>

              {/* Business Name & Full Address */}
              <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                <h3 className="font-h3 text-lg sm:text-xl md:text-2xl font-bold text-[#e5e2e3] tracking-tight leading-snug">
                  {WORKSHOP_INFO.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#ffb68e] font-technical-data">
                  {WORKSHOP_INFO.tagline}
                </p>

                <div className="pt-2 sm:pt-3 flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-[#e0c0b1]">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff7a1a] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white text-sm sm:text-base">{WORKSHOP_INFO.address}</div>
                    <div className="text-[#a78b7d] font-technical-data text-[11px] sm:text-xs">{WORKSHOP_INFO.cityStateZip}, {WORKSHOP_INFO.country}</div>
                  </div>
                </div>

                {/* Direct Telephone Contact */}
                <div className="pt-1 flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-[#e0c0b1]">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff7a1a] shrink-0" />
                  <div>
                    <div className="text-[10px] sm:text-[11px] text-[#a78b7d] font-technical-data uppercase">Direct Phone Support</div>
                    <a 
                      href={WORKSHOP_INFO.phoneTel} 
                      className="font-bold text-white hover:text-[#ff7a1a] text-sm sm:text-base font-mono transition-colors"
                    >
                      {WORKSHOP_INFO.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Call, Copy Address & Get Directions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <a
                  href={WORKSHOP_INFO.phoneTel}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#ff7a1a] hover:bg-[#ffb68e] text-black font-label-caps text-xs uppercase font-bold tracking-wider transition-all glow-button rounded-xs cursor-pointer shadow-md col-span-1 sm:col-span-2"
                >
                  <Phone className="w-3.5 h-3.5 text-black" />
                  <span>Call Workshop: {WORKSHOP_INFO.phone}</span>
                </a>

                <button
                  onClick={handleCopyAddress}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#201f20] hover:bg-[#2c2b2d] border border-[#584236]/40 text-[#e0c0b1] hover:text-white font-label-caps text-xs uppercase tracking-wider transition-all cursor-pointer rounded-xs group"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#ff7a1a] group-hover:scale-110 transition-transform" />
                      <span>Copy Address</span>
                    </>
                  )}
                </button>

                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#201f20] hover:bg-[#2c2b2d] border border-[#584236]/40 text-[#83cffb] hover:text-white font-label-caps text-xs uppercase font-bold tracking-wider transition-all rounded-xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#83cffb]" />
                  <span>Get Directions</span>
                </a>
              </div>

            </div>

            {/* Operating Hours Box */}
            <div className="glass-panel p-5 sm:p-6 border border-[#584236]/30 bg-[#141415]/90 space-y-3 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 font-technical-data text-xs text-[#83cffb] uppercase tracking-wider">
                <Clock className="w-4 h-4 text-[#83cffb]" />
                <span>Workshop & Parts Counter Hours</span>
              </div>

              <div className="space-y-3 pt-2">
                {WORKSHOP_INFO.hours.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between text-xs border-b border-[#584236]/20 pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <div className="font-semibold text-[#e5e2e3]">{item.days}</div>
                      <div className="text-[11px] text-[#a78b7d] font-technical-data">{item.note}</div>
                    </div>
                    <div className="font-mono text-[#ffb68e] font-bold text-right">
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Live Embedded Google Map (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="glass-panel p-4 sm:p-5 border border-[#584236]/40 shadow-2xl relative flex-1 flex flex-col bg-[#121213]">
              
              {/* Map Toolbar / Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-[#584236]/30 font-technical-data text-xs">
                
                {/* Left: Map Coordinate Indicator */}
                <div className="flex items-center gap-2 text-[#83cffb]">
                  <Compass className="w-4 h-4 text-[#83cffb]" />
                  <span className="font-mono text-[11px] hidden sm:inline">
                    LAT: {WORKSHOP_INFO.coordinates.lat}° N / LNG: {Math.abs(WORKSHOP_INFO.coordinates.lng)}° W
                  </span>
                  <span className="font-mono text-[11px] sm:hidden">
                    HOUSTON, TX (77039)
                  </span>
                </div>

                {/* Right: Map Type & Zoom Control Buttons */}
                <div className="flex items-center gap-2">
                  
                  {/* View Type Toggle (Roadmap vs Satellite) */}
                  <div className="flex items-center bg-[#1c1b1c] border border-[#584236]/40 rounded-xs p-0.5">
                    <button
                      onClick={() => setMapViewType('m')}
                      className={`min-h-[36px] px-2.5 py-1 text-[11px] font-bold rounded-xs transition-colors cursor-pointer ${
                        mapViewType === 'm' ? 'bg-[#ff7a1a] text-black' : 'text-[#a78b7d] hover:text-white'
                      }`}
                    >
                      Road
                    </button>
                    <button
                      onClick={() => setMapViewType('k')}
                      className={`min-h-[36px] px-2.5 py-1 text-[11px] font-bold rounded-xs transition-colors cursor-pointer ${
                        mapViewType === 'k' ? 'bg-[#ff7a1a] text-black' : 'text-[#a78b7d] hover:text-white'
                      }`}
                    >
                      Satellite
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleZoomIn}
                      className="min-w-[36px] min-h-[36px] p-2 bg-[#1c1b1c] hover:bg-[#282729] text-[#e0c0b1] hover:text-[#ff7a1a] border border-[#584236]/40 rounded-xs transition-colors cursor-pointer flex items-center justify-center"
                      title="Zoom In"
                      aria-label="Zoom In"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className="min-w-[36px] min-h-[36px] p-2 bg-[#1c1b1c] hover:bg-[#282729] text-[#e0c0b1] hover:text-[#ff7a1a] border border-[#584236]/40 rounded-xs transition-colors cursor-pointer flex items-center justify-center"
                      title="Zoom Out"
                      aria-label="Zoom Out"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Reset Center */}
                  <button
                    onClick={handleReset}
                    className="min-w-[36px] min-h-[36px] p-2 bg-[#1c1b1c] hover:bg-[#282729] text-[#e0c0b1] hover:text-[#ff7a1a] border border-[#584236]/40 rounded-xs transition-colors cursor-pointer flex items-center justify-center"
                    title="Reset to Workshop Center"
                    aria-label="Reset Map"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* External Google Maps Button */}
                  <a
                    href={googleMapsPlaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[36px] p-2 bg-[#1c1b1c] hover:bg-[#282729] text-[#83cffb] border border-[#83cffb]/30 rounded-xs transition-colors flex items-center gap-1 text-[11px]"
                    title="Open in Full Google Maps App"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Google Maps</span>
                  </a>

                </div>

              </div>

              {/* Embedded Google Map Iframe Container - Explicit height to prevent half-loading on mobile */}
              <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[520px] bg-[#0b0b0c] border border-[#584236]/50 overflow-hidden shadow-inner rounded-xs">
                
                <iframe
                  title="Classic Aircooled VW Works Houston Location"
                  src={googleMapsIframeUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, width: '100%', height: '100%', minHeight: '100%', display: 'block' }}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen={true}
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>

                {/* Floating Technical Location Card over the Map */}
                <div className="absolute top-2.5 left-2.5 z-10 max-w-[240px] sm:max-w-xs bg-[#131314]/95 backdrop-blur-md p-2.5 sm:p-3 border border-[#ff7a1a]/50 shadow-xl pointer-events-auto rounded-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#ff7a1a] inline-block animate-ping shrink-0"></span>
                    <span className="font-h3 text-[11px] sm:text-xs font-bold text-white tracking-wide truncate">
                      HOUSTON HQ & GARAGE
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-technical-data text-[#e0c0b1] leading-tight">
                    14826 Yarberry St, Houston, TX 77039
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-technical-data text-[#83cffb]">
                    <span className="text-[9px] sm:text-[10px]">Restoration Facility</span>
                    <a 
                      href={googleMapsDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ff7a1a] hover:underline font-bold text-[10px] flex items-center gap-0.5"
                    >
                      Route ➔
                    </a>
                  </div>
                </div>

                {/* Map Bottom Information Strip */}
                <div className="absolute bottom-2 right-2 z-10 bg-[#0e0e0f]/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-technical-data text-[#a78b7d] border border-[#584236]/30 hidden sm:block rounded-xs">
                  <span>GPS: 29.9045° N, 95.3341° W • High-Precision Castings</span>
                </div>

              </div>

              {/* Services Highlights Row below Map */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-[#584236]/30">
                {WORKSHOP_INFO.services.map((svc, i) => {
                  const SvcIcon = svc.icon;
                  return (
                    <div key={i} className="bg-[#181719]/60 p-2.5 border border-[#584236]/20 rounded-xs flex flex-col justify-start">
                      <div className="flex items-center gap-1.5 text-[#ff7a1a] mb-1">
                        <SvcIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-bold text-[#e5e2e3] font-technical-data truncate">{svc.title}</span>
                      </div>
                      <p className="text-[10px] text-[#a78b7d] leading-snug line-clamp-2">
                        {svc.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
