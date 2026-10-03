import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight, Lock, CheckCircle2, User, Mail, Phone, MapPin, FileText } from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  currentUser,
  onUpdateQuantity, 
  onRemoveItem, 
  onProceedToCheckout 
}) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [guestForm, setGuestForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    shippingAddress: currentUser?.city || '',
    notes: ''
  });

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const estimatedShipping = subtotal > 0 ? 150 : 0;
  const grandTotal = subtotal + estimatedShipping;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setGuestForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalOrderSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (onProceedToCheckout) {
        await onProceedToCheckout({
          name: guestForm.name || currentUser?.name || 'Guest Restorer',
          email: guestForm.email || currentUser?.email || 'guest@aircooledworks.com',
          phone: guestForm.phone || '',
          shippingAddress: guestForm.shippingAddress || 'Workshop Pickup / Direct Delivery',
          notes: guestForm.notes || ''
        });
      }
      setOrderSuccess({
        id: `ORD-VINTAGE-${Math.floor(100000 + Math.random() * 900000)}`,
        name: guestForm.name || currentUser?.name || 'Customer',
        email: guestForm.email || currentUser?.email || ''
      });
      setIsCheckingOut(false);
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-[460px] max-w-full bg-slate-900 border-l border-slate-800 text-white shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold font-display text-white">
                {isCheckingOut ? 'Guest & Member Checkout' : (currentUser ? 'Your Garage Cart' : 'Your Guest Cart')}
              </h2>
              <span className="text-xs bg-slate-800 text-amber-400 font-mono px-2 py-0.5 rounded-full border border-amber-500/20">
                {cartItems.length} ITEMS
              </span>
            </div>
            <button
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {orderSuccess ? (
              <div className="text-center py-12 space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-bold font-display text-white">Order Confirmed!</h3>
                <p className="text-xs text-slate-300 font-mono">
                  Thank you, <strong>{orderSuccess.name}</strong>. Your aircooled parts request has been received.
                </p>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-amber-400">
                  ORDER REFERENCE: #{orderSuccess.id}
                </div>
                <p className="text-[11px] text-slate-400">
                  Our master mechanics will contact you regarding crating and delivery dispatch.
                </p>
                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    onClose();
                  }}
                  className="w-full bg-[#ff7a1a] hover:bg-[#ffb68e] text-black font-bold py-3 rounded-xl uppercase tracking-wider text-xs font-mono cursor-pointer"
                >
                  Continue Browsing Catalog
                </button>
              </div>
            ) : isCheckingOut ? (
              /* GUEST CHECKOUT FORM */
              <form onSubmit={handleFinalOrderSubmit} className="space-y-3.5 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    className="text-xs text-amber-400 hover:underline font-mono flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to Items
                  </button>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    Instant Guest Checkout
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    FULL NAME <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      name="name"
                      placeholder="e.g. John Doe"
                      value={guestForm.name}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    EMAIL ADDRESS <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      name="email"
                      placeholder="john@classic-vw.com"
                      value={guestForm.email}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    PHONE NUMBER (FOR DISPATCH) <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="tel"
                      required
                      name="phone"
                      placeholder="+1 (555) 019-2834"
                      value={guestForm.phone}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    DELIVERY ADDRESS / CITY <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      name="shippingAddress"
                      placeholder="Street, City, Postal Code"
                      value={guestForm.shippingAddress}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    ORDER NOTES / VW MODEL COMPATIBILITY (OPTIONAL)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <textarea
                      rows={2}
                      name="notes"
                      placeholder="e.g., For a 1968 1600cc Dual Port Beetle"
                      value={guestForm.notes}
                      onChange={handleFormChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Verified Order: Workshop Invoice will be sent directly to your email. No card charged upfront!</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-[#ff7a1a] hover:bg-[#ffb68e] text-slate-950 font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs sm:text-sm font-mono shadow-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Placing Order...</span>
                  ) : (
                    <>
                      <span>Complete Guest Order (${grandTotal.toLocaleString()} USD)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto" />
                <h3 className="text-base font-bold text-white">Your Guest Cart is Empty</h3>
                <p className="text-xs text-slate-400">
                  Browse our vintage catalog or engine blueprint inspector to add rare parts to your order.
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800 flex gap-3 items-center group"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-white truncate font-display">
                      {item.title}
                    </h4>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      OEM: {item.oemNumber || 'GENUINE'}
                    </div>
                    <div className="text-xs font-bold text-amber-400 font-display">
                      ${((item.price || 0) * item.quantity).toLocaleString()} USD
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5 sm:p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="min-w-[28px] min-h-[28px] flex items-center justify-center p-1 text-slate-400 hover:text-white cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-mono font-bold text-white px-1">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="min-w-[28px] min-h-[28px] flex items-center justify-center p-1 text-slate-400 hover:text-white cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="min-w-[32px] min-h-[32px] flex items-center justify-center p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout Trigger */}
          {cartItems.length > 0 && !isCheckingOut && !orderSuccess && (
            <div className="p-4 sm:p-6 border-t border-slate-800 space-y-3 sm:space-y-4 bg-slate-950/80">
              
              <div className="space-y-1.5 sm:space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>SUBTOTAL:</span>
                  <span className="text-white">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>INSURED FREIGHT (EST.):</span>
                  <span className="text-white">${estimatedShipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-amber-400 border-t border-slate-800 pt-2">
                  <span>GRAND TOTAL:</span>
                  <span>${grandTotal.toLocaleString()} USD</span>
                </div>
              </div>

              {/* Guest Ordering Allowed Notice */}
              <div className="p-2.5 sm:p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-[10px] sm:text-[11px] text-emerald-300">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>Instant Guest Checkout active. No mandatory password or account needed!</span>
              </div>

              <button
                onClick={() => setIsCheckingOut(true)}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-[#ff7a1a] hover:bg-[#ffb68e] text-slate-950 py-3 sm:py-4 rounded-xl font-extrabold text-xs sm:text-sm shadow-xl transition-all cursor-pointer uppercase tracking-wider font-mono"
              >
                <span>Proceed To Guest Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
