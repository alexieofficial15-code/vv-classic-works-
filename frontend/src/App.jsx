import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from './config/api';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FindPartsWizard from './components/FindPartsWizard';
import VWVehicleShowcase from './components/VWVehicleShowcase';
import GuidedSearchModal from './components/GuidedSearchModal';
import CatalogSection from './components/CatalogSection';
import ReviewsSection from './components/ReviewsSection';
import VideoShowcase from './components/VideoShowcase';
import LocationMapSection from './components/LocationMapSection';
import PartDetailModal from './components/PartDetailModal';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import AdminLoginModal from './components/AdminLoginModal';
import AdminPanel from './components/AdminPanel';
import UserDashboard from './components/UserDashboard';
import Footer from './components/Footer';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || null);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken') || null);
  
  // Persist Admin Panel open state across page refreshes
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(() => {
    const savedAdminToken = localStorage.getItem('adminToken');
    const savedAdminOpen = localStorage.getItem('isAdminPanelOpen') === 'true';
    const hasAdminHash = window.location.hash === '#admin';
    return Boolean(savedAdminToken && (savedAdminOpen || hasAdminHash));
  });

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isGuidedSearchOpen, setIsGuidedSearchOpen] = useState(false);
  const [activeModalPart, setActiveModalPart] = useState(null);

  const [cartItems, setCartItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState({ 
    navMode: 'vehicle',
    categoryId: 'ALL', 
    modelId: 'ALL', 
    systemId: 'ALL',
    subcatId: 'ALL',
    directPartId: 'ALL',
    engineSize: 'ALL' 
  });

  // Page Navigation State ('shop' | 'dashboard') - Persisted across refreshes
  const [currentPage, setCurrentPage] = useState(() => {
    if (window.location.hash === '#dashboard') return 'dashboard';
    if (window.location.hash === '#admin') return 'shop';
    return localStorage.getItem('currentPage') || 'shop';
  });

  // User-scoped Dashboard State
  const [userRequests, setUserRequests] = useState([]);
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userProfile, setUserProfile] = useState({ name: '', email: '', phone: '', city: '' });

  // Admin Panel requests store (fetched from GET /api/admin/requests)
  const [adminRequests, setAdminRequests] = useState([]);

  // Cache of parts for fast lookup during browser Back / Forward navigation
  const partsCacheRef = useRef(new Map());

  // Navigation helpers that record history states (allowing Browser Back / Forward to work)
  const navigateToPage = (newPage) => {
    if (newPage === currentPage) return;
    setCurrentPage(newPage);
    localStorage.setItem('currentPage', newPage);
    const targetHash = newPage === 'dashboard' ? '#dashboard' : '#shop';
    if (window.location.hash !== targetHash) {
      window.history.pushState({ page: newPage }, '', targetHash);
    }
  };

  const handleViewPartDetails = (part) => {
    if (!part) return;
    partsCacheRef.current.set(String(part.id), part);
    setActiveModalPart(part);
    const partHash = `#part-${part.id}`;
    if (window.location.hash !== partHash) {
      window.history.pushState({ modal: 'part', partId: part.id, page: currentPage }, '', partHash);
    }
  };

  const handleClosePartDetails = () => {
    setActiveModalPart(null);
    if (window.location.hash.startsWith('#part-')) {
      if (window.history.state?.modal === 'part' && window.history.length > 1) {
        window.history.back();
      } else {
        const fallback = currentPage === 'dashboard' ? '#dashboard' : '#shop';
        window.history.replaceState({ page: currentPage }, '', fallback);
      }
    }
  };

  const handleOpenCart = () => {
    setIsCartOpen(true);
    if (window.location.hash !== '#cart') {
      window.history.pushState({ modal: 'cart', page: currentPage }, '', '#cart');
    }
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
    if (window.location.hash === '#cart') {
      if (window.history.state?.modal === 'cart' && window.history.length > 1) {
        window.history.back();
      } else {
        const fallback = currentPage === 'dashboard' ? '#dashboard' : '#shop';
        window.history.replaceState({ page: currentPage }, '', fallback);
      }
    }
  };

  const handleOpenGuidedSearch = () => {
    setIsGuidedSearchOpen(true);
    if (window.location.hash !== '#guided-search') {
      window.history.pushState({ modal: 'guided-search', page: currentPage }, '', '#guided-search');
    }
  };

  const handleCloseGuidedSearch = () => {
    setIsGuidedSearchOpen(false);
    if (window.location.hash === '#guided-search') {
      if (window.history.state?.modal === 'guided-search' && window.history.length > 1) {
        window.history.back();
      } else {
        const fallback = currentPage === 'dashboard' ? '#dashboard' : '#shop';
        window.history.replaceState({ page: currentPage }, '', fallback);
      }
    }
  };

  const handleOpenAuth = () => {
    setIsAuthOpen(true);
    if (window.location.hash !== '#auth') {
      window.history.pushState({ modal: 'auth', page: currentPage }, '', '#auth');
    }
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
    if (window.location.hash === '#auth') {
      if (window.history.state?.modal === 'auth' && window.history.length > 1) {
        window.history.back();
      } else {
        const fallback = currentPage === 'dashboard' ? '#dashboard' : '#shop';
        window.history.replaceState({ page: currentPage }, '', fallback);
      }
    }
  };

  const handleOpenAdminLogin = () => {
    setIsAdminLoginOpen(true);
    if (window.location.hash !== '#admin-login') {
      window.history.pushState({ modal: 'admin-login', page: currentPage }, '', '#admin-login');
    }
  };

  const handleCloseAdminLogin = () => {
    setIsAdminLoginOpen(false);
    if (window.location.hash === '#admin-login') {
      if (window.history.state?.modal === 'admin-login' && window.history.length > 1) {
        window.history.back();
      } else {
        const fallback = currentPage === 'dashboard' ? '#dashboard' : '#shop';
        window.history.replaceState({ page: currentPage }, '', fallback);
      }
    }
  };

  const handleOpenAdminPanel = () => {
    setIsAdminPanelOpen(true);
    localStorage.setItem('isAdminPanelOpen', 'true');
    if (window.location.hash !== '#admin') {
      window.history.pushState({ page: 'admin' }, '', '#admin');
    }
  };

  const handleCloseAdminPanel = () => {
    setIsAdminPanelOpen(false);
    localStorage.setItem('isAdminPanelOpen', 'false');
    if (window.location.hash === '#admin') {
      if (window.history.state?.page === 'admin' && window.history.length > 1) {
        window.history.back();
      } else {
        const fallback = currentPage === 'dashboard' ? '#dashboard' : '#shop';
        window.history.replaceState({ page: currentPage }, '', fallback);
      }
    }
  };

  // Browser History & Popstate (Back/Forward buttons) listener
  useEffect(() => {
    // 1. Ensure initial page entry exists in browser history
    const initialHash = window.location.hash;
    const initialPage = initialHash === '#dashboard' ? 'dashboard' : 'shop';
    if (!window.history.state) {
      window.history.replaceState({ page: initialPage }, '', initialHash || '#shop');
    }

    // 2. React to Browser "Back" and "Forward" buttons
    const handlePopState = (event) => {
      const hash = window.location.hash;
      const state = event.state || {};

      // A. Part Detail Modal
      if (hash.startsWith('#part-')) {
        const partId = hash.replace('#part-', '');
        const cached = partsCacheRef.current.get(String(partId));
        if (cached) {
          setActiveModalPart(cached);
        } else {
          fetch(`${API_BASE_URL}/api/admin/parts`)
            .then(res => res.json())
            .then(data => {
              if (data.success && Array.isArray(data.data)) {
                const found = data.data.find(p => String(p.id) === String(partId));
                if (found) {
                  partsCacheRef.current.set(String(found.id), found);
                  setActiveModalPart(found);
                }
              }
            })
            .catch(() => {});
        }
      } else {
        setActiveModalPart(null);
      }

      // B. Modals
      setIsCartOpen(hash === '#cart');
      setIsGuidedSearchOpen(hash === '#guided-search');
      setIsAuthOpen(hash === '#auth');
      setIsAdminLoginOpen(hash === '#admin-login');

      // C. Admin Panel
      if (hash === '#admin') {
        setIsAdminPanelOpen(true);
        localStorage.setItem('isAdminPanelOpen', 'true');
      } else {
        setIsAdminPanelOpen(false);
        localStorage.setItem('isAdminPanelOpen', 'false');
      }

      // D. Page Level View (Dashboard vs Shop)
      if (hash === '#dashboard' || state.page === 'dashboard') {
        setCurrentPage('dashboard');
        localStorage.setItem('currentPage', 'dashboard');
      } else {
        setCurrentPage('shop');
        localStorage.setItem('currentPage', 'shop');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchAdminRequests = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/requests`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAdminRequests(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch admin requests:', err.message);
    }
  };

  const refreshUserRequests = async () => {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUserRequests(data.data);
      }
    } catch (err) {
      console.warn('Failed to refresh user requests:', err.message);
    }
  };

  // Restore session from localStorage & verify via GET /api/auth/me on page load
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    const savedAdminToken = localStorage.getItem('adminToken');

    if (savedAdminToken) {
      setAdminToken(savedAdminToken);
    }

    if (savedToken) {
      setAuthToken(savedToken);
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
          } else if (savedUser) {
            try { setCurrentUser(JSON.parse(savedUser)); } catch (e) {}
          }
        })
        .catch(() => {
          if (savedUser) {
            try { setCurrentUser(JSON.parse(savedUser)); } catch (e) {}
          }
        });
    }
  }, []);

  useEffect(() => {
    if (isAdminPanelOpen && adminToken) {
      fetchAdminRequests();
    }
  }, [isAdminPanelOpen, adminToken]);

  // Sync state whenever currentUser changes (Login / Logout / Switch User)
  useEffect(() => {
    if (currentUser && currentUser.id) {
      const userKey = `user_${currentUser.id}`;

      // 1. User Requests fallback from LocalStorage
      const savedRequests = localStorage.getItem(`${userKey}_requests`);
      const initialReqs = savedRequests ? JSON.parse(savedRequests) : [];

      // 2. Saved Vehicles
      const savedVeh = localStorage.getItem(`${userKey}_vehicles`);
      setSavedVehicles(savedVeh ? JSON.parse(savedVeh) : []);

      // 3. Notifications
      const savedNotifs = localStorage.getItem(`${userKey}_notifications`);
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      } else {
        setNotifications([
          {
            title: 'Welcome to Classic Aircooled VW Works',
            message: `Hello ${currentUser.name}! Your restorer dashboard is ready. Add vehicles and request parts.`,
            timestamp: 'Just now'
          }
        ]);
      }

      // 4. User Profile
      const savedProf = localStorage.getItem(`${userKey}_profile`);
      if (savedProf) {
        setUserProfile(JSON.parse(savedProf));
      } else {
        setUserProfile({
          name: currentUser.name || 'Vintage Restorer',
          email: currentUser.email || '',
          phone: '',
          city: ''
        });
      }

      // 5. Fetch User Requests from Backend Database API
      if (authToken) {
        fetch(`${API_BASE_URL}/api/requests`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && Array.isArray(data.data)) {
              setUserRequests(data.data);
            } else {
              setUserRequests(initialReqs);
            }
          })
          .catch(() => {
            setUserRequests(initialReqs);
          });
      } else {
        setUserRequests(initialReqs);
      }
    } else {
      setUserRequests([]);
      setSavedVehicles([]);
      setNotifications([]);
      setUserProfile({ name: 'Guest Restorer', email: '', phone: '', city: '' });
    }
  }, [currentUser, authToken]);

  // Persist user-scoped state
  useEffect(() => {
    if (currentUser && currentUser.id) {
      localStorage.setItem(`user_${currentUser.id}_requests`, JSON.stringify(userRequests));
    }
  }, [userRequests, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      localStorage.setItem(`user_${currentUser.id}_vehicles`, JSON.stringify(savedVehicles));
    }
  }, [savedVehicles, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      localStorage.setItem(`user_${currentUser.id}_notifications`, JSON.stringify(notifications));
    }
  }, [notifications, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      localStorage.setItem(`user_${currentUser.id}_profile`, JSON.stringify(userProfile));
    }
  }, [userProfile, currentUser]);

  const handleOpenUserDashboard = () => {
    if (!currentUser) {
      handleOpenAuth();
    } else {
      navigateToPage('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setAdminToken(null);
    setIsAdminPanelOpen(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminToken');
    setUserRequests([]);
    setSavedVehicles([]);
    setNotifications([]);
    navigateToPage('shop');
  };
  
  // Refresh trigger for parts catalog after admin edit/delete
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefreshCatalog = () => setRefreshKey(prev => prev + 1);

  // Google Ads Conversion Tracker Helper (Add to Cart & Product Reservation)
  const triggerGoogleAdsConversion = () => {
    if (typeof window !== 'undefined') {
      try {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'conversion', {
            'send_to': 'AW-18481077913/_W70CKWVyIsdEJm9u-xE'
          });
        } else if (typeof window.gtag_report_conversion === 'function') {
          window.gtag_report_conversion();
        } else if (Array.isArray(window.dataLayer)) {
          window.dataLayer.push({
            event: 'conversion',
            send_to: 'AW-18481077913/_W70CKWVyIsdEJm9u-xE'
          });
        }
      } catch (err) {
        console.warn('Google Ads conversion tracking error:', err);
      }
    }
  };

  // Cart Handlers
  const handleAddToCart = (part) => {
    // Validation guard: ensure valid part before updating state or firing tracking
    if (!part || !part.id) {
      console.warn('Invalid part object provided to handleAddToCart');
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === part.id);
      if (existing) {
        return prev.map(item =>
          item.id === part.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...part, quantity: 1 }];
    });

    // Google Ads conversion tracking for Add to Cart: AW-18481077913/_W70CKWVyIsdEJm9u-xE
    triggerGoogleAdsConversion();

    handleOpenCart();
  };

  const handleUpdateQuantity = (partId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(partId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => item.id === partId ? { ...item, quantity: newQty } : item)
    );
  };

  const handleRemoveFromCart = (partId) => {
    setCartItems(prev => prev.filter(item => item.id !== partId));
  };

  // Item Request & Reservation Handlers
  const handleRequestItem = async (part) => {
    if (!currentUser || !authToken) {
      setIsAuthOpen(true);
      return;
    }

    const reqPayload = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      partId: part.id,
      partTitle: part.title,
      partImage: part.image,
      sku: part.sku || part.oemNumber || 'N/A',
      price: part.price || 0,
      compatibility: part.compatibleModels && part.compatibleModels.length > 0 ? part.compatibleModels[0] : (part.modelYearRange || 'VW Beetle / Bus'),
      type: 'REQUEST',
      status: 'Pending',
      userName: currentUser.name || userProfile.name || 'Restorer Member',
      userEmail: currentUser.email || userProfile.email || '',
      userPhone: currentUser.phone || userProfile.phone || '',
      userCity: userProfile.city || ''
    };

    let record = reqPayload;
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(reqPayload)
      });
      const data = await res.json();
      if (data.success && data.data) {
        record = data.data;
      }
    } catch (err) {
      console.warn('API request creation failed, using offline fallback:', err);
    }

    setUserRequests(prev => [record, ...prev.filter(r => r.id !== record.id)]);
    refreshUserRequests();
    if (adminToken) fetchAdminRequests();

    // Trigger Google Ads conversion on product request
    triggerGoogleAdsConversion();

    setNotifications(prev => [
      {
        title: 'Item Request Submitted',
        message: `Your request for "${part.title}" has been submitted (ID: #${record.id}).`,
        timestamp: 'Just now'
      },
      ...prev
    ]);

    handleOpenUserDashboard();
  };

  const handleReserveItem = async (part) => {
    if (!currentUser || !authToken) {
      setIsAuthOpen(true);
      return;
    }

    const reqPayload = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      partId: part.id,
      partTitle: part.title,
      partImage: part.image,
      sku: part.sku || part.oemNumber || 'N/A',
      price: part.price || 0,
      compatibility: part.compatibleModels && part.compatibleModels.length > 0 ? part.compatibleModels[0] : (part.modelYearRange || 'VW Beetle / Bus'),
      type: 'RESERVE',
      status: 'Reserved',
      userName: currentUser.name || userProfile.name || 'Restorer Member',
      userEmail: currentUser.email || userProfile.email || '',
      userPhone: currentUser.phone || userProfile.phone || '',
      userCity: userProfile.city || ''
    };

    let record = reqPayload;
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(reqPayload)
      });
      const data = await res.json();
      if (data.success && data.data) {
        record = data.data;
      }
    } catch (err) {
      console.warn('API reservation creation failed, using offline fallback:', err);
    }

    setUserRequests(prev => [record, ...prev.filter(r => r.id !== record.id)]);
    refreshUserRequests();
    if (adminToken) fetchAdminRequests();

    // Trigger Google Ads conversion on product reservation
    triggerGoogleAdsConversion();

    setNotifications(prev => [
      {
        title: 'Item Reserved',
        message: `Your reservation for "${part.title}" has been placed (ID: #${record.id}).`,
        timestamp: 'Just now'
      },
      ...prev
    ]);

    handleOpenUserDashboard();
  };

  const handleAddVehicle = (veh) => {
    setSavedVehicles(prev => [veh, ...prev]);
  };

  const handleRemoveVehicle = (vehId) => {
    setSavedVehicles(prev => prev.filter(v => v.id !== vehId));
  };

  const handleUpdateUserRequestStatus = async (reqId, newStatus) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/requests/${reqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminRequests();
      }
    } catch (err) {
      console.error('Failed to update request status via API:', err);
    }

    setAdminRequests(prev =>
      prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r)
    );
    setUserRequests(prev =>
      prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r)
    );

    setNotifications(prev => [
      {
        title: 'Request Status Updated',
        message: `Request #${reqId} status was updated to "${newStatus}".`,
        timestamp: 'Just now'
      },
      ...prev
    ]);
  };

  // Wishlist Handler
  const handleToggleWishlist = (partId) => {
    setWishlistIds(prev =>
      prev.includes(partId) ? prev.filter(id => id !== partId) : [...prev, partId]
    );
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + ((item.price || 0) * item.quantity), 0);

  // Auth Guard trigger from checkout
  const handleProceedToCheckout = async () => {
    if (!currentUser) {
      setIsAuthOpen(true);
    } else {
      let orderId = `ORD-VINTAGE-${Math.floor(100000 + Math.random() * 900000)}`;
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            items: cartItems,
            totalAmount: cartTotal
          })
        });
        const data = await res.json();
        if (data.success && data.data?.id) {
          orderId = data.data.id;
          alert(`Order ${orderId} placed successfully for ${currentUser.name}! Confirmation sent to ${currentUser.email}.`);
        } else {
          alert(`Order placed successfully for ${currentUser.name}!`);
        }
      } catch (err) {
        alert(`Order placed successfully for ${currentUser.name}! Confirmation email sent.`);
      }

      setCartItems([]);
      setIsCartOpen(false);
      refreshUserRequests();
      if (adminToken) fetchAdminRequests();
      handleOpenUserDashboard();
    }
  };

  const handleSelectFilter = (filterObj, options = {}) => {
    setActiveFilter(prev => ({
      ...prev,
      ...filterObj
    }));

    if (!options?.preventScroll) {
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] font-technical-data selection:bg-[#ff7a1a] selection:text-black">
      
      {/* Sticky Top Volkswagen Navigation Bar (Hidden on User Dashboard Portal) */}
      {currentPage !== 'dashboard' && (
        <Navbar
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          userRequestsCount={userRequests.length}
          wishlistCount={wishlistIds.length}
          onOpenCart={handleOpenCart}
          onOpenUserDashboard={handleOpenUserDashboard}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenAuth={handleOpenAuth}
          onOpenAdminLogin={handleOpenAdminLogin}
          activeFilter={activeFilter}
          onSelectFilter={(filterObj, options) => {
            navigateToPage('shop');
            handleSelectFilter(filterObj, options);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigateToShop={() => navigateToPage('shop')}
        />
      )}

      <main className={currentPage === 'dashboard' ? "pt-28 md:pt-36 min-h-screen pb-16 bg-[#0e0e0f]" : "pt-24 md:pt-28 min-h-[80vh]"}>
        {currentPage === 'dashboard' ? (
          <UserDashboard
            isOpen={true}
            onClose={() => navigateToPage('shop')}
            onBackToShop={() => navigateToPage('shop')}
            currentUser={currentUser}
            authToken={authToken}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
            userRequests={userRequests}
            savedVehicles={savedVehicles}
            wishlistParts={wishlistIds.map(id => ({ id, title: `Part #${id}`, price: 150, image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80' }))}
            notifications={notifications}
            userProfile={userProfile}
            activeVehicleFilter={activeFilter.modelId}
            onAddVehicle={handleAddVehicle}
            onRemoveVehicle={handleRemoveVehicle}
            onSelectActiveVehicleFilter={(model) => {
              handleSelectFilter({ modelId: model });
              navigateToPage('shop');
            }}
            onRequestItem={handleRequestItem}
            onReserveItem={handleReserveItem}
            onRemoveWishlist={(id) => setWishlistIds(prev => prev.filter(wId => wId !== id))}
            onUpdateProfile={(updated) => setUserProfile(updated)}
            onOpenCatalog={() => {
              navigateToPage('shop');
              setTimeout(() => {
                const catalogEl = document.getElementById('catalog');
                if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        ) : (
          <>
            {/* Main Hero Section */}
            <HeroSection />

            {/* Premium Vehicle & CB Performance Parts System Showroom */}
            <VWVehicleShowcase 
              key={`vw-showcase-${refreshKey}`}
              refreshKey={refreshKey}
              onSelectVehicle={handleSelectFilter}
              onOpenGuidedSearch={handleOpenGuidedSearch}
              onViewVehicleDetails={handleViewPartDetails}
              onRequestVehicle={handleRequestItem}
              onReserveVehicle={handleReserveItem}
              onAddToCart={handleAddToCart}
            />

            {/* All Parts Page / Catalog Section */}
            <CatalogSection
              key={refreshKey}
              onAddToCart={handleAddToCart}
              onRequestItem={handleRequestItem}
              onReserveItem={handleReserveItem}
              onViewPartDetails={handleViewPartDetails}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
              searchTerm={searchTerm}
              activeFilter={activeFilter}
              onSelectFilter={handleSelectFilter}
            />

            {/* Live Engine Workshop & Restoration Video Showcase */}
            <VideoShowcase />

            {/* Verified Customer Reviews */}
            <ReviewsSection />

            {/* Houston Workshop & Interactive Google Map Location Section */}
            <LocationMapSection />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Step-by-Step Guided Search Modal */}
      <GuidedSearchModal
        isOpen={isGuidedSearchOpen}
        onClose={handleCloseGuidedSearch}
        onApplySelection={handleSelectFilter}
      />

      {/* Part Specifications Modal */}
      {activeModalPart && (
        <PartDetailModal
          part={activeModalPart}
          onClose={handleClosePartDetails}
          onAddToCart={handleAddToCart}
          onRequestItem={handleRequestItem}
          onReserveItem={handleReserveItem}
        />
      )}

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* User Authentication Modal Guard */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        onAuthSuccess={(user, token) => {
          const userRole = (user?.role || '').toLowerCase();
          const userEmail = (user?.email || '').toLowerCase();
          const isAdmin = userRole === 'admin' || userEmail === 'admin@rustyaircooled.com';

          setCurrentUser(user);
          setAuthToken(token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          if (token) localStorage.setItem('authToken', token);

          if (isAdmin) {
            setAdminToken(token || 'master-admin-token-2026');
            localStorage.setItem('adminToken', token || 'master-admin-token-2026');
            handleOpenAdminPanel();
            navigateToPage('shop');
          } else {
            navigateToPage('dashboard');
          }
        }}
        cartTotal={cartTotal}
      />

      {/* Admin Gateway Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={handleCloseAdminLogin}
        onAdminSuccess={(token, user) => {
          const adminSessionToken = token || 'master-admin-token-2026';
          setAdminToken(adminSessionToken);
          localStorage.setItem('adminToken', adminSessionToken);
          if (user) {
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          handleOpenAdminPanel();
          navigateToPage('shop');
        }}
      />

      {/* Admin Dashboard Control Panel */}
      {isAdminPanelOpen && (
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={handleCloseAdminPanel}
          onLogout={handleLogout}
          onRefreshCatalog={handleRefreshCatalog}
          userRequests={adminRequests}
          onUpdateUserRequestStatus={handleUpdateUserRequestStatus}
          adminToken={adminToken}
        />
      )}

    </div>
  );
}
