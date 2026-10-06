import React, { useState, useEffect, useMemo } from 'react';
import { Phone, MessageCircle, ShieldCheck, Wrench, ArrowRight, Gauge, CheckCircle2, Send, AlertCircle, Check } from 'lucide-react';
import CatalogSection from '../components/CatalogSection';
import { updateDocumentMeta } from '../utils/router';
import { API_BASE_URL } from '../config/api';
import { triggerGoogleAdsConversion, trackLead } from '../analytics';
import { getCachedCatalogParts } from '../data/catalogStore';

export default function EnginesPage({
  onAddToCart,
  onRequestItem,
  onReserveItem,
  onViewPartDetails,
  onToggleWishlist,
  wishlistIds,
  searchTerm,
  onNavigate
}) {
  useEffect(() => {
    updateDocumentMeta({
      title: 'Complete Aircooled VW Engines | Classic Aircooled VW Works',
      description: 'Turn-key and longblock air-cooled VW engines for Beetle, Bus T1/T2, Karmann Ghia. Houston, TX.',
      canonicalPath: '/engines',
      ogType: 'website'
    });
  }, []);

  // WhatsApp and Telephone contact configuration
  const rawWhatsapp = import.meta.env.VITE_WHATSAPP_NUMBER || '19452879865';
  const whatsappNumber = String(rawWhatsapp).replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I'm contacting Classic Aircooled VW Works regarding an aircooled VW engine build.")}`;

  // Engine size filter chips derived from catalog data and target displacements
  const [selectedEngineFilter, setSelectedEngineFilter] = useState('ALL');

  const engineSizes = useMemo(() => {
    const targetSizes = ['1600cc', '1776cc', '1835cc', '2007cc', '2276cc'];
    const cached = getCachedCatalogParts();
    const sizesFromCatalog = new Set();
    if (Array.isArray(cached) && cached.length > 0) {
      cached.forEach(part => {
        if (part.engineSize) sizesFromCatalog.add(part.engineSize);
        if (Array.isArray(part.compatibleEngineSizes)) {
          part.compatibleEngineSizes.forEach(s => sizesFromCatalog.add(s));
        }
      });
    }
    // Return target sizes, preserving exact order required
    return targetSizes;
  }, []);

  // Reserve / Request engine form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    engineSize: '1600cc',
    message: '',
    referralSource: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError(null);
  };

  const handleSubmitEngineRequest = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim() || !formData.phone.trim()) {
      setSubmitError('Please provide your name and phone / WhatsApp number.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const reqPayload = {
      partId: `engine-${formData.engineSize.replace(/\D/g, '') || 'custom'}`,
      partTitle: `${formData.engineSize} Turn-Key VW Engine Build Request`,
      partImage: '',
      sku: `ENG-${formData.engineSize.toUpperCase()}`,
      price: 0,
      compatibility: 'Aircooled VW Beetle / Bus / Karmann Ghia',
      type: 'RESERVE',
      status: 'Pending',
      userName: formData.name.trim(),
      userEmail: formData.email.trim() || 'guest@aircooledworks.com',
      userPhone: formData.phone.trim(),
      userCity: '',
      notes: [
        `Requested Engine Size: ${formData.engineSize}`,
        formData.message.trim() ? `Specifications/Notes: ${formData.message.trim()}` : null,
        formData.referralSource ? `Referral Source: ${formData.referralSource}` : null
      ].filter(Boolean).join(' | ')
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));

      // Honest error handling: treat success ONLY when server responds ok with valid data.id
      if (!res.ok || !data?.success || !data?.data?.id) {
        throw new Error("We couldn't send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865.");
      }

      const record = data.data;

      // Honest conversion tracking: fire ONLY after the server confirms
      triggerGoogleAdsConversion({
        id: record.id,
        type: 'reservation',
        part: { title: reqPayload.partTitle, sku: reqPayload.sku },
        value: 0
      });
      trackLead({
        id: record.id,
        type: 'reservation',
        part: { title: reqPayload.partTitle, sku: reqPayload.sku },
        value: 0
      });

      setSubmitSuccess({
        id: record.id,
        name: reqPayload.userName,
        engineSize: formData.engineSize
      });
      setFormData({
        name: '',
        phone: '',
        email: '',
        engineSize: '1600cc',
        message: '',
        referralSource: ''
      });
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('API engine reservation request failed:', err);
      // Keep form inputs intact, do NOT fire conversion, show inline red error
      setSubmitError("We couldn't send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-[#e5e2e3] font-technical-data">
      {/* Landing Header with Above-The-Fold Actions & Reservation Form */}
      <section className="bg-gradient-to-b from-[#181719] to-[#131314] border-b border-[#584236]/40 py-10 sm:py-14 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Heading, Value Props & Direct Contact Buttons */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-400 font-mono">
                <Gauge className="w-3.5 h-3.5" />
                <span>Turn-Key Longblocks &amp; Precision Flat-Fours</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
                Complete Aircooled VW Engines &amp; Turn-Key Builds
              </h1>

              <p className="text-sm sm:text-base text-[#e0c0b1] max-w-2xl leading-relaxed">
                Air-cooled flat-four engines for classic Volkswagen models. From 1600cc dual-port restorations to 2276cc builds for Beetle, Bus, and Karmann Ghia. Built with inspected cases, clearances, and oil pressure testing.
              </p>

              {/* Above-The-Fold WhatsApp, Call & Inventory Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="tel:19452879865"
                  className="min-h-[46px] px-5 bg-[#ff7a1a] hover:bg-[#ff964d] text-slate-950 font-bold text-xs sm:text-sm font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all"
                  aria-label="Call Workshop at +1 (945) 287-9865"
                >
                  <Phone className="w-4 h-4 fill-current shrink-0" />
                  <span>Call Shop: +1 (945) 287-9865</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[46px] px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  aria-label="Chat on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>WhatsApp Us</span>
                </a>

                <a
                  href="#catalog"
                  className="min-h-[46px] px-5 bg-[#181719] hover:bg-[#252426] border border-[#584236] text-[#e5e2e3] font-bold text-xs sm:text-sm font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Value Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#584236]/30 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Workshop Tested &amp; Assembled</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Magnesium &amp; Aluminum Cases</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Wrench className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Palletized Freight Crate</span>
                </div>
              </div>
            </div>

            {/* Right Column: Short Reserve / Request Engine Form */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-[#181719] border border-[#584236]/60 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2.5 pb-4 border-b border-[#584236]/40 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white font-display leading-tight">
                      Reserve / Request Engine Build
                    </h2>
                    <p className="text-[11px] text-[#a09088] font-mono">
                      Consult with our engine builders in Houston
                    </p>
                  </div>
                </div>

                {submitSuccess ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>Request Received! (Ref #{submitSuccess.id})</span>
                    </div>
                    <p className="text-emerald-200/90 leading-relaxed">
                      Thank you, {submitSuccess.name}. We have logged your request for a {submitSuccess.engineSize} build. Our workshop will contact you via WhatsApp or phone with build specifications and scheduling.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(null)}
                      className="mt-2 text-xs font-mono text-emerald-400 underline hover:text-emerald-300"
                    >
                      Submit another request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitEngineRequest} className="space-y-3.5">
                    {submitError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{submitError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#b8a89f] mb-1">
                        Full Name <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. John Miller"
                        className="w-full bg-[#131314] border border-[#584236] rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none min-h-[42px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-[#b8a89f] mb-1">
                          Phone / WhatsApp <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-[#131314] border border-[#584236] rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none min-h-[42px]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-[#b8a89f] mb-1">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="name@example.com"
                          className="w-full bg-[#131314] border border-[#584236] rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none min-h-[42px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-[#b8a89f] mb-1">
                          Engine Size <span className="text-amber-400">*</span>
                        </label>
                        <select
                          name="engineSize"
                          value={formData.engineSize}
                          onChange={handleInputChange}
                          className="w-full bg-[#131314] border border-[#584236] rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none min-h-[42px]"
                        >
                          <option value="1600cc">1600cc (Dual-Port / Stock)</option>
                          <option value="1776cc">1776cc (Daily Street Cruiser)</option>
                          <option value="1835cc">1835cc (Torque &amp; Camper)</option>
                          <option value="2007cc">2007cc (Stroker Performance)</option>
                          <option value="2276cc">2276cc (Competition Flat-Four)</option>
                          <option value="Custom / Other">Custom / Other Size</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-[#b8a89f] mb-1">
                          How did you hear about us?
                        </label>
                        <select
                          name="referralSource"
                          value={formData.referralSource}
                          onChange={handleInputChange}
                          className="w-full bg-[#131314] border border-[#584236] rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none min-h-[42px]"
                        >
                          <option value="">Select source (optional)</option>
                          <option value="Google Search">Google Search</option>
                          <option value="The Samba / VW Forum">The Samba / VW Forum</option>
                          <option value="Instagram / Social Media">Instagram / Social Media</option>
                          <option value="Friend / Word of Mouth">Friend / Word of Mouth</option>
                          <option value="Returning Customer">Returning Customer</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#b8a89f] mb-1">
                        Vehicle Details / Message
                      </label>
                      <textarea
                        name="message"
                        rows="2"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Vehicle model, year, transmission, or specific build goals..."
                        className="w-full bg-[#131314] border border-[#584236] rounded-lg px-3 py-2 text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full min-h-[44px] px-4 py-2.5 bg-[#ff7a1a] hover:bg-[#ff964d] disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      {isSubmitting ? (
                        <span>Submitting Request...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Engine Request</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Engine-Size Filter Chips Derived from Catalog Data */}
      <section className="pt-8 pb-2 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#584236]/30">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400">Catalog Filter</div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-display">Engine Size Displacement</h2>
          </div>
          <div className="text-xs text-[#a09088] font-mono">
            {selectedEngineFilter === 'ALL' ? 'Showing all engine sizes' : `Filtered to ${selectedEngineFilter}`}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3">
          <button
            type="button"
            onClick={() => setSelectedEngineFilter('ALL')}
            className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              selectedEngineFilter === 'ALL'
                ? 'bg-[#ff7a1a] text-slate-950 font-bold shadow-md shadow-[#ff7a1a]/20'
                : 'bg-[#1e1c1f] hover:bg-[#28262a] text-[#d6d0cb] border border-[#584236]/50'
            }`}
          >
            All Sizes
          </button>
          {engineSizes.map(size => {
            const isActive = selectedEngineFilter === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedEngineFilter(isActive ? 'ALL' : size)}
                className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#ff7a1a] text-slate-950 font-bold shadow-md shadow-[#ff7a1a]/20'
                    : 'bg-[#1e1c1f] hover:bg-[#28262a] text-[#d6d0cb] border border-[#584236]/50'
                }`}
              >
                <span>{size}</span>
                {isActive && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Catalog with Preset Filters & Selected Engine Filter */}
      <section className="py-6">
        <CatalogSection
          onAddToCart={onAddToCart}
          onRequestItem={onRequestItem}
          onReserveItem={onReserveItem}
          onViewPartDetails={onViewPartDetails}
          onToggleWishlist={onToggleWishlist}
          wishlistIds={wishlistIds}
          searchTerm={searchTerm}
          activeFilter={{
            systemId: 'engine-system',
            categoryId: 'ALL',
            engineSize: selectedEngineFilter
          }}
        />
      </section>
    </div>
  );
}
