import React, { useState, useEffect } from 'react';
import { ShoppingBag, ShieldCheck, ArrowLeft, Phone, CheckCircle2, AlertCircle, Wrench, Package, Truck, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { getCatalogParts } from '../data/catalogStore';
import { updateDocumentMeta, slugify } from '../utils/router';

export default function ProductDetailPage({
  productId,
  productSlug,
  onAddToCart,
  onRequestItem,
  onReserveItem,
  onNavigate
}) {
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // 1. Try local catalogStore cache first for instant rendering
    const localList = getCatalogParts();
    const cachedItem = localList.find(p => String(p.id) === String(productId));
    if (cachedItem && isMounted) {
      setPart(cachedItem);
      setLoading(false);
    }

    // 2. Fetch full part record from API
    fetch(`${API_BASE_URL}/api/parts/${productId}`)
      .then(res => {
        if (!res.ok) throw new Error('Part not found');
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          if (data.success && data.data) {
            setPart(data.data);
          } else if (cachedItem) {
            setPart(cachedItem);
          } else {
            throw new Error('Part data unavailable');
          }
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          if (!cachedItem) {
            setError(err.message || 'Unable to load part details');
          }
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [productId]);

  // Set document meta and Product JSON-LD
  useEffect(() => {
    if (!part) return;

    const partTitle = part.title || 'Air-Cooled VW Part';
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
      description: part.description || `Authentic aircooled VW part: ${partTitle}. OEM blueprint verified.`,
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
      description: `${partTitle} - OEM verified aircooled VW part for Beetle, Bus, Ghia. $${price.toLocaleString()} USD. Dispatched from Houston, TX.`,
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
        <p className="text-xs text-amber-400 font-mono">Retrieving Vintage Blueprint &amp; Specs...</p>
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
          The requested part reference (#{productId}) may have been sold or archived. Contact our shop directly to verify warehouse availability.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <a
            href="tel:19452879865"
            className="min-h-[44px] px-5 bg-[#ff7a1a] text-slate-950 font-bold text-xs font-mono uppercase tracking-wider rounded-xl flex items-center gap-2"
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
            className="min-h-[44px] px-5 bg-slate-900 border border-slate-700 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl flex items-center gap-2"
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-[#e0c0b1] font-technical-data">
      {/* Back Link */}
      <div className="mb-6">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-[#181719] border border-[#584236]/50 rounded-2xl p-6 sm:p-8">
        {/* Product Media */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center relative">
            {part.image ? (
              <img
                src={part.image}
                alt={part.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-600 font-mono text-xs">No Photo Available</div>
            )}

            {inStock ? (
              <span className="absolute top-3 left-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono px-2 py-1 rounded">
                ● In Stock – Houston Warehouse
              </span>
            ) : (
              <span className="absolute top-3 left-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono px-2 py-1 rounded">
                Custom Build / Hold
              </span>
            )}
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-[#a78b7d] space-y-1">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspection &amp; Crating</span>
            </div>
            <p>Every component is checked against genuine Volkswagen factory specifications before shipment.</p>
          </div>
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <span>REF ID: #{part.id}</span>
              <span>•</span>
              <span>OEM: {part.oemNumber || part.sku || 'GENUINE'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display leading-snug">
              {part.title}
            </h1>

            <div className="text-3xl font-extrabold text-amber-400 font-display">
              {price > 0 ? (
                <>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)}{' '}
                  <span className="text-xs font-mono text-slate-400">USD</span>
                </>
              ) : (
                <span className="text-xl text-[#a78b7d]">Contact for price</span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#e0c0b1] leading-relaxed">
              {part.description || 'Authentic precision component for classic air-cooled Volkswagen engines, transmissions, and chassis restorations. Verified against original mechanical blueprints.'}
            </p>

            {/* Specifications Table */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-[#a78b7d]">Compatibility:</span>
                <span className="text-white font-bold">
                  {part.compatibleModels && part.compatibleModels.length > 0 
                    ? part.compatibleModels.join(', ') 
                    : (part.modelYearRange || 'VW Beetle / Bus T1/T2 / Ghia')}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-[#a78b7d]">Category:</span>
                <span className="text-white">{part.category || part.systemCategory || 'Engine System'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-[#a78b7d]">Condition:</span>
                <span className="text-emerald-400 font-bold">{part.condition || 'New / Rebuilt OEM'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a78b7d]">Shipping Estimate:</span>
                <span className="text-white">Insured Freight Quote Confirmed by Shop</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => onAddToCart && onAddToCart(part)}
              className="w-full min-h-[48px] bg-[#ff7a1a] hover:bg-[#ff964d] text-slate-950 font-bold text-xs sm:text-sm font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add To Cart (${price.toLocaleString()} USD)</span>
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
              <span>Questions? Call: +1 (945) 287-9865</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
