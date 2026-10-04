import React, { useEffect } from 'react';
import { Phone, ArrowLeft, Wrench, ArrowRight, AlertTriangle } from 'lucide-react';
import { updateDocumentMeta } from '../utils/router';

export default function NotFoundPage({ onNavigate }) {
  useEffect(() => {
    updateDocumentMeta({
      title: 'Page Not Found (404) | Classic Aircooled VW Works',
      description: 'The requested vintage aircooled VW page or blueprint was not found. Contact our Houston workshop.',
      canonicalPath: '/404',
      ogType: 'website'
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6 font-technical-data text-[#e0c0b1]">
      <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="text-xs font-mono text-amber-400 uppercase tracking-widest">
          ERROR CODE // 404
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Blueprint Not Found
        </h1>
        <p className="text-sm text-[#a78b7d] max-w-md mx-auto leading-relaxed">
          The page or vintage parts catalog entry you are looking for has been moved, re-indexed, or does not exist.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <a
          href="/"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate('/');
            }
          }}
          className="min-h-[46px] px-6 bg-[#ff7a1a] hover:bg-[#ff964d] text-slate-950 font-bold text-xs font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </a>

        <a
          href="/parts"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate('/parts');
            }
          }}
          className="min-h-[46px] px-6 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 transition-colors"
        >
          <span>Browse Parts Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </a>

        <a
          href="tel:19452879865"
          className="min-h-[46px] px-6 bg-slate-950 hover:bg-slate-900 border border-amber-500/40 text-amber-400 font-bold text-xs font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span>Call Shop: +1 (945) 287-9865</span>
        </a>
      </div>
    </div>
  );
}
