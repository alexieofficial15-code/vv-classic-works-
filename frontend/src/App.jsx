import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { safeStorage } from './utils/safeStorage';
import { API_BASE_URL } from './config/api';
import { fetchCatalog, getCachedCatalog, invalidateCatalog } from './data/catalogStore';
import { trackAddToCart, trackBeginCheckout, trackLegacyConversion } from './analytics';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import VWVehicleShowcase from './components/VWVehicleShowcase';
import CatalogSection from './components/CatalogSection';
import ReviewsSection from './components/ReviewsSection';
import VideoShowcase from './components/VideoShowcase';
import LocationMapSection from './components/LocationMapSection';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';

// Heavy / rarely used views are split into their own chunks so they are not part of the
// initial bundle that every visitor has to download and parse.
const GuidedSearchModal = lazy(() => import('./components/GuidedSearchModal'));
const PartDetailModal = lazy(() => import('./components/PartDetailModal'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const AdminLoginModal = lazy(() => import('./components/AdminLoginModal'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));

const CART_STORAGE_KEY = 'cart_v1';
const isInlineImage = (value) => typeof value === 'string' && value.startsWith('data:');
// Never persist or send inline base64 photos (they blow past the 5 MB storage quota)
const slimPart = (part) => ({
  id: part.id,
  title: part.title || part.name || '',
  price: Number(part.price) || 0,
  quantity: Number(part.quantity) || 1,
  oemNumber: part.oemNumber || '',
  sku: part.sku || '',
  image: isInlineImage(part.image) ? '' : (part.image || '')
});
const loadStoredCart = () => {
  const stored = safeStorage.getJSON(CART_STORAGE_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored
    .filter((item) => item && item.id && Number(item.quantity) > 0)
    .map(slimPart);
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => safeStorage.getJSON('currentUser', null));
  const [authToken, setAuthToken] = useState(() => safeStorage.getItem('authToken') || null);
  const [adminToken, setAdminToken] = useState(() => safeStorage.getItem('adminToken') || null);
  
  // Persist Admin Panel open state across page refreshes
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(() => {
    const savedAdminToken = safeStorage.getItem('adminToken');
    const savedAdminOpen = safeStorage.getItem('isAdminPanelOpen') === 'true';
    const hasAdminHash = window.location.hash === '#admin';
    return Boolean(savedAdminToken && (savedAdminOpen || hasAdminHash));
  });

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(() => window.location.hash === '#cart');
  const [isGuidedSearchOpen, setIsGuidedSearchOpen] = useState(false);
  const [activeModalPart, setActiveModalPart] = useState(null);

  const [cartItems, setCartItems] = useState(loadStoredCart);
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
    return safeStorage.getItem('currentPage') || 'shop';
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
    safeStorage.setItem('currentPage', newPage);
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
    safeStorage.setItem('isAdminPanelOpen', 'true');
    if (window.location.hash !== '#admin') {
      window.history.pushState({ page: 'admin' }, '', '#admin');
    }
  };

  const handleCloseAdminPanel = () => {
    setIsAdminPanelOpen(false);
    safeStorage.setItem('isAdminPanelOpen', 'false');
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
          fetchCatalog()
            .then(parts => {
              const found = parts.find(p => String(p.id) === String(partId));
              if (found) {
                partsCacheRef.current.set(String(found.id), found);
                setActiveModalPart(found);
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
        safeStorage.setItem('isAdminPanelOpen', 'true');
      } else {
        setIsAdminPanelOpen(false);
        safeStorage.setItem('isAdminPanelOpen', 'false');
      }

      // D. Page Level View (Dashboard vs Shop)
      if (hash === '#dashboard' || state.page === 'dashboard') {
        setCurrentPage('dashboard');
        safeStorage.setItem('currentPage', 'dashboard');
      } else {
        setCurrentPage('shop');
        safeStorage.setItem('currentPage', 'shop');
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
    const savedToken = safeStorage.getItem('authToken');
    const savedUser = safeStorage.getJSON('currentUser', null);
    const savedAdminToken = safeStorage.getItem('adminToken');

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
            safeStorage.setItem('currentUser', JSON.stringify(data.user));
          } else if (savedUser) {
            setCurrentUser(savedUser);
          }
        })
        .catch(() => {
          if (savedUser) {
            setCurrentUser(savedUser);
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
      const initialReqs = safeStorage.getJSON(`${userKey}_requests`, []);

      // 2. Saved Vehicles
      setSavedVehicles(safeStorage.getJSON(`${userKey}_vehicles`, []));

      // 3. Notifications
      const savedNotifs = safeStorage.getJSON(`${userKey}_notifications`, null);
      if (savedNotifs) {
        setNotifications(savedNotifs);
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
      const savedProf = safeStorage.getJSON(`${userKey}_profile`, null);
      if (savedProf) {
        setUserProfile(savedProf);
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
      safeStorage.setItem(`user_${currentUser.id}_requests`, JSON.stringify(userRequests));
    }
  }, [userRequests, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      safeStorage.setItem(`user_${currentUser.id}_vehicles`, JSON.stringify(savedVehicles));
    }
  }, [savedVehicles, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      safeStorage.setItem(`user_${currentUser.id}_notifications`, JSON.stringify(notifications));
    }
  }, [notifications, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      safeStorage.setItem(`user_${currentUser.id}_profile`, JSON.stringify(userProfile));
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
    safeStorage.removeItem('authToken');
    safeStorage.removeItem('currentUser');
    safeStorage.removeItem('adminToken');
    setUserRequests([]);
    setSavedVehicles([]);
    setNotifications([]);
    navigateToPage('shop');
  };
  
  // Refresh trigger for parts catalog after admin edit/delete
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefreshCatalog = () => {
    invalidateCatalog();
    setRefreshKey(prev => prev + 1);
  };

  // Keep the cart across refreshes / tab reloads (mobile browsers reload tabs often)
  useEffect(() => {
    safeStorage.setJSON(CART_STORAGE_KEY, cartItems.map(slimPart));
  }, [cartItems]);

  // Request / reserve / order flows still use the original shared conversion label
  const triggerGoogleAdsConversion = trackLegacyConversion;

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

    trackAddToCart(part);

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

  // Guest Reservation Modal State
  const [guestReservationPart, setGuestReservationPart] = useState(null);
  const [guestResForm, setGuestResForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    notes: ''
  });
  const [isSubmittingRes, setIsSubmittingRes] = useState(false);

  const handleReserveItem = async (part) => {
    if (!currentUser || !authToken) {
      // Allow seamless guest reservation
      setGuestReservationPart(part);
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

    alert(`Reservation Confirmed!\n\nYour reservation for "${part.title}" has been placed (Ref: #${record.id}). Our master technicians will hold this item for you.`);
  };

  const handleConfirmGuestReservation = async (e) => {
    e.preventDefault();
    if (!guestReservationPart) return;
    setIsSubmittingRes(true);

    const part = guestReservationPart;
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
      userName: guestResForm.name || 'Guest Restorer',
      userEmail: guestResForm.email || 'guest@aircooledworks.com',
      userPhone: guestResForm.phone || '',
      userCity: guestResForm.city || '',
      notes: guestResForm.notes || ''
    };

    let record = reqPayload;
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqPayload)
      });
      const data = await res.json();
      if (data.success && data.data) {
        record = data.data;
      }
    } catch (err) {
      console.warn('API guest reservation fallback:', err);
    }

    setUserRequests(prev => [record, ...prev.filter(r => r.id !== record.id)]);
    refreshUserRequests();
    if (adminToken) fetchAdminRequests();

    // Trigger Google Ads conversion on guest reservation
    triggerGoogleAdsConversion();

    setIsSubmittingRes(false);
    setGuestReservationPart(null);
    setGuestResForm({ name: '', email: '', phone: '', city: '', notes: '' });

    alert(`Reservation Confirmed!\n\nThank you, ${reqPayload.userName}! Your reservation for "${part.title}" is confirmed (Ref: #${record.id}).\nWe have held this item for you and our team will contact you via ${reqPayload.userPhone || reqPayload.userEmail} shortly.`);
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

  // Unified Order Placement Handler (Guest Checkout + Logged-in Members)
  const handleProceedToCheckout = async (checkoutData = {}) => {
    const finalName = checkoutData.name || currentUser?.name || 'Guest Restorer';
    const finalEmail = checkoutData.email || currentUser?.email || 'guest@aircooledworks.com';
    const finalPhone = checkoutData.phone || currentUser?.phone || '';
    const finalAddress = checkoutData.shippingAddress || currentUser?.city || 'Workshop Pickup / Delivery Dispatch';
    const finalNotes = checkoutData.notes || '';

    let orderId = `ORD-VINTAGE-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: cartItems,
          totalAmount: cartTotal,
          userName: finalName,
          userEmail: finalEmail,
          userPhone: finalPhone,
          shippingAddress: finalAddress,
          notes: finalNotes
        })
      });
      const data = await res.json();
      if (data.success && data.data?.id) {
        orderId = data.data.id;
      }
    } catch (err) {
      console.warn('Backend order placement fallback:', err);
    }

    // Trigger Google Ads conversion tracking on order placement
    triggerGoogleAdsConversion();

    setCartItems([]);
    refreshUserRequests();
    if (adminToken) fetchAdminRequests();

    if (currentUser) {
      alert(`Order #${orderId} Placed Successfully!\n\nThank you, ${finalName}! Confirmation sent to ${finalEmail}.`);
      setIsCartOpen(false);
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
          <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
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
            wishlistParts={wishlistIds.map(id => (getCachedCatalog() || []).find(p => p.id === id) || { id, title: `Part #${id}`, price: 150, image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80' })}
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
          </Suspense>
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
      {isGuidedSearchOpen && (
        <Suspense fallback={null}>
          <GuidedSearchModal
            isOpen={isGuidedSearchOpen}
            onClose={handleCloseGuidedSearch}
            onApplySelection={handleSelectFilter}
          />
        </Suspense>
      )}

      {/* Part Specifications Modal */}
      {activeModalPart && (
        <Suspense fallback={null}>
          <PartDetailModal
            part={activeModalPart}
            onClose={handleClosePartDetails}
            onAddToCart={handleAddToCart}
            onRequestItem={handleRequestItem}
            onReserveItem={handleReserveItem}
          />
        </Suspense>
      )}

      {/* Guest Reservation Modal */}
      {guestReservationPart && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-technical-data select-none animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Reserve part"
        >
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl text-white my-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-display text-white">Reserve Rare Vintage Part</h3>
                  <span className="text-[10px] text-amber-400 font-mono">No upfront payment required • Workshop hold</span>
                </div>
              </div>
              <button
                onClick={() => setGuestReservationPart(null)}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                aria-label="Close reservation modal"
              >
                ✕
              </button>
            </div>

            {/* Part Preview */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
              {guestReservationPart.image && (
                <img
                  src={guestReservationPart.image}
                  alt={guestReservationPart.title}
                  className="w-14 h-14 object-cover rounded-lg border border-slate-800 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate font-display">{guestReservationPart.title}</h4>
                <div className="text-[10px] text-slate-400 font-mono">
                  OEM: {guestReservationPart.oemNumber || 'GENUINE'} • SKU: {guestReservationPart.sku || 'NOS'}
                </div>
                <div className="text-xs font-bold text-amber-400 font-mono">
                  ${(guestReservationPart.price || 0).toLocaleString()} USD
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmGuestReservation} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  YOUR FULL NAME <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Michael Schmidt"
                  value={guestResForm.name}
                  onChange={(e) => setGuestResForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    EMAIL ADDRESS <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={guestResForm.email}
                    onChange={(e) => setGuestResForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    PHONE / WHATSAPP <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 019-2834"
                    value={guestResForm.phone}
                    onChange={(e) => setGuestResForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  DELIVERY CITY / STATE / COUNTRY
                </label>
                <input
                  type="text"
                  placeholder="e.g. Austin, Texas, USA"
                  value={guestResForm.city}
                  onChange={(e) => setGuestResForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  NOTES / COMPATIBILITY QUESTIONS (OPTIONAL)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Need confirmation for 1971 Super Beetle dual port"
                  value={guestResForm.notes}
                  onChange={(e) => setGuestResForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingRes}
                className="w-full min-h-[46px] bg-[#ff7a1a] hover:bg-[#ffb68e] text-black font-bold py-3 rounded-xl uppercase tracking-wider text-xs font-mono shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingRes ? 'Confirming Reservation...' : 'Confirm Reservation (Hold Item)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        cartItems={cartItems}
        currentUser={currentUser}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
        onBeginCheckout={() => trackBeginCheckout(cartItems, cartTotal)}
      />

      {/* User Authentication Modal Guard */}
      {isAuthOpen && (
      <Suspense fallback={null}>
      <AuthModal
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        onAuthSuccess={(user, token) => {
          const userRole = (user?.role || '').toLowerCase();
          const isAdmin = userRole === 'admin';

          setCurrentUser(user);
          setAuthToken(token);
          safeStorage.setItem('currentUser', JSON.stringify(user));
          if (token) safeStorage.setItem('authToken', token);

          if (isAdmin && token) {
            setAdminToken(token);
            safeStorage.setItem('adminToken', token);
            handleOpenAdminPanel();
            navigateToPage('shop');
          } else {
            navigateToPage('dashboard');
          }
        }}
        cartTotal={cartTotal}
      />
      </Suspense>
      )}

      {/* Admin Gateway Login Modal */}
      {isAdminLoginOpen && (
      <Suspense fallback={null}>
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={handleCloseAdminLogin}
        onAdminSuccess={(token, user) => {
          if (!token) return;
          setAdminToken(token);
          safeStorage.setItem('adminToken', token);
          if (user) {
            setCurrentUser(user);
            safeStorage.setItem('currentUser', JSON.stringify(user));
          }
          handleOpenAdminPanel();
          navigateToPage('shop');
        }}
      />
      </Suspense>
      )}

      {/* Admin Dashboard Control Panel */}
      {isAdminPanelOpen && (
        <Suspense fallback={null}>
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={handleCloseAdminPanel}
          onLogout={handleLogout}
          onRefreshCatalog={handleRefreshCatalog}
          userRequests={adminRequests}
          onUpdateUserRequestStatus={handleUpdateUserRequestStatus}
          adminToken={adminToken}
        />
        </Suspense>
      )}

    </div>
  );
}
