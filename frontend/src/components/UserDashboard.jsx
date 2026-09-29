import React, { useState, useEffect, useRef } from 'react';
import { 
  X, User, Box, Car, Heart, Bell, Navigation, MessageSquare, Settings, 
  Clock, CheckCircle, CheckCircle2, AlertCircle, Truck, PackageCheck, Phone, MessageCircle, 
  ExternalLink, Search, Plus, Trash2, ShieldCheck, ChevronRight, Filter, Sparkles,
  ArrowUpRight, RefreshCw, Layers, Wrench, Check, LogOut, Send, Bot, Mail
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function UserDashboard({ 
  isOpen, 
  onClose,
  userRequests = [],
  savedVehicles = [],
  wishlistParts = [],
  notifications = [],
  userProfile = { name: '', email: '', phone: '', city: '' },
  activeVehicleFilter,
  onAddVehicle,
  onRemoveVehicle,
  onSelectActiveVehicleFilter,
  onRequestItem,
  onReserveItem,
  onRemoveWishlist,
  onUpdateProfile,
  onOpenCatalog,
  currentUser,
  authToken,
  onOpenAuth,
  onLogout,
  onBackToShop
}) {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('userDashboardActiveTab') || 'overview'); // 'overview' | 'requests' | 'vehicles' | 'wishlist' | 'notifications' | 'tracking' | 'chat' | 'contact' | 'profile'
  const [trackingSearchInput, setTrackingSearchInput] = useState('');
  const [searchedTrackingResult, setSearchedTrackingResult] = useState(null);
  
  // Persist User Dashboard activeTab across browser refreshes
  useEffect(() => {
    localStorage.setItem('userDashboardActiveTab', activeTab);
  }, [activeTab]);

  // New Vehicle Modal State
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehCategory, setNewVehCategory] = useState('Type 1 (Beetle)');
  const [newVehModel, setNewVehModel] = useState('Beetle 1968–1979');
  const [newVehEngine, setNewVehEngine] = useState('1600cc');

  // In-App Chat State with Master Admin
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInputText, setChatInputText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatScrollContainerRef = useRef(null);

  // Unread Admin messages count
  const unreadAdminCount = (chatMessages || []).filter(m => m && m.senderRole === 'ADMIN' && !m.isRead).length;

  // Auto-scroll chat box container ONLY (never scrolls main page)
  const scrollToChatBottom = (smooth = true) => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Fetch messages from backend or localStorage fallback
  const fetchUserChatMessages = async () => {
    if (!currentUser) return;
    const localKey = `chat_user_${currentUser.id || currentUser.email || 'default'}`;
    const localSaved = JSON.parse(localStorage.getItem(localKey) || '[]');

    // Show cached messages immediately
    if (localSaved.length > 0 && chatMessages.length === 0) {
      setChatMessages(localSaved);
    }

    const activeToken = authToken || localStorage.getItem('authToken');
    const queryParams = new URLSearchParams({
      userId: currentUser.id || '',
      userName: currentUser.name || userProfile?.name || 'Restorer Member',
      userEmail: currentUser.email || userProfile?.email || ''
    }).toString();

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/messages?${queryParams}`, {
        headers: {
          ...(activeToken ? { 'Authorization': `Bearer ${activeToken}` } : {})
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        if (data.data.length > 0) {
          setChatMessages(data.data);
          localStorage.setItem(localKey, JSON.stringify(data.data));
          return;
        }
      }
    } catch (err) {
      console.warn('Live chat API offline, reading local history:', err.message);
    }

    if (localSaved.length > 0) {
      setChatMessages(localSaved);
    } else {
      // Default welcome message from Admin
      const initialWelcome = [
        {
          id: 'msg-welcome-01',
          userId: currentUser.id,
          senderRole: 'ADMIN',
          senderName: 'Master Admin Engineer',
          message: `Hello ${currentUser.name || 'Restorer'}! Welcome to Classic Aircooled VW Works. I am the lead engine specialist on duty. How can I assist with your build, casting codes, or parts today?`,
          createdAt: new Date().toISOString()
        }
      ];
      setChatMessages(initialWelcome);
      localStorage.setItem(localKey, JSON.stringify(initialWelcome));
    }
  };

  useEffect(() => {
    fetchUserChatMessages();
  }, [currentUser, authToken]);

  // Polling for new Admin replies without interrupting mouse scrolling
  useEffect(() => {
    if (activeTab === 'chat' || activeTab === 'contact') {
      setTimeout(() => scrollToChatBottom(false), 80);
      const interval = setInterval(() => {
        fetchUserChatMessages();
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [activeTab, currentUser]);

  const handleSendChatMessage = async (presetText) => {
    const textToSend = presetText || chatInputText;
    if (!textToSend || !textToSend.trim() || !currentUser) return;

    const trimmedMsg = textToSend.trim();
    setChatInputText('');
    setIsSendingMessage(true);

    const tempMsg = {
      id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser.id || 'user-default',
      userName: currentUser.name || userProfile?.name || 'Restorer Member',
      userEmail: currentUser.email || userProfile?.email || '',
      senderRole: 'USER',
      senderName: currentUser.name || userProfile?.name || 'Restorer',
      message: trimmedMsg,
      createdAt: new Date().toISOString()
    };

    // Optimistic UI update
    setChatMessages(prev => [...prev, tempMsg]);
    const localKey = `chat_user_${currentUser.id || currentUser.email || 'default'}`;
    const currentList = JSON.parse(localStorage.getItem(localKey) || '[]');
    localStorage.setItem(localKey, JSON.stringify([...currentList, tempMsg]));

    const activeToken = authToken || localStorage.getItem('authToken');
    try {
      await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { 'Authorization': `Bearer ${activeToken}` } : {})
        },
        body: JSON.stringify({
          message: trimmedMsg,
          userId: currentUser.id || 'user-default',
          userName: currentUser.name || userProfile?.name || 'Restorer Member',
          userEmail: currentUser.email || userProfile?.email || ''
        })
      });
      fetchUserChatMessages();
    } catch (err) {
      console.warn('Message queued locally:', err.message);
    }

    setIsSendingMessage(false);
    setTimeout(() => scrollToChatBottom(true), 60);
  };

  // Contact Form State
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSentToast, setContactSentToast] = useState(false);

  if (!isOpen) return null;

  // Login Required Guard Check
  if (!currentUser) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 font-technical-data">
        <div className="max-w-md mx-auto bg-[#181719] border border-[#584236]/60 p-8 rounded-xs text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-[#ff7a1a]/20 border border-[#ff7a1a]/40 rounded-full flex items-center justify-center mx-auto text-[#ff7a1a]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider font-h2">Access Restricted</h2>
            <p className="text-xs text-[#a78b7d] mt-2 leading-relaxed">
              You must log in or register an account before accessing your Restorer Dashboard, saved vehicles, and request history.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={onOpenAuth}
              className="w-full bg-[#ff7a1a] hover:bg-[#ffb68e] text-black font-bold py-3 text-xs uppercase tracking-wider transition-colors rounded-xs shadow-md"
            >
              Sign In / Register Now
            </button>
            <button
              onClick={onBackToShop || onClose}
              className="w-full bg-[#201f20] hover:bg-[#2a282a] text-[#e0c0b1] border border-[#584236]/40 py-2.5 text-xs uppercase font-bold tracking-wider transition-colors rounded-xs"
            >
              ← Return to Parts Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe Stats Calculations
  const activeRequestsCount = (userRequests || []).filter(r => r && (r.status === 'Pending' || r.status === 'Approved')).length;
  const reservedItemsCount = (userRequests || []).filter(r => r && r.status === 'Reserved').length;
  const completedOrdersCount = (userRequests || []).filter(r => r && r.status === 'Delivered').length;
  const savedVehiclesCount = (savedVehicles || []).length;

  const handleAddVehicleSubmit = (e) => {
    e.preventDefault();
    if (onAddVehicle) {
      onAddVehicle({
        id: `veh-${Date.now()}`,
        category: newVehCategory,
        model: newVehModel,
        engineSize: newVehEngine,
        addedAt: new Date().toLocaleDateString()
      });
    }
    setIsAddingVehicle(false);
  };

  const handleSearchTracking = (e) => {
    e.preventDefault();
    if (!trackingSearchInput.trim()) return;
    const match = userRequests.find(r => r.trackingId?.toLowerCase() === trackingSearchInput.trim().toLowerCase() || r.id?.toLowerCase() === trackingSearchInput.trim().toLowerCase());
    if (match) {
      setSearchedTrackingResult(match);
    } else {
      setSearchedTrackingResult({ error: 'No active shipment found matching this Tracking ID.' });
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold uppercase">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] font-mono font-bold uppercase">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'Reserved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[10px] font-mono font-bold uppercase">
            <ShieldCheck className="w-3 h-3" /> Item Reserved
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] font-mono font-bold uppercase">
            <Truck className="w-3 h-3" /> Shipped
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase">
            <PackageCheck className="w-3 h-3" /> Delivered
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-mono font-bold uppercase">
            {status || 'Submitted'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 font-technical-data select-none">
      
      {/* Full Page Header Navigation & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#584236]/30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToShop || onClose}
            className="min-h-[44px] flex items-center gap-2 bg-[#201f20] hover:bg-[#ff7a1a] text-[#e0c0b1] hover:text-black border border-[#584236]/60 px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-xs cursor-pointer shadow-sm"
          >
            ← Back to Shop
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase flex items-center gap-2 font-h2">
              <User className="w-5 h-5 text-[#ff7a1a]" />
              Restorer Dashboard & Garage
            </h1>
            <span className="text-[10px] text-[#a78b7d] uppercase tracking-widest block font-bold">
              Account Management & Order Tracking
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-white block">{currentUser.name || userProfile.name}</span>
            <span className="text-[10px] text-[#ff7a1a] font-mono block">{currentUser.email || userProfile.email}</span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="min-h-[44px] bg-red-600 hover:bg-red-700 text-white border border-red-500 px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all rounded-xs shadow-md cursor-pointer flex items-center gap-1.5"
              title="Sign Out of Your Restorer Account"
            >
              <LogOut className="w-4 h-4" />
              <span>SIGN OUT</span>
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Main Container */}
      <div className="w-full bg-[#131314] border border-[#584236]/40 rounded-md shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[75vh]">

        {/* 1. LEFT SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-[#181719] border-b md:border-b-0 md:border-r border-[#262426] flex flex-col justify-between shrink-0 p-4 overflow-y-auto">
          
          <div className="space-y-4 sm:space-y-6">
            {/* User Profile Header */}
            <div className="flex items-center gap-3 p-3 bg-[#201f20] border border-[#584236]/40 rounded-xs">
              <div className="w-10 h-10 rounded-full bg-[#ff7a1a] flex items-center justify-center text-black font-bold text-base shadow-md shrink-0">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-xs font-bold text-white line-clamp-1">{userProfile.name}</h3>
                <span className="text-[10px] text-[#ff7a1a] font-mono font-bold block uppercase tracking-wider">
                  VW RESTORER MEMBER
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="grid grid-cols-2 md:grid-cols-1 gap-1.5 md:gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`min-h-[44px] w-full flex items-center gap-2.5 sm:gap-3 px-3 py-2.5 rounded-xs text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  activeTab === 'overview' ? 'bg-[#ff7a1a] text-black shadow-sm' : 'text-[#a78b7d] hover:text-white hover:bg-[#201f20]'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span className="truncate">Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('requests')}
                className={`min-h-[44px] w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  activeTab === 'requests' ? 'bg-[#ff7a1a] text-black shadow-sm' : 'text-[#a78b7d] hover:text-white hover:bg-[#201f20]'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 truncate">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span className="truncate">Requests</span>
                </div>
                {userRequests.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 font-bold rounded-full ml-1 shrink-0 ${activeTab === 'requests' ? 'bg-black text-[#ff7a1a]' : 'bg-[#201f20] text-[#a78b7d]'}`}>
                    {userRequests.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('vehicles')}
                className={`min-h-[44px] w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  activeTab === 'vehicles' ? 'bg-[#ff7a1a] text-black shadow-sm' : 'text-[#a78b7d] hover:text-white hover:bg-[#201f20]'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 truncate">
                  <Car className="w-4 h-4 shrink-0" />
                  <span className="truncate">Vehicles</span>
                </div>
                {savedVehicles.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 font-bold rounded-full ml-1 shrink-0 ${activeTab === 'vehicles' ? 'bg-black text-[#ff7a1a]' : 'bg-[#201f20] text-[#a78b7d]'}`}>
                    {savedVehicles.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`min-h-[44px] w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  activeTab === 'wishlist' ? 'bg-[#ff7a1a] text-black shadow-sm' : 'text-[#a78b7d] hover:text-white hover:bg-[#201f20]'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 truncate">
                  <Heart className="w-4 h-4 shrink-0" />
                  <span className="truncate">Wishlist</span>
                </div>
                {wishlistParts.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 font-bold rounded-full ml-1 shrink-0 ${activeTab === 'wishlist' ? 'bg-black text-[#ff7a1a]' : 'bg-[#201f20] text-[#a78b7d]'}`}>
                    {wishlistParts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`min-h-[44px] w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  activeTab === 'notifications' ? 'bg-[#ff7a1a] text-black shadow-sm' : 'text-[#a78b7d] hover:text-white hover:bg-[#201f20]'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 truncate">
                  <Bell className="w-4 h-4 shrink-0" />
                  <span className="truncate">Notifications</span>
                </div>
                {notifications.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 font-bold rounded-full ml-1 shrink-0 ${activeTab === 'notifications' ? 'bg-black text-[#ff7a1a]' : 'bg-[#201f20] text-[#a78b7d]'}`}>
                    {notifications.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('tracking')}
                className={`min-h-[44px] w-full flex items-center gap-2.5 sm:gap-3 px-3 py-2.5 rounded-xs text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  activeTab === 'tracking' ? 'bg-[#ff7a1a] text-black shadow-sm' : 'text-[#a78b7d] hover:text-white hover:bg-[#201f20]'
                }`}
              >
                <Navigation className="w-4 h-4 shrink-0" />
                <span className="truncate">Track Order</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('contact');
                }}
                className={`min-h-[44px] w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  activeTab === 'contact' || activeTab === 'chat' ? 'bg-[#ff7a1a] text-black shadow-sm' : 'text-[#a78b7d] hover:text-white hover:bg-[#201f20]'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 truncate">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">Contact Specialist</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE
                </span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`min-h-[44px] w-full flex items-center gap-2.5 sm:gap-3 px-3 py-2.5 rounded-xs text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  activeTab === 'profile' ? 'bg-[#ff7a1a] text-black shadow-sm' : 'text-[#a78b7d] hover:text-white hover:bg-[#201f20]'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span className="truncate">Profile & Settings</span>
              </button>
            </nav>
          </div>

        </aside>

        {/* 2. RIGHT WORKSPACE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Profile Welcome Header Banner */}
              <div className="p-6 bg-gradient-to-r from-[#201f20] via-[#1c1b1c] to-[#141416] border border-[#584236]/40 rounded-xs relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-[#ff7a1a] font-bold uppercase tracking-wider block mb-1">
                      USER DASHBOARD & GARAGE HUB
                    </span>
                    <h2 className="text-2xl font-bold text-white font-h2">
                      Welcome Back, {userProfile.name}!
                    </h2>
                    <p className="text-xs text-[#a78b7d] mt-1">
                      Manage your vintage VW spare part requests, reservations, saved vehicles, and order tracking.
                    </p>
                  </div>

                  <button
                    onClick={onOpenCatalog}
                    className="bg-[#ff7a1a] hover:bg-[#ffb68e] text-black font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-all flex items-center gap-1.5 shadow-md shrink-0"
                  >
                    <span>Browse Parts Catalog</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Active Requests */}
                <div 
                  onClick={() => setActiveTab('requests')}
                  className="p-4 bg-[#181719] border border-[#584236]/40 hover:border-[#ff7a1a] rounded-xs cursor-pointer transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between text-[#a78b7d] mb-2">
                    <span className="text-[11px] uppercase font-bold">Active Requests</span>
                    <Box className="w-4 h-4 text-[#ff7a1a]" />
                  </div>
                  <div className="text-2xl font-bold text-white">{activeRequestsCount}</div>
                  <span className="text-[10px] text-[#ff7a1a] mt-1 block">Pending & Approved</span>
                </div>

                {/* Card 2: Reserved Items */}
                <div 
                  onClick={() => setActiveTab('requests')}
                  className="p-4 bg-[#181719] border border-[#584236]/40 hover:border-[#ff7a1a] rounded-xs cursor-pointer transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between text-[#a78b7d] mb-2">
                    <span className="text-[11px] uppercase font-bold">Reserved Items</span>
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{reservedItemsCount}</div>
                  <span className="text-[10px] text-purple-400 mt-1 block">Held in Stock for You</span>
                </div>

                {/* Card 3: Completed Orders */}
                <div 
                  onClick={() => setActiveTab('requests')}
                  className="p-4 bg-[#181719] border border-[#584236]/40 hover:border-[#ff7a1a] rounded-xs cursor-pointer transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between text-[#a78b7d] mb-2">
                    <span className="text-[11px] uppercase font-bold">Completed</span>
                    <PackageCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{completedOrdersCount}</div>
                  <span className="text-[10px] text-emerald-400 mt-1 block">Delivered Restoration Parts</span>
                </div>

                {/* Card 4: Saved Vehicles */}
                <div 
                  onClick={() => setActiveTab('vehicles')}
                  className="p-4 bg-[#181719] border border-[#584236]/40 hover:border-[#ff7a1a] rounded-xs cursor-pointer transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between text-[#a78b7d] mb-2">
                    <span className="text-[11px] uppercase font-bold">Saved Vehicles</span>
                    <Car className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{savedVehiclesCount}</div>
                  <span className="text-[10px] text-cyan-400 mt-1 block">Auto-Filtering Catalog</span>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="p-6 bg-[#181719] border border-[#584236]/40 rounded-xs space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#ff7a1a]" />
                  <span>Recent Request & Reservation Activity</span>
                </h3>

                {userRequests.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[#584236]/40 rounded-xs text-[#a78b7d] text-xs">
                    No recent item requests yet. Browse the catalog to request or reserve vintage VW parts!
                  </div>
                ) : (
                  <div className="divide-y divide-[#262426]">
                    {userRequests.slice(0, 5).map((req) => (
                      <div key={req.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {req.partImage ? (
                            <img src={req.partImage} alt={req.partTitle} className="w-10 h-10 object-cover rounded-xs border border-[#3a383a]" />
                          ) : (
                            <div className="w-10 h-10 bg-[#201f20] border border-[#3a383a] flex items-center justify-center text-[#ff7a1a]">
                              <Box className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <h4 className="text-xs font-bold text-white line-clamp-1">{req.partTitle}</h4>
                            <span className="text-[10px] text-[#a78b7d] block">
                              Requested on {req.date || 'Today'} • Price: ${req.price}
                            </span>
                          </div>
                        </div>

                        {renderStatusBadge(req.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: MY REQUESTS (REPLACES MY ORDERS) */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#262426] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                    My Item Requests & Reservations
                  </h2>
                  <p className="text-xs text-[#a78b7d] mt-0.5">
                    Track item approval, status updates, reservations, and direct seller contact.
                  </p>
                </div>

                <span className="text-xs text-[#ff7a1a] font-bold bg-[#201f20] px-3 py-1.5 border border-[#584236]/40 rounded-xs">
                  {userRequests.length} Total Entries
                </span>
              </div>

              {userRequests.length === 0 ? (
                <div className="p-12 text-center bg-[#181719] border border-dashed border-[#584236]/50 rounded-xs space-y-4">
                  <Box className="w-12 h-12 text-[#ff7a1a] mx-auto opacity-75" />
                  <h3 className="text-base font-bold text-white">No Active Requests Found</h3>
                  <p className="text-xs text-[#a78b7d] max-w-md mx-auto">
                    You haven't requested or reserved any vintage automotive parts yet. Select any item from our catalog to submit a request!
                  </p>
                  <button
                    onClick={onOpenCatalog}
                    className="bg-[#ff7a1a] hover:bg-[#ffb68e] text-black font-bold text-xs uppercase px-5 py-2.5 rounded-xs transition-all inline-flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" /> Browse Parts Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userRequests.map((req) => (
                    <div key={req.id} className="p-5 bg-[#181719] border border-[#584236]/40 hover:border-[#ff7a1a]/60 rounded-xs transition-all space-y-4">
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#262426] pb-4">
                        <div className="flex items-center gap-4">
                          {req.partImage ? (
                            <img src={req.partImage} alt={req.partTitle} className="w-16 h-16 object-cover rounded-xs border border-[#3a383a]" />
                          ) : (
                            <div className="w-16 h-16 bg-[#201f20] border border-[#3a383a] flex items-center justify-center text-[#ff7a1a]">
                              <Box className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] text-[#ff7a1a] font-bold block uppercase tracking-wider">
                              Request ID: #{req.id} • SKU: {req.sku || 'N/A'}
                            </span>
                            <h3 className="text-base font-bold text-white">{req.partTitle}</h3>
                            <span className="text-xs text-[#a78b7d] block mt-0.5">
                              Compatibility: <strong className="text-white">{req.compatibility || 'VW Beetle / Bus'}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {renderStatusBadge(req.status)}
                          <span className="text-xs text-green-400 font-bold mt-1">${req.price}</span>
                        </div>
                      </div>

                      {/* Timeline status indicator */}
                      <div className="grid grid-cols-5 gap-1 pt-2">
                        {['Pending', 'Approved', 'Reserved', 'Shipped', 'Delivered'].map((stepName, idx) => {
                          const statusOrder = ['Pending', 'Approved', 'Reserved', 'Shipped', 'Delivered'];
                          const currentIdx = statusOrder.indexOf(req.status || 'Pending');
                          const isComplete = idx <= currentIdx;
                          return (
                            <div key={stepName} className="text-center space-y-1">
                              <div className={`h-1.5 rounded-full transition-all ${isComplete ? 'bg-[#ff7a1a]' : 'bg-[#262426]'}`} />
                              <span className={`text-[9px] block uppercase font-bold ${isComplete ? 'text-[#ff7a1a]' : 'text-zinc-600'}`}>
                                {stepName}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Submission Date */}
                      <div className="pt-3 border-t border-[#262426] flex items-center justify-between text-[11px] text-[#a78b7d]">
                        <span>Submitted on <strong className="text-white">{req.date || 'Today'}</strong></span>
                        <span className="text-[#ff7a1a] font-mono font-bold">Request #{req.id || 'N/A'}</span>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY VEHICLES (SMART GARAGE FILTER SYSTEM) */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#262426] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                    My Saved Vehicles (Garage Filter System)
                  </h2>
                  <p className="text-xs text-[#a78b7d] mt-0.5">
                    Save your classic VW cars to automatically filter compatible parts on the storefront catalog!
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingVehicle(true)}
                  className="bg-[#ff7a1a] hover:bg-[#ffb68e] text-black text-xs font-bold uppercase px-4 py-2 rounded-xs transition-all flex items-center gap-1.5 shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Vehicle
                </button>
              </div>

              {/* Add Vehicle Modal Drawer */}
              {isAddingVehicle && (
                <form onSubmit={handleAddVehicleSubmit} className="p-5 bg-[#181719] border border-[#ff7a1a] rounded-xs space-y-4 animate-in fade-in duration-200">
                  <h3 className="text-sm font-bold text-[#ff7a1a] uppercase tracking-wider flex items-center gap-2">
                    <Car className="w-4 h-4" /> Add New Vehicle to Your Garage
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] text-[#a78b7d] uppercase font-bold block mb-1">Vehicle Category</label>
                      <select
                        value={newVehCategory}
                        onChange={(e) => setNewVehCategory(e.target.value)}
                        className="w-full bg-[#131314] border border-[#584236]/60 p-2.5 text-xs text-white rounded-xs focus:outline-none focus:border-[#ff7a1a]"
                      >
                        <option value="Type 1 (Beetle)">Type 1 (Beetle)</option>
                        <option value="Type 2 (Bus / Van)">Type 2 (Bus / Van)</option>
                        <option value="Type 3 (Variant / Fastback)">Type 3 (Variant / Fastback)</option>
                        <option value="Type 14 (Karmann Ghia)">Type 14 (Karmann Ghia)</option>
                        <option value="Type 181 (Thing)">Type 181 (Thing)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#a78b7d] uppercase font-bold block mb-1">Model / Year Range</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Beetle 1968–1979"
                        value={newVehModel}
                        onChange={(e) => setNewVehModel(e.target.value)}
                        className="w-full bg-[#131314] border border-[#584236]/60 p-2.5 text-xs text-white rounded-xs focus:outline-none focus:border-[#ff7a1a]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-[#a78b7d] uppercase font-bold block mb-1">Engine Size</label>
                      <select
                        value={newVehEngine}
                        onChange={(e) => setNewVehEngine(e.target.value)}
                        className="w-full bg-[#131314] border border-[#584236]/60 p-2.5 text-xs text-white rounded-xs focus:outline-none focus:border-[#ff7a1a]"
                      >
                        <option value="1200cc">1200cc</option>
                        <option value="1300cc">1300cc</option>
                        <option value="1500cc">1500cc</option>
                        <option value="1600cc">1600cc</option>
                        <option value="1776cc">1776cc</option>
                        <option value="1914cc">1914cc</option>
                        <option value="2110cc">2110cc</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingVehicle(false)}
                      className="px-4 py-2 bg-[#201f20] text-[#a78b7d] text-xs font-bold uppercase rounded-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#ff7a1a] text-black text-xs font-bold uppercase rounded-xs"
                    >
                      Save to My Garage
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Vehicles Cards */}
              {savedVehicles.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#584236]/40 rounded-xs text-[#a78b7d] text-xs">
                  No vehicles saved yet. Add your Beetle or Bus to automatically highlight compatible parts on the landing page!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedVehicles.map((veh) => {
                    const isFilterActive = activeVehicleFilter === veh.model || activeVehicleFilter === veh.category;
                    return (
                      <div 
                        key={veh.id} 
                        className={`p-5 bg-[#181719] border transition-all rounded-xs flex items-center justify-between gap-4 ${
                          isFilterActive ? 'border-[#ff7a1a] shadow-[0_0_15px_rgba(255,122,26,0.3)]' : 'border-[#584236]/40'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#201f20] border border-[#ff7a1a]/40 rounded-xs flex items-center justify-center text-[#ff7a1a]">
                            <Car className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[10px] text-[#ff7a1a] font-bold block uppercase">
                              {veh.category}
                            </span>
                            <h4 className="text-base font-bold text-white">{veh.model}</h4>
                            <span className="text-xs text-[#a78b7d] block mt-0.5">
                              Engine: <strong className="text-white">{veh.engineSize || '1600cc'}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => onSelectActiveVehicleFilter(isFilterActive ? 'ALL' : veh.model)}
                            className={`text-xs px-3 py-1.5 rounded-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                              isFilterActive
                                ? 'bg-[#ff7a1a] text-black'
                          : 'bg-[#201f20] text-[#e0c0b1] border border-[#584236]/60 hover:border-[#ff7a1a]'
                            }`}
                          >
                            {isFilterActive ? <Check className="w-3.5 h-3.5" /> : <Filter className="w-3.5 h-3.5" />}
                            <span>{isFilterActive ? 'Active Filter' : 'Filter Catalog'}</span>
                          </button>

                          <button
                            onClick={() => onRemoveVehicle(veh.id)}
                            className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED PARTS / WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div className="border-b border-[#262426] pb-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  Saved Parts & Garage Wishlist
                </h2>
                <p className="text-xs text-[#a78b7d] mt-0.5">
                  Request item availability, reserve parts, or contact the seller directly.
                </p>
              </div>

              {wishlistParts.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#584236]/40 rounded-xs text-[#a78b7d] text-xs">
                  Your saved parts list is empty. Click the heart icon on any part card in the catalog to save it here!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlistParts.map((part) => (
                    <div key={part.id} className="p-4 bg-[#181719] border border-[#584236]/40 rounded-xs flex flex-col justify-between space-y-4">
                      <div>
                        <div className="h-40 bg-[#0e0e0f] rounded-xs mb-3 overflow-hidden border border-[#3a383a]">
                          <img src={part.image} alt={part.title} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] text-[#ff7a1a] font-bold block uppercase">
                          SKU: {part.sku || 'N/A'}
                        </span>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{part.title}</h4>
                        <span className="text-xs text-green-400 font-bold block mt-1">${part.price}</span>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-[#262426]">
                        <button
                          onClick={() => onRequestItem(part)}
                          className="w-full bg-[#ff7a1a] hover:bg-[#ffb68e] text-black text-xs font-bold py-2 rounded-xs uppercase tracking-wider transition-all"
                        >
                          Request Item
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => onReserveItem(part)}
                            className="flex-1 bg-[#201f20] hover:bg-[#353436] text-[#e0c0b1] border border-[#584236]/60 text-xs font-bold py-1.5 rounded-xs uppercase"
                          >
                            Reserve
                          </button>
                          <button
                            onClick={() => onRemoveWishlist(part.id)}
                            className="px-3 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-black border border-red-500/40 text-xs rounded-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-[#262426] pb-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  Real-Time Notifications
                </h2>
                <p className="text-xs text-[#a78b7d] mt-0.5">
                  Live approval notifications, reservation confirmations, and shipment updates.
                </p>
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#584236]/40 rounded-xs text-[#a78b7d] text-xs">
                  No new notifications at this time. Updates on your item requests will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n, i) => (
                    <div key={i} className="p-4 bg-[#181719] border border-[#584236]/40 rounded-xs flex items-start gap-3">
                      <div className="p-2 bg-[#ff7a1a]/20 text-[#ff7a1a] rounded-xs shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{n.title || 'Request Update'}</h4>
                          <span className="text-[10px] text-[#a78b7d]">{n.timestamp || 'Just now'}</span>
                        </div>
                        <p className="text-xs text-[#a78b7d] mt-1">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TRACKING SECTION */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div className="border-b border-[#262426] pb-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  Shipment & Order Tracking
                </h2>
                <p className="text-xs text-[#a78b7d] mt-0.5">
                  Enter your assigned Tracking ID or view live status for shipped restoration parts.
                </p>
              </div>

              {/* Tracking ID Search Form */}
              <form onSubmit={handleSearchTracking} className="p-5 bg-[#181719] border border-[#584236]/40 rounded-xs space-y-4">
                <label className="text-xs text-[#ff7a1a] font-bold uppercase block">
                  Track Your Shipment
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Tracking ID (e.g. TRK-983421)..."
                    value={trackingSearchInput}
                    onChange={(e) => setTrackingSearchInput(e.target.value)}
                    className="flex-1 bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white rounded-xs focus:outline-none focus:border-[#ff7a1a]"
                  />
                  <button
                    type="submit"
                    className="bg-[#ff7a1a] hover:bg-[#ffb68e] text-black font-bold text-xs uppercase px-6 py-3 rounded-xs transition-all flex items-center gap-1.5"
                  >
                    <Search className="w-4 h-4" /> Track Now
                  </button>
                </div>
              </form>

              {/* Search Result Box */}
              {searchedTrackingResult && (
                <div className="p-5 bg-[#181719] border border-[#ff7a1a] rounded-xs space-y-3">
                  {searchedTrackingResult.error ? (
                    <p className="text-xs text-red-400 font-bold">{searchedTrackingResult.error}</p>
                  ) : (
                    <div>
                      <span className="text-[10px] text-[#ff7a1a] font-bold uppercase block">Matching Shipment</span>
                      <h4 className="text-sm font-bold text-white">{searchedTrackingResult.partTitle}</h4>
                      <p className="text-xs text-[#a78b7d] mt-1">Status: <strong className="text-cyan-400">{searchedTrackingResult.status}</strong></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: CONTACT SPECIALIST & LIVE CHAT */}
          {(activeTab === 'chat' || activeTab === 'contact') && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="border-b border-[#262426] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight font-h2">
                      Specialist Engineering Desk
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      MOBILE DISPATCH ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-[#a78b7d] mt-1">
                    Direct live messaging with our Lead Aircooled VW Specialist. When you send a message here, it alerts our engineer's mobile phone instantly so we can reply to you directly.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#a78b7d] bg-[#181719] px-3 py-1.5 rounded-xs border border-[#584236]/40 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-[#ff7a1a]" />
                  <span>Avg Response: &lt; 5 mins</span>
                </div>
              </div>

              {/* Connected User Notification Banner */}
              <div className="p-3.5 bg-[#1a191b] border border-[#584236]/50 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#ff7a1a]/20 border border-[#ff7a1a]/40 text-[#ff7a1a] flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-white font-bold block">Connected as {currentUser.name || userProfile.name}</span>
                    <span className="text-[11px] text-[#a78b7d] font-mono">{currentUser.email || userProfile.email}</span>
                  </div>
                </div>
                <div className="text-[11px] text-[#ff7a1a] font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff7a1a] animate-ping"></span>
                  <span>Direct Mobile Chat Connected</span>
                </div>
              </div>

              {/* Embedded Tawk.to Live Chat Container */}
              <div className="bg-[#141416] border border-[#584236]/60 rounded-xs overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-220px)] min-h-[580px] max-h-[720px]">
                <iframe
                  src="https://tawk.to/chat/6abbacbfa6a44b3446f189f6/default"
                  title="Contact Specialist Live Mobile Chat"
                  className="w-full h-full border-0 rounded-xs bg-[#141416]"
                  allow="microphone; camera; clipboard-write; autoplay"
                />
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-4 bg-[#181719] border border-[#584236]/40 rounded-xs space-y-1">
                  <span className="text-[10px] text-[#ff7a1a] font-bold uppercase font-mono block">📱 Phone App Alerts</span>
                  <h4 className="text-xs font-bold text-white">Instant Specialist Push Notifications</h4>
                  <p className="text-[11px] text-[#a78b7d]">Your messages ping our lead builder's mobile phone wherever they are.</p>
                </div>

                <div className="p-4 bg-[#181719] border border-[#584236]/40 rounded-xs space-y-1">
                  <span className="text-[10px] text-[#ff7a1a] font-bold uppercase font-mono block">💬 Preserved History</span>
                  <h4 className="text-xs font-bold text-white">Saved In Your Account</h4>
                  <p className="text-[11px] text-[#a78b7d]">Revisit engine specifications, part quotes, and restoration advice anytime.</p>
                </div>

                <div className="p-4 bg-[#181719] border border-[#584236]/40 rounded-xs space-y-1">
                  <span className="text-[10px] text-[#ff7a1a] font-bold uppercase font-mono block">🛠️ Direct Workshop Hours</span>
                  <h4 className="text-xs font-bold text-white">Mon – Sat: 8am – 6pm EST</h4>
                  <p className="text-[11px] text-[#a78b7d]">Engineering assistance for Type 1, Type 2, Type 3, and Karmann Ghia builds.</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="border-b border-[#262426] pb-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                  Profile & Account Settings
                </h2>
                <p className="text-xs text-[#a78b7d] mt-0.5">
                  Update your contact details and preferred delivery information.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); if (onUpdateProfile) onUpdateProfile(userProfile); }} className="p-6 bg-[#181719] border border-[#584236]/40 rounded-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-[#a78b7d] uppercase font-bold block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => onUpdateProfile && onUpdateProfile({ ...userProfile, name: e.target.value })}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-2.5 text-xs text-white rounded-xs focus:outline-none focus:border-[#ff7a1a]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#a78b7d] uppercase font-bold block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => onUpdateProfile && onUpdateProfile({ ...userProfile, email: e.target.value })}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-2.5 text-xs text-white rounded-xs focus:outline-none focus:border-[#ff7a1a]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#a78b7d] uppercase font-bold block mb-1">Phone Number (For Shipment Alerts)</label>
                    <input
                      type="text"
                      value={userProfile.phone}
                      onChange={(e) => onUpdateProfile && onUpdateProfile({ ...userProfile, phone: e.target.value })}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-2.5 text-xs text-white rounded-xs focus:outline-none focus:border-[#ff7a1a]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#a78b7d] uppercase font-bold block mb-1">City / Region</label>
                    <input
                      type="text"
                      value={userProfile.city}
                      onChange={(e) => onUpdateProfile && onUpdateProfile({ ...userProfile, city: e.target.value })}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-2.5 text-xs text-white rounded-xs focus:outline-none focus:border-[#ff7a1a]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#ff7a1a] hover:bg-[#ffb68e] text-black text-xs font-bold uppercase px-6 py-2.5 rounded-xs transition-all"
                  >
                    Save Profile Settings
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
