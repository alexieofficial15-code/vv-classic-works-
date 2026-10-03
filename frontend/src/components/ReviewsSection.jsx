import React, { useState, useMemo } from 'react';
import { Star, ShieldCheck, CheckCircle, ThumbsUp, Quote, Filter, Sparkles, MapPin, Wrench, Award, CheckCircle2, Mail } from 'lucide-react';

const CUSTOMER_REVIEWS = [
  {
    id: 1,
    author: 'Dan Johnson',
    email: 'danjohnson4322@gmail.com',
    role: 'Master Engine Builder',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: '3 days ago',
    category: 'TYPE 1 BEETLE',
    vehicle: '1968 VW Beetle 1600cc Dual-Port',
    partPurchased: 'Dual-Port Heads & Mahle 85.5mm Piston Set',
    title: 'Flawless casting tolerances and verified OEM codes',
    review: 'Rebuilding an air-cooled flat-four engine requires exact tolerances. Every single part received from Classic Aircooled VW Works matched original factory casting blueprints down to the millimeter. Couldn’t ask for better quality.',
    verifiedPurchaser: true,
    badge: 'Master Builder'
  },
  {
    id: 2,
    author: 'Christopher Thomas Jr.',
    email: 'christopher.thomasjr0@gmail.com',
    role: 'Classic VW Engine Specialist',
    location: 'Portland, OR',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: '1 week ago',
    category: 'PERFORMANCE & FUEL',
    vehicle: '1974 Super Beetle 1303S (1776cc)',
    partPurchased: 'Genuine Weber 44 IDF Dual Carburetor Kit with Hex-Bar',
    title: 'Instant throttle response and flawless synchronization',
    review: 'The hex-bar linkage geometry and jetting on the dual Weber 44 IDFs were dialed in right out of the crate. Balanced both carburetor banks in 15 minutes. Engine purrs at idle and pulls relentlessly through 6,000 RPM.',
    verifiedPurchaser: true,
    badge: 'Verified Specialist'
  },
  {
    id: 3,
    author: 'Michael R.',
    email: 'micheal486975@gmail.com',
    role: 'Restoration Shop Owner',
    location: 'Denver, CO',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: '2 weeks ago',
    category: 'BUS & TRANSPORTER',
    vehicle: '1964 Split-Screen VW Bus T1 (1835cc)',
    partPurchased: 'Vintage Speed Stainless Steel Sport Exhaust & 69mm Crank',
    title: 'Top tier customer support, fast freight, and zero knockoffs',
    review: 'Our shop rebuilds 15+ vintage engine assemblies a year. Classic Aircooled VW Works is our primary supplier. High-contrast authentic engine parts, zero knockoffs, and their customer care team knows engine mechanics inside out.',
    verifiedPurchaser: true,
    badge: 'Commercial Partner'
  },
  {
    id: 4,
    author: 'Julian Moreau',
    email: 'dakotabruceclark@gmail.com',
    role: 'Vintage Porsche & VW Builder',
    location: 'San Diego, CA',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: '3 weeks ago',
    category: 'COMPLETE ENGINES',
    vehicle: '2276cc Turbocharged Air-Cooled Type 1 Competition Engine',
    partPurchased: 'Porsche 911 Upright Shroud & Forged 82mm Chromoly Crankshaft',
    title: 'Cooling cylinder head temps dropped by over 45°F on dyno',
    review: 'The upright 11-blade Porsche cooling fan conversion cured all our cylinder #3 overheating issues under boost. Dyno tested at 224 HP with rock solid oil pressure. Unbelievable precision engineering.',
    verifiedPurchaser: true,
    badge: 'Dyno Verified'
  },
  {
    id: 5,
    author: 'Gretchen Weber',
    email: 'jeanlenny811@gmail.com',
    role: 'VW Aircooled Enthusiast',
    location: 'Chicago, IL',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: '1 month ago',
    category: 'PERFORMANCE & FUEL',
    vehicle: '1969 VW Karmann Ghia Coupé',
    partPurchased: 'Finned Billet Air Cleaner Top Hats & Bosch 009 Distributor',
    title: 'Billet finish is pure jewelry for the engine bay',
    review: 'The finned aluminum velocity stack hats give our Karmann Ghia show car that timeless 1960s Cal-Look aesthetic. Combined with the genuine Bosch 009 mechanical advance, flat spots under acceleration completely vanished.',
    verifiedPurchaser: true,
    badge: 'Show Winner'
  },
  {
    id: 6,
    author: 'Craig Thornhill',
    email: 'craigthornhill.vw@gmail.com',
    role: 'Overland & Vintage Camper Mechanic',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: '1 month ago',
    category: 'BUS & TRANSPORTER',
    vehicle: '1971 VW Bus T2 Westfalia Camper',
    partPurchased: 'Dual-Port 40x35.5mm Valve Heads & High-Flow Oil Pump',
    title: 'Tackled mountain passes with full camping gear without a hiccup',
    review: 'Loaded our Westy with 800 lbs of gear through the Cascade Mountains. Cylinder head temperatures stayed under 360°F all day long. Having exact OEM part numbers and telephone support made all the difference.',
    verifiedPurchaser: true,
    badge: 'Westy Adventurer'
  },
  {
    id: 7,
    author: 'Rodney Culp',
    email: 'culprodney.works@gmail.com',
    role: 'Lead Fabricator & Restorer',
    location: 'Danville, AL',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: '1 month ago',
    category: 'TYPE 1 BEETLE',
    vehicle: '1979 VW Super Beetle Convertible "ROGUE"',
    partPurchased: 'Complete 2.0L Performance Longblock & Cross-Bar Breather',
    title: 'Show-winning craftsmanship on our charity build',
    review: 'We used Classic Aircooled VW Works components throughout the ROGUE convertible show build. Every bracket, fuel line fitting, and engine casing bolt fit with zero modification. Took 1st place in its class!',
    verifiedPurchaser: true,
    badge: 'Showcase Build'
  },
  {
    id: 8,
    author: 'Tariq Al-Mansoor',
    email: 'tariq.almansoor77@gmail.com',
    role: 'Air-Cooled Club President',
    location: 'Scottsdale, AZ',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: '2 months ago',
    category: 'TYPE 1 BEETLE',
    vehicle: '1967 VW Beetle Cal-Look Sky Blue Coupe',
    partPurchased: 'EMPI 69mm Counterweighted 8-Dowel Crankshaft',
    title: 'Dynamic spin balance is true to 8,500 RPM',
    review: 'We mic’d every journal before dropping it into the AS41 magnesium case — all within ±0.0001" factory tolerance. Zero vibration at high RPM. An essential foundation for any performance street engine.',
    verifiedPurchaser: true,
    badge: 'Club Verified'
  },
  {
    id: 9,
    author: 'Hannah Lindqvist',
    email: 'hannah.lindqvist.nord@gmail.com',
    role: 'Historical Vehicle Restorer',
    location: 'Minneapolis, MN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: '2 months ago',
    category: 'PERFORMANCE & FUEL',
    vehicle: '1959 VW Beetle Sunroof Sedan',
    partPurchased: 'NOS Ignition Assembly & German Fuel Pump',
    title: 'Found impossible-to-find period-correct German parts',
    review: 'I had searched for 6 months for an unmolested period-correct distributor and carburetor. Classic Aircooled had them in stock with original factory stamps. Started on the first turn of the key!',
    verifiedPurchaser: true,
    badge: 'Preservationist'
  }
];

const REVIEW_CATEGORIES = [
  'ALL REVIEWS',
  'TYPE 1 BEETLE',
  'BUS & TRANSPORTER',
  'COMPLETE ENGINES',
  'PERFORMANCE & FUEL'
];

export default function ReviewsSection() {
  const [selectedCategory, setSelectedCategory] = useState('ALL REVIEWS');
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredReviews = useMemo(() => {
    if (selectedCategory === 'ALL REVIEWS') return CUSTOMER_REVIEWS;
    return CUSTOMER_REVIEWS.filter(r => r.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <section id="reviews" className="max-w-[1440px] mx-auto px-3 sm:px-6 md:px-8 mb-16 sm:mb-24 pt-6 sm:pt-12">
      
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ff7a1a]/10 border border-[#ff7a1a]/30 text-[#ff7a1a] font-technical-data text-[10px] sm:text-xs uppercase tracking-widest rounded-sm mb-3 sm:mb-4">
          <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED BUILDER & RESTORER TESTIMONIALS
        </div>
        <h2 className="font-h2 text-2xl sm:text-3xl md:text-4xl text-[#e5e2e3] font-bold mb-2 sm:mb-4 tracking-tight">
          Trusted by Mechanics & <span className="text-[#ff7a1a]">Engine Builders</span> Worldwide
        </h2>
        <p className="font-body-md text-xs sm:text-sm md:text-base text-[#e0c0b1] max-w-2xl mx-auto leading-relaxed px-2">
          Over 1,240+ verified five-star ratings from dedicated air-cooled enthusiasts, race shops, and classic Volkswagen preservationists.
        </p>
      </div>

      {/* Aggregate Trust Metrics Strip */}
      <div className="glass-panel p-3.5 sm:p-6 rounded-sm mb-6 sm:mb-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 items-center border border-[#584236]/40 text-center sm:text-left">
        
        {/* Rating Score */}
        <div className="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-4">
          <div className="text-2xl sm:text-4xl lg:text-5xl font-bold font-h1 text-[#ff7a1a]">4.98</div>
          <div>
            <div className="flex text-[#ff7a1a] gap-0.5 mb-0.5 sm:mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
              ))}
            </div>
            <div className="font-technical-data text-[10px] sm:text-xs text-[#e0c0b1]">1,240+ Reviews</div>
          </div>
        </div>

        {/* Fitment Guarantee */}
        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#83cffb]/10 border border-[#83cffb]/30 rounded-sm flex items-center justify-center text-[#83cffb] shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="font-h3 text-xs sm:text-sm text-[#e5e2e3] font-bold">100% Fitment</div>
            <div className="font-technical-data text-[9px] sm:text-xs text-[#a78b7d]">Blueprint Match</div>
          </div>
        </div>

        {/* Builder Satisfaction */}
        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ff7a1a]/10 border border-[#ff7a1a]/30 rounded-sm flex items-center justify-center text-[#ff7a1a] shrink-0">
            <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="font-h3 text-xs sm:text-sm text-[#e5e2e3] font-bold">99.4% Satisfied</div>
            <div className="font-technical-data text-[9px] sm:text-xs text-[#a78b7d]">Insured Packing</div>
          </div>
        </div>

        {/* Master Restorer Approved */}
        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-sm flex items-center justify-center text-emerald-400 shrink-0">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="font-h3 text-xs sm:text-sm text-[#e5e2e3] font-bold">Track Tested</div>
            <div className="font-technical-data text-[9px] sm:text-xs text-[#a78b7d]">Dyno Calibration</div>
          </div>
        </div>

      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-10 font-technical-data text-xs">
        <span className="text-[#a78b7d] flex items-center gap-1 mr-1 uppercase tracking-wider text-[10px] sm:text-[11px]">
          <Filter className="w-3 h-3 text-[#ff7a1a]" /> Build:
        </span>
        {REVIEW_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setVisibleCount(6);
            }}
            className={`min-h-[36px] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xs transition-all uppercase tracking-wider font-bold text-[10px] sm:text-[11px] cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#ff7a1a] text-black shadow-md'
                : 'bg-[#201f20] text-[#a78b7d] hover:text-[#e5e2e3] border border-[#584236]/40 hover:border-[#ff7a1a]/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredReviews.slice(0, visibleCount).map((review) => (
          <div 
            key={review.id} 
            className="glass-panel p-4 sm:p-6 flex flex-col justify-between rounded-sm relative group hover:border-[#ff7a1a] transition-all bg-[#181719]/90 border border-[#584236]/50 shadow-lg"
          >
            <Quote className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 text-[#584236]/25 group-hover:text-[#ff7a1a]/25 transition-colors" />

            <div>
              {/* Star Rating, Date & Badge */}
              <div className="flex justify-between items-center mb-2.5 sm:mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex text-[#ff7a1a] gap-0.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 bg-[#ff7a1a]/15 text-[#ff7a1a] border border-[#ff7a1a]/30 font-technical-data rounded-xs font-bold">
                    {review.badge}
                  </span>
                </div>
                <span className="font-technical-data text-[9px] sm:text-[10px] text-[#a78b7d]">
                  {review.date}
                </span>
              </div>

              {/* Title & Review Content */}
              <h3 className="font-h3 text-xs sm:text-sm md:text-base text-[#e5e2e3] font-bold mb-1.5 sm:mb-2.5 leading-snug">
                "{review.title}"
              </h3>
              <p className="font-body-md text-[11px] sm:text-xs text-[#e0c0b1] leading-relaxed mb-4 sm:mb-6">
                {review.review}
              </p>
            </div>

            {/* Author Details, Location, Email & Vehicle Badge */}
            <div className="pt-3 sm:pt-4 border-t border-[#584236]/30 flex items-start gap-2.5 sm:gap-3.5">
              <img 
                src={review.avatar} 
                alt={review.author} 
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-sm object-cover border border-[#584236] shrink-0 mt-0.5"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 font-h3 text-xs text-[#e5e2e3] font-bold truncate">
                  <span>{review.author}</span>
                  <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#83cffb] shrink-0" title="Verified Purchaser" />
                </div>
                
                {review.email && (
                  <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-[#83cffb] font-technical-data truncate">
                    <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#83cffb] shrink-0" />
                    <span className="truncate">{review.email}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-[#a78b7d] font-technical-data truncate">
                  <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#ff7a1a] shrink-0" /> {review.role} • {review.location}
                </div>
                
                <div className="font-technical-data text-[9px] sm:text-[10px] text-[#ff7a1a] font-semibold truncate pt-0.5">
                  🚗 {review.vehicle}
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Show More / Show Less Button */}
      {filteredReviews.length > visibleCount && (
        <div className="text-center mt-6 sm:mt-10">
          <button
            onClick={() => setVisibleCount(prev => prev + 3)}
            className="px-6 py-2.5 sm:px-8 sm:py-3 bg-[#201f20] hover:bg-[#ff7a1a] text-[#e0c0b1] hover:text-black border border-[#584236]/60 hover:border-[#ff7a1a] font-technical-data text-[11px] sm:text-xs uppercase font-bold tracking-widest rounded-xs transition-all shadow-md"
          >
            Load More Reviews ({filteredReviews.length - visibleCount} Remaining)
          </button>
        </div>
      )}

    </section>
  );
}
