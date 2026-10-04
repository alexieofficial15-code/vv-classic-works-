import React, { useEffect } from 'react';
import { Shield, ArrowLeft, Phone, MapPin, Clock, Mail } from 'lucide-react';
import { updateDocumentMeta } from '../utils/router';

export default function PrivacyPolicy({ onNavigate }) {
  useEffect(() => {
    updateDocumentMeta({
      title: 'Privacy Policy | Classic Aircooled VW Works',
      description: 'Privacy policy for Classic Aircooled VW Works. Learn how customer data, orders, and tracking cookies are collected and protected.',
      canonicalPath: '/privacy',
      ogType: 'website'
    });
  }, []);
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-[#e0c0b1] font-technical-data">
      <div className="mb-8">
        <a
          href="/"
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate('/');
            }
          }}
          className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workshop Home
        </a>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">Privacy Policy</h1>
            <p className="text-xs text-[#a78b7d]">Last updated: October 2026 • Classic Aircooled VW Works</p>
          </div>
        </div>
      </div>

      <div className="bg-[#181719] border border-[#584236]/50 rounded-xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            1. Overview & Business Information
          </h2>
          <p>
            Classic Aircooled VW Works operates this website to provide vintage air-cooled Volkswagen engines, restoration parts, blueprints, and repair services. We respect the privacy of our website visitors, customers, and registered restorers.
          </p>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs space-y-1.5 font-mono">
            <div><strong>Business Name:</strong> Classic Aircooled VW Works</div>
            <div><strong>Physical Address:</strong> 14826 Yarberry St, Houston, TX 77039, USA</div>
            <div><strong>Telephone:</strong> <a href="tel:19452879865" className="text-amber-400 underline">+1 (945) 287-9865</a></div>
            <div><strong>Business Hours:</strong> Monday – Friday 8:00 AM – 6:00 PM CST | Saturday 9:00 AM – 4:00 PM CST</div>
            <div><strong>Contact Email:</strong> [OWNER: official support email address]</div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            2. Information We Collect
          </h2>
          <p>
            We collect only the personal information strictly necessary to process your inquiries, part hold reservations, crate shipping estimates, and orders:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#e5e2e3]">
            <li><strong>Customer Contact Details:</strong> Full name, email address, telephone / WhatsApp number.</li>
            <li><strong>Delivery Information:</strong> Physical delivery address, city, state, postal code, and country for freight routing.</li>
            <li><strong>Vehicle & Build Notes:</strong> VW model year, engine code, and compatibility requests submitted with orders or hold requests.</li>
            <li><strong>Account Credentials:</strong> Hashed passwords for registered members (stored securely via Supabase Auth).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            3. Cookies, Analytics & Advertising
          </h2>
          <p>
            Our website uses modern web analytics and advertising measurement tags to analyze traffic patterns and assess marketing performance:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#e5e2e3]">
            <li><strong>Google Ads Tag (AW-18481077913):</strong> Used to measure advertising conversions (such as add-to-cart actions, customer inquiries, and verified order submissions) from Google Search campaigns.</li>
            <li><strong>Google Analytics (GA4):</strong> Collects aggregated, non-personally identifiable telemetry regarding page views, session duration, and referral sources.</li>
            <li><strong>Local Browser Storage (localStorage):</strong> We use browser localStorage to preserve your shopping cart, saved restoration vehicle configurations, and session tokens between visits. No sensitive credit card details are ever stored in localStorage.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            4. How We Use Your Information
          </h2>
          <p>
            Your information is used exclusively to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#e5e2e3]">
            <li>Fulfill parts inquiries, verify OEM engine tolerances, and hold rare items in our Houston shop.</li>
            <li>Issue direct workshop invoices and calculate accurate freight crating quotes.</li>
            <li>Contact you via telephone, WhatsApp, or email regarding order status or mechanical compatibility.</li>
            <li>Prevent fraudulent transactions and secure our web systems.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            5. Information Sharing & Third Parties
          </h2>
          <p>
            We do not sell, rent, or trade your personal information. Data is shared only with trusted infrastructure providers required to operate our service:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#e5e2e3]">
            <li><strong>Hosting & Backend Infrastructure:</strong> Vercel (frontend deployment) and Render / Supabase (database storage).</li>
            <li><strong>Freight & Delivery Couriers:</strong> [OWNER: list specific freight carriers e.g., UPS Freight, R+L Carriers, Freightways].</li>
            <li><strong>Legal Obligations:</strong> We may disclose information if required by applicable state or federal law.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-display border-b border-[#584236]/30 pb-2">
            6. Data Retention & Your Rights
          </h2>
          <p>
            You have the right to request access to the personal data we hold about you, request corrections, or ask for the deletion of your account and customer records. To exercise these rights, call our workshop directly at <a href="tel:19452879865" className="text-amber-400 underline font-bold">+1 (945) 287-9865</a> or email [OWNER: official support email address].
          </p>
        </section>
      </div>
    </div>
  );
}
