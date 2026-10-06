import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, ShieldCheck, ArrowLeft, Phone, CheckCircle2, AlertCircle, 
  Wrench, Package, ArrowRight, Award, FileText, Cpu, Check, Layers, Sparkles 
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { getCatalogParts, getCachedCatalogParts, normalizeCatalogPart } from '../data/catalogStore';
import { SPARE_PARTS, VINTAGE_CARS } from '../data/partsData';
import { updateDocumentMeta, slugify } from '../utils/router';

export default function ProductDetailPage({
  productId,
  productSlug,
  rawParam,
  onAddToCart,
  onRequestItem,
  onReserveItem,
  onNavigate
}) {
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setActiveImageIndex(0);

    const searchTarget = rawParam || productId;

    async function loadPart() {
      try {
        let resolvedPart = null;
        let effectiveId = productId;

        // 1. Try synchronous memory cache for instant 0ms rendering
        const cached = getCachedCatalogParts();
        if (Array.isArray(cached) && cached.length > 0) {
          resolvedPart = cached.find(p => 
            String(p.id) === String(productId) ||
            String(p.id) === String(searchTarget) ||
            (searchTarget && searchTarget.startsWith(`${p.id}-`))
          );
        }

        // 2. Try static SPARE_PARTS database
        if (!resolvedPart && Array.isArray(SPARE_PARTS)) {
          resolvedPart = SPARE_PARTS.find(p => 
            String(p.id) === String(productId) ||
            String(p.id) === String(searchTarget) ||
            (searchTarget && searchTarget.startsWith(`${p.id}-`))
          );
        }

        // 3. Try static VINTAGE_CARS database
        if (!resolvedPart && Array.isArray(VINTAGE_CARS)) {
          resolvedPart = VINTAGE_CARS.find(c => 
            String(c.id) === String(productId) ||
            String(c.id) === String(searchTarget) ||
            (searchTarget && searchTarget.startsWith(`${c.id}-`))
          );
        }

        if (resolvedPart && isMounted) {
          setPart(normalizeCatalogPart(resolvedPart));
          effectiveId = resolvedPart.id;
          setLoading(false);
        }

        // 4. If still not resolved, fetch full catalog from backend
        if (!resolvedPart) {
          try {
            const catalog = await getCatalogParts();
            if (Array.isArray(catalog)) {
              resolvedPart = catalog.find(p => 
                String(p.id) === String(productId) ||
                String(p.id) === String(searchTarget) ||
                (searchTarget && searchTarget.startsWith(`${p.id}-`))
              );
              if (resolvedPart && isMounted) {
                setPart(normalizeCatalogPart(resolvedPart));
                effectiveId = resolvedPart.id;
                setLoading(false);
              }
            }
          } catch (_) {}
        }

        // 5. Fetch fresh full part record by ID from API for high-res images & latest specs
        const queryId = effectiveId || productId || searchTarget;
        if (queryId) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/parts/${queryId}`);
            if (res.ok) {
              const data = await res.json();
              if (isMounted && data.success && data.data) {
                const normalized = normalizeCatalogPart(data.data);
                setPart(normalized);
                resolvedPart = normalized;
              }
            }
          } catch (_) {}
        }

        if (!resolvedPart && isMounted) {
          throw new Error(`Part #${searchTarget || productId || 'item'} not found in catalog`);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load part details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (searchTarget || productId) {
      loadPart();
    } else {
      setError('Invalid part reference');
      setLoading(false);
    }

    return () => { isMounted = false; };
  }, [productId, rawParam]);

  // Set document meta and Product JSON-LD for SEO & Google Merchant
  useEffect(() => {
    if (!part) return;

    const partTitle = part.title || part.name || 'Air-Cooled VW Part';
    const canonicalSlug = productSlug || slugify(partTitle);
    const canonicalPath = `/parts/item/${part.id}-${canonicalSlug}`;
    const price = Number(part.price || 0);
    const imageUrl = (part.image && part.image.startsWith('http')) 
      ? part.image 
      : 'https://www.classicaircooledvwworks.com/logo.png';

    const inStock = part.inStock !== false && part.stock !== 0;

    const productJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: partTitle,
      image: imageUrl,
      description: part.description || part.provenance || `Classic aircooled VW part: ${partTitle}. Aircooled engines, parts and restoration.`,
      sku: part.sku || part.oemNumber || String(part.id),
      offers: {
        '@type': 'Offer',
        price: String(price),
        priceCurrency: 'USD',
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `https://www.classicaircooledvwworks.com${canonicalPath}`,
        seller: {
          '@type': 'AutoPartsStore',
          name: 'Classic Aircooled VW Works'
        }
      }
    };

    updateDocumentMeta({
      title: `${partTitle} | Classic Aircooled VW Works`,
      description: `${partTitle} - Classic aircooled VW component. $${price.toLocaleString()} USD. Dispatched from Houston, TX.`,
      canonicalPath,
      ogType: 'product',
      ogImage: imageUrl,
      jsonLd: productJsonLd
    });
  }, [part, productSlug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4 font-technical-data">
        <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-amber-400 font-mono tracking-widest uppercase">Retrieving Vintage Blueprint &amp; Specs...</p>
      </div>
    );
  }

  if (error || !part) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5 font-technical-data text-[#e0c0b1]">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white font-display">Part Not Found in Catalog</h1>
        <p className="text-xs text-slate-400">
          The requested part reference (#{productId || rawParam || 'item'}) may have been sold or archived. Contact our shop directly to verify warehouse availability.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <a
            href="tel:19452879865"
            className="min-h-[44px] px-5 bg-[#ff7a1a] hover:bg-[#ff964d] text-slate-950 font-bold text-xs font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 transition-colors"
          >
            <Phone className="w-4 h-4 fill-current" />
            <span>Call Shop: (945) 287-9865</span>
          </a>
          <a
            href="/parts"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('/parts');
              }
            }}
            className="min-h-[44px] px-5 bg-slate-900 border border-slate-700 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <span>Browse All Parts</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  const price = Number(part.price || 0);
  const inStock = part.inStock !== false && part.stock !== 0;

  // Build images array for gallery
  const allImages = [
    part.image,
    ...(Array.isArray(part.additionalImages) ? part.additionalImages : [])
  ].filter(Boolean);

  const currentDisplayImage = allImages[activeImageIndex] || part.image;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-[#e0c0b1] font-technical-data">
      {/* Back to Catalog Breadcrumb Link */}
      <div className="mb-6 flex items-center justify-between">
        <a
          href="/parts"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate('/parts');
            }
          }}
          className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Parts Catalog
        </a>
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider hidden sm:block">
          REF #{part.id} • {part.carModelName || part.modelYearRange || 'Air-Cooled VW'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-[#181719] border border-[#584236]/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
        
        {/* Left Column: Product Media & Badges */}
        <div className="md:col-span-5 space-y-4">
          <div className="aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center relative shadow-inner">
            {currentDisplayImage ? (
              <img
                src={currentDisplayImage}
                alt={part.title || part.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="text-slate-600 font-mono text-xs">No Photo Available</div>
            )}

            {inStock ? (
              <span className="absolute top-3 left-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold px-2 py-1 rounded backdrop-blur-sm">
                ● In Stock – Houston Warehouse
              </span>
            ) : (
              <span className="absolute top-3 left-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold px-2 py-1 rounded backdrop-blur-sm">
                Custom Order / Hold
              </span>
            )}

            {part.rarityScore && (
              <span className="absolute bottom-3 left-3 bg-black/80 border border-amber-500/40 text-amber-300 text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                <Award className="w-3 h-3 text-amber-400" />
                <span>{part.rarityScore}</span>
              </span>
            )}
          </div>

          {/* Multiple Image Gallery Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {allImages.map((thumbUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#ff7a1a] ring-2 ring-[#ff7a1a]/50 scale-105'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={thumbUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Inspection & Crating */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-[#a78b7d] space-y-1.5">
            <div className="flex items-center gap-1.5 text-white font-bold font-display">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Workshop Inspection &amp; Crating</span>
            </div>
            <p className="leading-relaxed">
              Components are inspected prior to shipment and packaged for domestic or international freight.
            </p>
          </div>

          {/* Workshop Component Badge */}
          <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Classic Aircooled VW Works Component</span>
          </div>
        </div>

        {/* Right Column: Full Product Specifications & Actions */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Model & Era Subtitle */}
            <div className="flex items-center justify-between text-xs font-mono text-amber-400 uppercase tracking-wider">
              <span>{part.carModelName || part.modelYearRange || 'VW Air-Cooled'} • {part.era || 'All Years'}</span>
              <span className="text-emerald-400 font-bold">
                {part.condition || (inStock ? 'Available' : 'Custom Build')}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display leading-tight">
              {part.title || part.name}
            </h1>

            {/* Price Display */}
            <div className="text-3xl font-extrabold text-amber-400 font-display">
              {price > 0 ? (
                <>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)}{' '}
                  <span className="text-xs font-mono text-slate-400 font-normal">USD</span>
                </>
              ) : (
                <span className="text-xl text-[#a78b7d]">Contact for price</span>
              )}
            </div>

            {/* Part Identifier Pills */}
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              {(part.oemNumber || part.sku) && (
                <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded">
                  {part.oemNumber ? 'OEM: ' : 'SKU: '}
                  <strong className="text-white">{part.oemNumber || part.sku}</strong>
                  {part.oemNumber && part.sku && (
                    <span className="text-slate-400 font-normal"> • SKU: <strong className="text-white">{part.sku}</strong></span>
                  )}
                </span>
              )}
              {part.castingCode && (
                <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded">
                  CASTING: <strong className="text-amber-400">{part.castingCode}</strong>
                </span>
              )}
              {part.category && (
                <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded">
                  SYSTEM: <strong className="text-white">{part.category}</strong>
                </span>
              )}
            </div>

            {/* Provenance & Description */}
            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Provenance &amp; Technical Description</span>
              </div>
              <p className="text-xs text-[#e0c0b1] leading-relaxed">
                {part.description || part.provenance || 'Precision component for classic air-cooled Volkswagen engines, transmissions, and chassis restorations.'}
              </p>
            </div>

            {/* Technical Specifications Grid */}
            {Array.isArray(part.specifications) && part.specifications.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Technical Specifications:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {part.specifications.map((spec, i) => (
                    <div key={i} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px] truncate">{spec.key}</span>
                      <span className="text-slate-100 font-bold truncate block">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vehicle Documentation Attributes (If Present) */}
            {(part.vinNumber || part.mileage || part.engineInstalled || part.transmissionType || part.exteriorColor) && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>🚗 Vehicle Documentation</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                    {part.titleStatus || 'Clean Title'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  {part.vinNumber && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">VIN</span>
                      <span className="text-white font-bold truncate block">{part.vinNumber}</span>
                    </div>
                  )}
                  {part.mileage && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">MILEAGE</span>
                      <span className="text-amber-300 font-bold truncate block">{part.mileage}</span>
                    </div>
                  )}
                  {part.engineInstalled && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">ENGINE</span>
                      <span className="text-white font-bold truncate block">{part.engineInstalled}</span>
                    </div>
                  )}
                  {part.transmissionType && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">TRANSMISSION</span>
                      <span className="text-white font-bold truncate block">{part.transmissionType}</span>
                    </div>
                  )}
                  {part.exteriorColor && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">COLOR</span>
                      <span className="text-white font-bold truncate block">{part.exteriorColor}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compatibility Matrix */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>Compatibility Matrix:</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                {(part.compatibleModels || part.compatibleVehicles || [part.modelYearRange || 'Universal Air-Cooled VW']).map((v, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => onAddToCart && onAddToCart(part)}
              className="w-full min-h-[48px] bg-[#ff7a1a] hover:bg-[#ff964d] text-slate-950 font-bold text-xs sm:text-sm font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add To Cart {price > 0 ? `($${price.toLocaleString()} USD)` : ''}</span>
            </button>

            <button
              onClick={() => onReserveItem ? onReserveItem(part) : onRequestItem && onRequestItem(part)}
              className="w-full min-h-[46px] bg-[#181719] hover:bg-[#252426] border border-[#83cffb]/50 text-[#83cffb] hover:text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Reserve &amp; Hold This Item</span>
            </button>

            <a
              href="tel:19452879865"
              className="w-full min-h-[44px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Questions? Call Workshop: +1 (945) 287-9865</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
