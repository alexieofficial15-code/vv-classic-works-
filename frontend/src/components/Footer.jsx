import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full mt-16 sm:mt-24 bg-[#0e0e0f] border-t border-[#584236]/20 text-[#e0c0b1]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4 sm:px-8 md:px-16 py-10 sm:py-16 max-w-[1440px] mx-auto font-body-md text-sm">
        
        {/* Brand & Address Column */}
        <div className="col-span-1 space-y-3">
          <div className="font-h3 text-base sm:text-lg text-[#ff7a1a] font-bold tracking-tighter">
            CLASSIC AIRCOOLED VW WORKS
          </div>
          <p className="font-technical-data text-xs text-[#a78b7d] max-w-xs leading-relaxed">
            Precision OEM-grade components verified against original mechanical blueprints for air-cooled restorations.
          </p>
          <div className="pt-2 text-xs font-technical-data text-[#e0c0b1] flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#ff7a1a] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">14826 Yarberry St</span>
              <br />
              <span className="text-[#a78b7d]">Houston, TX 77039, USA</span>
            </div>
          </div>
          <div className="pt-1 text-xs font-technical-data text-[#e0c0b1] flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#ff7a1a] shrink-0" />
            <a 
              href="tel:13472268235" 
              className="font-bold text-white hover:text-[#ff7a1a] font-mono transition-colors"
            >
              1347-226-8235
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-2.5 font-label-caps text-xs tracking-wider uppercase">
          <span className="font-bold text-white font-mono text-[11px] mb-1">Navigation</span>
          <a className="hover:text-[#ff7a1a] transition-colors py-1 min-h-[32px] flex items-center" href="#vintage-cars">Vintage Cars</a>
          <a className="hover:text-[#ff7a1a] transition-colors py-1 min-h-[32px] flex items-center" href="#catalog">Parts Catalog</a>
          <a className="hover:text-[#ff7a1a] transition-colors py-1 min-h-[32px] flex items-center" href="#reviews">Customer Reviews</a>
          <a className="hover:text-[#ff7a1a] transition-colors flex items-center gap-1.5 py-1 min-h-[32px]" href="#workshop-location">
            <MapPin className="w-3 h-3 text-[#ff7a1a]" /> Workshop Map
          </a>
        </div>

        {/* Restoration & Direct Contact Support */}
        <div className="flex flex-col gap-2.5 font-label-caps text-xs tracking-wider uppercase">
          <span className="font-bold text-white font-mono text-[11px] mb-1">Restoration & Support</span>
          <a className="hover:text-[#ff7a1a] transition-colors py-1 min-h-[32px] flex items-center" href="#workshop">Video Showcase</a>
          <a className="hover:text-[#ff7a1a] transition-colors py-1 min-h-[32px] flex items-center" href="#workshop-location">Visit Our Garage</a>
          <a 
            href="tel:13472268235" 
            className="hover:text-[#ff7a1a] text-left transition-colors flex items-center gap-1.5 py-1 min-h-[32px] cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-[#ff7a1a]" /> Tel: 1347-226-8235
          </a>
        </div>

        {/* Technical Specs & Status Footer Note */}
        <div className="flex flex-col gap-2 font-technical-data text-xs text-[#a78b7d]">
          <span className="text-[#83cffb] font-bold">SYSTEM STATUS // ONLINE</span>
          <span className="flex items-center gap-1 text-[#e0c0b1]">
            <Clock className="w-3.5 h-3.5 text-[#ff7a1a] shrink-0" /> Mon-Fri: 8AM-6PM CST | Sat: 9AM-4PM
          </span>
          <span className="flex items-center gap-1 text-[#e0c0b1] pt-1">
            <Phone className="w-3.5 h-3.5 text-[#ff7a1a] shrink-0" /> Contact: <a href="tel:13472268235" className="text-white hover:text-[#ff7a1a] font-mono font-bold ml-1">1347-226-8235</a>
          </span>
          <span>Casting Verification Active</span>
          <span className="pt-2 text-[11px]">© {new Date().getFullYear()} CLASSIC AIRCOOLED VW WORKS. All rights reserved.</span>
        </div>

      </div>
    </footer>
  );
}
