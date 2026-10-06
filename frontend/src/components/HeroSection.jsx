import React, { useState, useEffect } from 'react';
import { Car, Wrench } from 'lucide-react';

const ENGINE_IMAGES = [
  '/hero_engine_1.jpg',
  '/hero_engine_2.jpg',
  '/hero_engine_3.jpg',
  '/hero_engine_4.jpg',
  '/hero_engine_5.jpg',
  '/hero_engine_6.jpg',
  '/hero_engine_7.jpg'
];

export default function HeroSection({ onSelectCarModel }) {
  const [activeEngineIndex, setActiveEngineIndex] = useState(0);
  const [useLiveVideo, setUseLiveVideo] = useState(true);

  // Automatic smooth crossfade cycle through all 7 images as fallback or ambient sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveEngineIndex((prev) => (prev + 1) % ENGINE_IMAGES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const scrollToCatalog = () => {
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToVintageCars = () => {
    const vintageCarsEl = document.getElementById('vintage-cars');
    if (vintageCarsEl) {
      vintageCarsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[580px] sm:min-h-[660px] lg:min-h-[700px] flex items-center justify-center overflow-hidden border-b border-[#584236]/30 bg-[#0e0e10] pt-8 sm:pt-12 pb-16 sm:pb-24">
      
      {/* ========================================================================= */}
      {/* Dynamic Video & Fading Image Showcase Background                         */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Autoplaying Hero Video with metadata preload and instant poster display */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/hero_engine_1.jpg"
          style={{ backgroundImage: 'url(/hero_engine_1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            useLiveVideo ? 'opacity-85 scale-[1.01]' : 'opacity-0 pointer-events-none'
          }`}
          onError={() => setUseLiveVideo(false)}
        >
          <source src="/hero_engine_video.webm" type="video/webm" />
          <source src="/hero_engine_video.mp4" type="video/mp4" />
        </video>

        {/* High-Resolution Fading Image Layer (All 7 Custom Aircooled Engines) */}
        {!useLiveVideo && (
          <div className="absolute inset-0 w-full h-full">
            {ENGINE_IMAGES.map((imgSrc, idx) => (
              <div
                key={imgSrc}
                className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 transform ${
                  idx === activeEngineIndex ? 'opacity-90 scale-105' : 'opacity-0 scale-100 pointer-events-none'
                }`}
                style={{
                  backgroundImage: `url(${imgSrc})`,
                  transition: 'opacity 1.2s ease-in-out, transform 4s ease-out'
                }}
              />
            ))}
          </div>
        )}

        {/* Cinematic Vignette & Readability Gradient Overlays */}
        {/* Top shadow for seamless blending with fixed navbar */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0e0e10] via-[#0e0e10]/75 to-transparent pointer-events-none z-1" />

        {/* Central dark radial gradient so typography has crisp readability */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(14,14,16,0.55)_0%,_rgba(14,14,16,0.85)_75%,_rgba(14,14,16,0.98)_100%)] pointer-events-none z-1" />

        {/* Bottom fade into vehicle showroom */}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/80 to-transparent pointer-events-none z-1" />

        {/* Subtle Warm Mechanical Glow & Blueprint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#ff7a1a]/10 via-transparent to-[#83cffb]/5 pointer-events-none z-1" />
        <div className="absolute inset-0 bg-blueprint-grid opacity-15 pointer-events-none z-1" />
      </div>

      {/* ========================================================================= */}
      {/* Hero Central Content (High Contrast, Bold, Technical)                     */}
      {/* ========================================================================= */}
      <div className="relative z-10 text-center px-4 sm:px-6 md:px-12 max-w-4xl mx-auto flex flex-col items-center pt-2 sm:pt-6">
        
        {/* Status Badge with Live Pulsing Indicator */}
        <div className="inline-flex items-center gap-2 font-technical-data text-[10px] sm:text-xs text-[#83cffb] tracking-[0.14em] mb-4 sm:mb-6 uppercase border border-[#83cffb]/30 px-3 py-1.5 bg-[#0e0e10]/85 backdrop-blur-md rounded-full shadow-[0_0_15px_rgba(131,207,251,0.15)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff7a1a] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff7a1a]"></span>
          </span>
          <span className="font-semibold text-white/95">CLASSIC AIRCOOLED VW WORKS</span>
          <span className="text-[#584236]">•</span>
          <span className="text-[#ff7a1a] hidden sm:inline">ENGINES, PARTS & RESTORATION</span>
        </div>

        {/* Main H1 Heading - Inspired by Reference Style with High Impact */}
        <h1 className="font-h1 text-2xl min-[380px]:text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-extrabold mb-4 sm:mb-6 tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] leading-[1.15] sm:leading-[1.08]">
          Classic Aircooled VW Works.<br />
          <span className="text-white/95">Aircooled Engines.</span><br />
          <span className="text-[#ff7a1a] drop-shadow-[0_0_25px_rgba(255,122,26,0.45)]">Precision Spare Parts.</span>
        </h1>

        {/* Value Proposition Description */}
        <p className="font-body-lg text-xs sm:text-base md:text-lg text-[#f0e3db] mb-7 sm:mb-9 max-w-2xl leading-relaxed px-2 font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          Discover turn-key boxer engines, dual-port carburetors, replacement parts, and restoration components.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 w-full sm:w-auto px-2 sm:px-0">
          <button 
            onClick={scrollToVintageCars}
            className="w-full sm:w-auto min-h-[48px] bg-[#ff7a1a] hover:bg-[#ff8f3d] text-black font-label-caps text-xs sm:text-sm px-6 py-3.5 sm:px-8 sm:py-4 uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2.5 rounded-sm cursor-pointer shadow-[0_0_24px_rgba(255,122,26,0.4)] hover:shadow-[0_0_32px_rgba(255,122,26,0.6)] transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Car className="w-4 h-4 text-black stroke-[2.5]" />
            Select Your Vehicle
          </button>

          <button 
            onClick={scrollToCatalog}
            className="w-full sm:w-auto min-h-[48px] ghost-button text-white border-2 border-white/40 hover:border-white font-technical-data text-xs sm:text-sm px-6 py-3.5 sm:px-8 sm:py-4 uppercase bg-black/40 backdrop-blur-md hover:bg-white/10 transition-all flex items-center justify-center gap-2.5 rounded-sm cursor-pointer shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Wrench className="w-4 h-4 text-[#83cffb]" />
            Browse Full Parts Catalog
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* Classic VW Models Ribbon at Bottom (Clean, Technical, Trust-Building)     */}
      {/* ========================================================================= */}
      <div className="absolute bottom-0 left-0 w-full bg-[#0a0a0c]/90 backdrop-blur-md border-t border-[#584236]/30 py-2.5 sm:py-3 z-20 overflow-x-auto no-scrollbar">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-nowrap justify-start lg:justify-center items-center opacity-85 font-technical-data text-[10px] sm:text-xs text-[#e0c0b1] gap-4 sm:gap-6 whitespace-nowrap">
          <span className="flex items-center gap-1.5 hover:text-[#ff7a1a] transition-colors cursor-pointer shrink-0" onClick={scrollToVintageCars}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a1a]"></span>
            VOLKSWAGEN BEETLE (TYPE 1)
          </span>
          <span className="text-[#584236] shrink-0">/</span>
          <span className="flex items-center gap-1.5 hover:text-[#ff7a1a] transition-colors cursor-pointer shrink-0" onClick={scrollToVintageCars}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a1a]"></span>
            VW BUS & TRANSPORTER (TYPE 2 / T1 / T2)
          </span>
          <span className="text-[#584236] shrink-0">/</span>
          <span className="flex items-center gap-1.5 hover:text-[#ff7a1a] transition-colors cursor-pointer shrink-0" onClick={scrollToVintageCars}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a1a]"></span>
            KARMANN GHIA (TYPE 14 / TYPE 34)
          </span>
          <span className="text-[#584236] shrink-0">/</span>
          <span className="flex items-center gap-1.5 hover:text-[#ff7a1a] transition-colors cursor-pointer shrink-0" onClick={scrollToVintageCars}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a1a]"></span>
            TYPE 3 (FASTBACK / SQUAREBACK / NOTCHBACK)
          </span>
          <span className="text-[#584236] shrink-0">/</span>
          <span className="flex items-center gap-1.5 hover:text-[#ff7a1a] transition-colors cursor-pointer shrink-0" onClick={scrollToVintageCars}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a1a]"></span>
            VW THING (TYPE 181 / SAFARI)
          </span>
        </div>
      </div>

    </section>
  );
}
