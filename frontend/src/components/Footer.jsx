import React from 'react';
import { MapPin, Phone, Clock, ExternalLink, Video, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const FACEBOOK_URL = "https://www.facebook.com/share/1BwLuMhq42/";
  const YOUTUBE_URL = "https://youtube.com/@classicaircooledvwworks?si=MUB5pYzgHnGiUR4I";
  const PHONE_NUMBER = "1945-287-9865";
  const PHONE_TEL = "tel:19452879865";

  return (
    <footer className="w-full mt-16 sm:mt-24 bg-[#0e0e0f] border-t border-[#584236]/30 text-[#e0c0b1]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 px-4 sm:px-8 md:px-16 py-10 sm:py-16 max-w-[1440px] mx-auto font-body-md text-sm">
        
        {/* Column 1: Brand & Workshop Location */}
        <div className="col-span-1 space-y-4">
          <div>
            <div className="font-h3 text-base sm:text-lg text-[#ff7a1a] font-bold tracking-tighter">
              CLASSIC AIRCOOLED VW WORKS
            </div>
            <p className="font-technical-data text-xs text-[#a78b7d] max-w-xs leading-relaxed mt-1.5">
              Precision OEM-grade components verified against original mechanical blueprints for air-cooled restorations.
            </p>
          </div>

          <div className="space-y-2 pt-1 font-technical-data text-xs">
            <div className="text-[#e0c0b1] flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#ff7a1a] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">14826 Yarberry St</span>
                <br />
                <span className="text-[#a78b7d]">Houston, TX 77039, USA</span>
              </div>
            </div>

            <div className="text-[#e0c0b1] flex items-center gap-2.5 pt-1">
              <Phone className="w-4 h-4 text-[#ff7a1a] shrink-0" />
              <a 
                href={PHONE_TEL} 
                className="font-bold text-white hover:text-[#ff7a1a] font-mono transition-colors text-sm"
              >
                {PHONE_NUMBER}
              </a>
            </div>
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="flex flex-col gap-2.5 font-label-caps text-xs tracking-wider uppercase">
          <span className="font-bold text-white font-mono text-[11px] mb-1">Navigation</span>
          <a className="hover:text-[#ff7a1a] transition-colors py-1 min-h-[30px] flex items-center" href="#vintage-cars">Vintage Cars</a>
          <a className="hover:text-[#ff7a1a] transition-colors py-1 min-h-[30px] flex items-center" href="#catalog">Parts Catalog</a>
          <a className="hover:text-[#ff7a1a] transition-colors py-1 min-h-[30px] flex items-center" href="#reviews">Customer Reviews</a>
          <a className="hover:text-[#ff7a1a] transition-colors flex items-center gap-1.5 py-1 min-h-[30px]" href="#workshop-location">
            <MapPin className="w-3.5 h-3.5 text-[#ff7a1a]" /> Workshop Map
          </a>
          <a className="hover:text-[#ff7a1a] transition-colors flex items-center gap-1.5 py-1 min-h-[30px]" href="#workshop">
            <Video className="w-3.5 h-3.5 text-[#ff7a1a]" /> Video Showcase
          </a>
        </div>

        {/* Column 3: Official Channels & Social Handles */}
        <div className="flex flex-col gap-3 font-technical-data text-xs">
          <span className="font-bold text-white font-mono text-[11px] uppercase tracking-wider mb-0.5">
            Official Channels & Social
          </span>
          <p className="text-[11px] text-[#a78b7d] leading-relaxed">
            Follow our daily engine dyno builds, garage restorations, and technical guides:
          </p>

          <div className="flex flex-col gap-2.5 pt-1">
            {/* Facebook Channel Button */}
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-2.5 bg-[#181719] hover:bg-[#1f1e21] border border-[#584236]/50 hover:border-[#1877F2]/60 rounded-xs transition-all shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#1877F2]/20 border border-[#1877F2]/40 flex items-center justify-center text-[#1877F2] group-hover:scale-110 transition-transform">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-white text-xs group-hover:text-[#1877F2] transition-colors flex items-center gap-1">
                    Facebook Channel
                  </div>
                  <div className="text-[10px] text-[#a78b7d]">Classic Aircooled VW Works</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#a78b7d] group-hover:text-white transition-colors" />
            </a>

            {/* YouTube Channel Button */}
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-2.5 bg-[#181719] hover:bg-[#1f1e21] border border-[#584236]/50 hover:border-[#FF0000]/60 rounded-xs transition-all shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#FF0000]/20 border border-[#FF0000]/40 flex items-center justify-center text-[#FF0000] group-hover:scale-110 transition-transform">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-white text-xs group-hover:text-[#FF0000] transition-colors flex items-center gap-1">
                    YouTube Channel
                  </div>
                  <div className="text-[10px] text-[#a78b7d]">@classicaircooledvwworks</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#a78b7d] group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>

        {/* Column 4: Technical Specs, Hours & System Status */}
        <div className="flex flex-col gap-2.5 font-technical-data text-xs text-[#a78b7d]">
          <div className="flex items-center gap-1.5 text-[#83cffb] font-bold text-[11px] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#83cffb]" />
            <span>SYSTEM STATUS // ONLINE</span>
          </div>

          <div className="space-y-1 text-[#e0c0b1] text-xs">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#ff7a1a] shrink-0" /> Mon-Fri: 8AM-6PM CST | Sat: 9AM-4PM
            </span>
            <span className="flex items-center gap-1.5 pt-1">
              <Phone className="w-3.5 h-3.5 text-[#ff7a1a] shrink-0" /> Direct: 
              <a href={PHONE_TEL} className="text-white hover:text-[#ff7a1a] font-mono font-bold ml-1 transition-colors">
                {PHONE_NUMBER}
              </a>
            </span>
          </div>

          <div className="pt-2 border-t border-[#584236]/30 text-[11px] text-[#a78b7d] space-y-1">
            <p>Houston Garage & Dyno Tuning Lab</p>
            <p>© {new Date().getFullYear()} CLASSIC AIRCOOLED VW WORKS. All rights reserved.</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
