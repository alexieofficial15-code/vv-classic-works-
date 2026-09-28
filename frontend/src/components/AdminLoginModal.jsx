import React, { useState } from 'react';
import { X, Lock, Key, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function AdminLoginModal({ isOpen, onClose, onAdminSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    // Hardcoded Standard Master Credentials Validation
    const MASTER_EMAIL = 'admin@rustyaircooled.com';
    const MASTER_PASSWORD = 'admin123';
    const MASTER_SECRET_KEY = 'RUSTY-VINTAGE-2026';

    if (
      email.trim().toLowerCase() === MASTER_EMAIL &&
      password === MASTER_PASSWORD &&
      secretKey.trim() === MASTER_SECRET_KEY
    ) {
      setTimeout(() => {
        setIsLoading(false);
        onAdminSuccess('master-admin-token-2026', { name: 'Master Engineer', email: MASTER_EMAIL, role: 'admin' });
        onClose();
        // Reset form inputs after successful login
        setEmail('');
        setPassword('');
        setSecretKey('');
      }, 400);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/admin-login`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, secretKey })
      });
      const data = await res.json();

      if (data.success) {
        onAdminSuccess(data.token, data.user);
        onClose();
        setEmail('');
        setPassword('');
        setSecretKey('');
      } else {
        setErrorMessage(data.message || 'Invalid admin authentication credentials.');
      }
    } catch (err) {
      setErrorMessage('Invalid admin authentication credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-lg overflow-y-auto">
      <div className="bg-[#131314] border border-[#ff7a1a]/60 text-white w-full max-w-md max-h-[92vh] overflow-y-auto rounded-xs shadow-[0_0_50px_rgba(255,122,26,0.2)] my-auto animate-scale-up">
        
        {/* Header */}
        <div className="bg-[#201f20] px-4 sm:px-6 py-4 border-b border-[#584236]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#ff7a1a] text-black flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold font-h2 text-white uppercase tracking-wider">
                ADMIN PORTAL <span className="text-[#ff7a1a]">GATEWAY</span>
              </h3>
              <span className="text-[10px] text-[#83cffb] font-technical-data">RESERVED FOR MASTER ENGINEERS</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 text-[#a78b7d] hover:text-white hover:bg-[#353436] rounded-xs transition-all cursor-pointer"
            aria-label="Close admin modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAdminLogin} className="p-4 sm:p-6 space-y-4 font-label-caps">
          
          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-xs text-xs font-technical-data flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Admin Email */}
          <div>
            <label className="text-xs font-technical-data text-[#e0c0b1] uppercase block mb-1 font-bold">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a78b7d]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email address..."
                className="w-full min-h-[44px] bg-[#201f20] border border-[#584236]/60 pl-9 pr-3 py-2.5 text-xs text-white font-technical-data focus:outline-none focus:border-[#ff7a1a]"
              />
            </div>
          </div>

          {/* Admin Password */}
          <div>
            <label className="text-xs font-technical-data text-[#e0c0b1] uppercase block mb-1 font-bold">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a78b7d]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full min-h-[44px] bg-[#201f20] border border-[#584236]/60 pl-9 pr-3 py-2.5 text-xs text-white font-technical-data focus:outline-none focus:border-[#ff7a1a]"
              />
            </div>
          </div>

          {/* Secret Security Key */}
          <div>
            <label className="text-xs font-technical-data text-[#e0c0b1] uppercase block mb-1 flex justify-between font-bold">
              <span>Secret Security Key</span>
              <span className="text-[#83cffb] text-[10px]">ENCRYPTED</span>
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff7a1a]" />
              <input
                type="password"
                required
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter secret security key..."
                className="w-full min-h-[44px] bg-[#201f20] border border-[#ff7a1a]/40 pl-9 pr-3 py-2.5 text-xs text-white font-technical-data focus:outline-none focus:border-[#ff7a1a]"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px] mt-2 font-technical-data text-xs text-black bg-[#ff7a1a] hover:bg-[#ffb68e] py-3 uppercase font-bold tracking-wider glow-button flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Authenticating Admin Portal...' : 'Unlock Admin Control Panel'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
