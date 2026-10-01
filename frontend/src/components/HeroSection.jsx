import React, { useState, useRef, useEffect } from 'react';
import { Car, Wrench, ShieldCheck, Play, Pause } from 'lucide-react';

const ENGINE_BUILDS = [
  {
    id: 1,
    title: 'Twin IDF 1914cc Turn-Key',
    subtitle: 'Dual Weber 40 IDF • Polished Aluminum Tinware • Merged Header',
    image: '/hero_engine_1.jpg',
    tag: 'STREET / TOURING'
  },
  {
    id: 2,
    title: 'Porsche Axial Fan 2180cc',
    subtitle: 'High-Flow Axial Fan Shroud • Dual Dellorto • Billet Pulley',
    image: '/hero_engine_2.jpg',
    tag: 'HIGH PERFORMANCE'
  },
  {
    id: 3,
    title: 'Competition 2276cc Stroker',
    subtitle: 'Stainless Tuned Exhaust • Forged Pistons • Race Cam',
    image: '/hero_engine_3.jpg',
    tag: 'CUSTOM RACE BUILD'
  }
];

export default function HeroSection({ onSelectCarModel }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeEngineIndex, setActiveEngineIndex] = useState(0);
  const [useLiveVideo, setUseLiveVideo] = useState(true);
  const videoRef = useRef(null);

  // Toggle video play / pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Auto-cycle through engine info when video is not active / slideshow mode
  useEffect(() => {
    if (useLiveVideo) return;
    const timer = setInterval(() => {
      setActiveEngineIndex((prev) => (prev + 1) % ENGINE_BUILDS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [useLiveVideo]);

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

  const activeBuild = ENGINE_BUILDS[activeEngineIndex];

  return (
    <section className="relative min-h-[580px] sm:min-h-[680px] lg:min-h-[720px] flex items-center justify-center overflow-hidden border-b border-[#584236]/30 bg-[#0e0e10] pt-6 sm:pt-10 pb-16 sm:pb-24">
      
      {/* ========================================================================= */}
      {/* Dynamic Video & Image Showcase Background (Inspired by Reference Design)  */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Real Generated WebM Video Background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster="/hero_engine_1.jpg"
          onTimeUpdate={(e) => {
            const time = e.currentTarget.currentTime;
            const idx = Math.min(2, Math.floor(time / 4));
            setActiveEngineIndex(idx);
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            useLiveVideo ? 'opacity-85 scale-[1.01]' : 'opacity-0 pointer-events-none'
          }`}
          onError={() => setUseLiveVideo(false)}
        >
          <source src="/hero_engine_video.webm" type="video/webm" />
          <source src="/hero_engine_video.mp4" type="video/mp4" />
        </video>

        {/* High-Resolution Dynamic Image Slideshow Fallback & Overlay */}
        {!useLiveVideo && (
          <div className="absolute inset-0 w-full h-full">
            {ENGINE_BUILDS.map((build, idx) => (
              <div
                key={build.id}
                className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 transform ${
                  idx === activeEngineIndex ? 'opacity-90 scale-105' : 'opacity-0 scale-100 pointer-events-none'
                }`}
                style={{
                  backgroundImage: `url(${build.image})`,
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
      {/* Hero Central Content (High Contrast, Bold, Authentic)                     */}
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
          <span className="text-[#ff7a1a] hidden sm:inline">HAND-BUILT ENGINES & OEM PARTS</span>
        </div>

        {/* Main H1 Heading - Inspired by Reference Style with High Impact */}
        <h1 className="font-h1 text-2xl min-[380px]:text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-extrabold mb-4 sm:mb-6 tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] leading-[1.15] sm:leading-[1.08]">
          Classic Aircooled VW Works.<br />
          <span className="text-white/95">Authentic Engines.</span><br />
          <span className="text-[#ff7a1a] drop-shadow-[0_0_25px_rgba(255,122,26,0.45)]">Precision Spare Parts.</span>
        </h1>

        {/* Value Proposition Description */}
        <p className="font-body-lg text-xs sm:text-base md:text-lg text-[#f0e3db] mb-6 sm:mb-8 max-w-2xl leading-relaxed px-2 font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          Discover hand-crafted turn-key boxer engines, precision dual-port carburetors, factory OEM casting numbers, and hard-to-find restoration components.
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

        {/* Engine Showcase Indicator & Video Controller Floating Pill */}
        <div className="mt-8 sm:mt-10 flex items-center justify-center gap-2 sm:gap-3 bg-[#131314]/85 backdrop-blur-xl border border-[#584236]/40 px-3 sm:px-4 py-1.5 rounded-full shadow-2xl">
          <button 
            onClick={togglePlay}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#ff7a1a] transition-all flex items-center justify-center cursor-pointer"
            title={isPlaying ? "Pause Background Video" : "Play Background Video"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <div className="h-3 w-px bg-white/20 mx-1" />

          {/* Quick Engine Switchers (Seeks smoothly to that engine in the video loop) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {ENGINE_BUILDS.map((build, idx) => (
              <button
                key={build.id}
                onClick={() => {
                  setActiveEngineIndex(idx);
                  if (videoRef.current) {
                    videoRef.current.currentTime = idx * 4;
                    if (!isPlaying) {
                      videoRef.current.play().catch(() => {});
                      setIsPlaying(true);
                    }
                  }
                }}
                className={`text-[10px] sm:text-xs font-technical-data px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeEngineIndex === idx
                    ? 'bg-[#ff7a1a] text-black font-bold shadow-[0_0_10px_rgba(255,122,26,0.5)]'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>0{build.id}</span>
                <span className="hidden md:inline">{build.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* Authentic VW Models Ribbon at Bottom (Clean, Technical, Trust-Building)   */}
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
