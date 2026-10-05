import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from './config/api';
import { getCatalogParts, invalidateCatalogCache } from './data/catalogStore';
import {
  trackAddToCart,
  trackPurchase,
  trackLead,
  triggerGoogleAdsConversion,
  sanitizeImage,
  sanitizeOrderItem
} from './analytics';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useRouter, updateDocumentMeta, slugify } from './utils/router';
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
import StickyCallBar from './components/StickyCallBar';
import Footer from './components/Footer';

// Route Pages
import EnginesPage from './pages/EnginesPage';
import PartsPage from './pages/PartsPage';
import RestorationPage from './pages/RestorationPage';
import ProductDetailPage from './pages/ProductDetailPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnsPolicy from './pages/ReturnsPolicy';
import TermsOfService from './pages/TermsOfService';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

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
  
  // Global action notification status banner (Success / Error)
  const [actionStatus, setActionStatus] = useState(null); // { type: 'success' | 'error', title, message, referenceId }
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isSubmittingReserve, setIsSubmittingReserve] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  // Auto-dismiss actionStatus banner
  useEffect(() => {
    if (!actionStatus) return;
    const timer = setTimeout(() => {
      setActionStatus(null);
    }, actionStatus.type === 'error' ? 12000 : 8000);
    return () => clearTimeout(timer);
  }, [actionStatus]);

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

  // Client-side Router Hook
  const { pathname, hash, route, navigate } = useRouter();
  const isDashboardView = hash === '#dashboard';

  // User-scoped Dashboard State
  const [userRequests, setUserRequests] = useState([]);
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userProfile, setUserProfile] = useState({ name: '', email: '', phone: '', city: '' });

  // Admin Panel requests store (fetched from GET /api/admin/requests)
  const [adminRequests, setAdminRequests] = useState([]);

  // Cache of parts for fast lookup during browser Back / Forward navigation
  const partsCacheRef = useRef(new Map());

  const handleOpenUserDashboard = () => {
    if (!currentUser) {
      handleOpenAuth();
    } else {
      if (window.location.hash !== '#dashboard') {
        window.history.pushState(null, '', window.location.pathname + window.location.search + '#dashboard');
      }
    }
  };

  const handleCloseUserDashboard = () => {
    if (window.location.hash === '#dashboard') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  };

  const handleViewPartDetails = (part) => {
    if (!part) return;
    partsCacheRef.current.set(String(part.id), part);
    setActiveModalPart(part);
  };

  const handleClosePartDetails = () => {
    setActiveModalPart(null);
    if (window.location.hash.startsWith('#part-')) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  };

  const handleOpenCart = () => {
    setIsCartOpen(true);
    if (window.location.hash !== '#cart') {
      window.history.pushState(null, '', window.location.pathname + window.location.search + '#cart');
    }
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
    if (window.location.hash === '#cart') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  };

  const handleOpenGuidedSearch = () => {
    setIsGuidedSearchOpen(true);
    if (window.location.hash !== '#guided-search') {
      window.history.pushState(null, '', window.location.pathname + window.location.search + '#guided-search');
    }
  };

  const handleCloseGuidedSearch = () => {
    setIsGuidedSearchOpen(false);
    if (window.location.hash === '#guided-search') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  };

  const handleOpenAuth = () => {
    setIsAuthOpen(true);
    if (window.location.hash !== '#auth') {
      window.history.pushState(null, '', window.location.pathname + window.location.search + '#auth');
    }
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
    if (window.location.hash === '#auth') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  };

  const handleOpenAdminLogin = () => {
    setIsAdminLoginOpen(true);
    if (window.location.hash !== '#admin-login') {
      window.history.pushState(null, '', window.location.pathname + window.location.search + '#admin-login');
    }
  };

  const handleCloseAdminLogin = () => {
    setIsAdminLoginOpen(false);
    if (window.location.hash === '#admin-login') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  };

  const handleOpenAdminPanel = () => {
    setIsAdminPanelOpen(true);
    localStorage.setItem('isAdminPanelOpen', 'true');
    if (window.location.hash !== '#admin') {
      window.history.pushState(null, '', window.location.pathname + window.location.search + '#admin');
    }
  };

  const handleCloseAdminPanel = () => {
    setIsAdminPanelOpen(false);
    localStorage.setItem('isAdminPanelOpen', 'false');
    if (window.location.hash === '#admin') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  };

  // Sync modal and hash states whenever hash changes (including browser Back/Forward)
  useEffect(() => {
    setIsCartOpen(hash === '#cart');
    setIsGuidedSearchOpen(hash === '#guided-search');
    setIsAuthOpen(hash === '#auth');
    setIsAdminLoginOpen(hash === '#admin-login');

    if (hash === '#admin') {
      setIsAdminPanelOpen(true);
      localStorage.setItem('isAdminPanelOpen', 'true');
    } else {
      setIsAdminPanelOpen(false);
      localStorage.setItem('isAdminPanelOpen', 'false');
    }

    if (hash.startsWith('#part-')) {
      const partId = hash.replace('#part-', '');
      const cached = partsCacheRef.current.get(String(partId));
      if (cached) {
        setActiveModalPart(cached);
      } else {
        getCatalogParts().then(parts => {
          if (Array.isArray(parts)) {
            const found = parts.find(p => String(p.id) === String(partId));
            if (found) {
              partsCacheRef.current.set(String(found.id), found);
              setActiveModalPart(found);
            }
          }
        }).catch(() => {});
      }
    } else {
      setActiveModalPart(null);
    }
  }, [hash]);

  // Set AutoPartsStore/LocalBusiness JSON-LD on Homepage
  useEffect(() => {
    if (route.name === 'home') {
      const homeJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'AutoPartsStore',
        name: 'Classic Aircooled VW Works',
        image: 'https://www.classicaircooledvwworks.com/logo.png',
        telephone: '+19452879865',
        url: 'https://www.classicaircooledvwworks.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '14826 Yarberry St',
          addressLocality: 'Houston',
          addressRegion: 'TX',
          postalCode: '77039',
          addressCountry: 'US'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 29.9045,
          longitude: -95.3341
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:00',
            closes: '18:00'
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Saturday',
            opens: '09:00',
            closes: '16:00'
          }
        ],
        priceRange: '$$'
      };

      updateDocumentMeta({
        title: 'Classic Aircooled VW Works | Aircooled VW Engines, Parts & Restoration',
        description: 'Classic Aircooled VW Works — High Performance Aircooled VW Engines, Authentic Spare Parts, Type 1 Beetle, Type 2 Bus, Type 3, and Karmann Ghia Restoration.',
        canonicalPath: '/',
        ogType: 'website',
        jsonLd: homeJsonLd
      });
    }
  }, [route.name]);

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
      const sanitizedReqs = userRequests.map(r => ({
        ...r,
        partImage: sanitizeImage(r.partImage || r.image) || '',
        image: sanitizeImage(r.partImage || r.image) || ''
      }));
      localStorage.setItem(`user_${currentUser.id}_requests`, JSON.stringify(sanitizedReqs));
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
    handleCloseUserDashboard();
    navigate('/');
  };
  
  // Refresh trigger for parts catalog after admin edit/delete
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefreshCatalog = () => {
    invalidateCatalogCache();
    setRefreshKey(prev => prev + 1);
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

    // GA4 + Google Ads Add to Cart conversion (fires once per addition)
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

    if (isSubmittingRequest) return;
    setIsSubmittingRequest(true);
    setActionStatus(null);

    const cleanImage = sanitizeImage(part.image);
    const reqPayload = {
      partId: part.id,
      partTitle: part.title,
      partImage: cleanImage || '',
      sku: part.sku || part.oemNumber || 'N/A',
      price: Number(part.price || 0),
      compatibility: part.compatibleModels && part.compatibleModels.length > 0 ? part.compatibleModels[0] : (part.modelYearRange || 'VW Beetle / Bus'),
      type: 'REQUEST',
      status: 'Pending',
      userName: currentUser.name || userProfile.name || 'Restorer Member',
      userEmail: currentUser.email || userProfile.email || '',
      userPhone: currentUser.phone || userProfile.phone || '',
      userCity: userProfile.city || ''
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(reqPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));

      // Treat success ONLY when res.ok && data.success && data.data?.id
      if (!res.ok || !data?.success || !data?.data?.id) {
        throw new Error("We couldn't send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865.");
      }

      const record = data.data;

      // Honest conversion tracking: fire ONLY on verified backend response
      triggerGoogleAdsConversion({
        id: record.id,
        type: 'request',
        part,
        value: Number(part.price || 0)
      });
      trackLead({
        id: record.id,
        type: 'request',
        part,
        value: Number(part.price || 0)
      });

      setUserRequests(prev => [record, ...prev.filter(r => r.id !== record.id)]);
      refreshUserRequests();
      if (adminToken) fetchAdminRequests();

      setNotifications(prev => [
        {
          title: 'Item Request Submitted',
          message: `Your request for "${part.title}" has been submitted (ID: #${record.id}).`,
          timestamp: 'Just now'
        },
        ...prev
      ]);

      setActionStatus({
        type: 'success',
        title: 'Request Submitted Successfully',
        message: `Your request for "${part.title}" has been confirmed.`,
        referenceId: record.id
      });
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('API request creation failed:', err);
      setActionStatus({
        type: 'error',
        title: 'Request Submission Failed',
        message: "We couldn't send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865."
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Guest Reservation Modal State
  const [guestReservationPart, setGuestReservationPart] = useState(null);
  const [guestResError, setGuestResError] = useState(null);
  const [guestResSuccess, setGuestResSuccess] = useState(null);
  const [guestResForm, setGuestResForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    notes: ''
  });
  const [isSubmittingGuestRes, setIsSubmittingGuestRes] = useState(false);

  const handleReserveItem = async (part) => {
    if (!currentUser || !authToken) {
      // Allow seamless guest reservation
      setGuestReservationPart(part);
      setGuestResError(null);
      setGuestResSuccess(null);
      return;
    }

    if (isSubmittingReserve) return;
    setIsSubmittingReserve(true);
    setActionStatus(null);

    const cleanImage = sanitizeImage(part.image);
    const reqPayload = {
      partId: part.id,
      partTitle: part.title,
      partImage: cleanImage || '',
      sku: part.sku || part.oemNumber || 'N/A',
      price: Number(part.price || 0),
      compatibility: part.compatibleModels && part.compatibleModels.length > 0 ? part.compatibleModels[0] : (part.modelYearRange || 'VW Beetle / Bus'),
      type: 'RESERVE',
      status: 'Reserved',
      userName: currentUser.name || userProfile.name || 'Restorer Member',
      userEmail: currentUser.email || userProfile.email || '',
      userPhone: currentUser.phone || userProfile.phone || '',
      userCity: userProfile.city || ''
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(reqPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));

      // Treat success ONLY when res.ok && data.success && data.data?.id
      if (!res.ok || !data?.success || !data?.data?.id) {
        throw new Error("We couldn't send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865.");
      }

      const record = data.data;

      // Honest conversion tracking: fire ONLY on verified backend response
      triggerGoogleAdsConversion({
        id: record.id,
        type: 'reservation',
        part,
        value: Number(part.price || 0)
      });
      trackLead({
        id: record.id,
        type: 'reservation',
        part,
        value: Number(part.price || 0)
      });

      setUserRequests(prev => [record, ...prev.filter(r => r.id !== record.id)]);
      refreshUserRequests();
      if (adminToken) fetchAdminRequests();

      setNotifications(prev => [
        {
          title: 'Item Reserved',
          message: `Your reservation for "${part.title}" has been placed (ID: #${record.id}).`,
          timestamp: 'Just now'
        },
        ...prev
      ]);

      setActionStatus({
        type: 'success',
        title: 'Reservation Confirmed Successfully',
        message: `Your reservation for "${part.title}" has been confirmed. Our technicians will hold this item for you.`,
        referenceId: record.id
      });
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('API reservation creation failed:', err);
      setActionStatus({
        type: 'error',
        title: 'Reservation Failed',
        message: "We couldn't send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865."
      });
    } finally {
      setIsSubmittingReserve(false);
    }
  };

  const handleConfirmGuestReservation = async (e) => {
    e.preventDefault();
    if (!guestReservationPart || isSubmittingGuestRes) return;
    setIsSubmittingGuestRes(true);
    setGuestResError(null);
    setGuestResSuccess(null);

    const part = guestReservationPart;
    const cleanImage = sanitizeImage(part.image);
    const reqPayload = {
      partId: part.id,
      partTitle: part.title,
      partImage: cleanImage || '',
      sku: part.sku || part.oemNumber || 'N/A',
      price: Number(part.price || 0),
      compatibility: part.compatibleModels && part.compatibleModels.length > 0 ? part.compatibleModels[0] : (part.modelYearRange || 'VW Beetle / Bus'),
      type: 'RESERVE',
      status: 'Reserved',
      userName: guestResForm.name || 'Guest Restorer',
      userEmail: guestResForm.email || 'guest@aircooledworks.com',
      userPhone: guestResForm.phone || '',
      userCity: guestResForm.city || '',
      notes: guestResForm.notes || ''
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

      // Treat success ONLY when res.ok && data.success && data.data?.id
      if (!res.ok || !data?.success || !data?.data?.id) {
        throw new Error("We couldn't send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865.");
      }

      const record = data.data;

      // Honest conversion tracking: fire ONLY on verified backend response
      triggerGoogleAdsConversion({
        id: record.id,
        type: 'reservation',
        part,
        value: Number(part.price || 0)
      });
      trackLead({
        id: record.id,
        type: 'reservation',
        part,
        value: Number(part.price || 0)
      });

      setUserRequests(prev => [record, ...prev.filter(r => r.id !== record.id)]);
      refreshUserRequests();
      if (adminToken) fetchAdminRequests();

      // Show inline success banner with real server reference ID
      setGuestResSuccess({
        id: record.id,
        title: part.title,
        name: reqPayload.userName,
        contact: reqPayload.userPhone || reqPayload.userEmail
      });
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('API guest reservation failed:', err);
      // Keep form data, keep modal, do NOT fire conversion, show inline red error
      setGuestResError("We couldn't send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865.");
    } finally {
      setIsSubmittingGuestRes(false);
    }
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
    if (isSubmittingCheckout) return;
    setIsSubmittingCheckout(true);

    const finalName = checkoutData.name || currentUser?.name || 'Guest Restorer';
    const finalEmail = checkoutData.email || currentUser?.email || 'guest@aircooledworks.com';
    const finalPhone = checkoutData.phone || currentUser?.phone || '';
    const finalAddress = checkoutData.shippingAddress || currentUser?.city || 'Workshop Pickup / Delivery Dispatch';
    const finalNotes = checkoutData.notes || '';

    // Sanitize order items to ensure base64 images are never sent
    const cleanItems = cartItems.map(sanitizeOrderItem);

    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: cleanItems,
          totalAmount: cartTotal,
          userName: finalName,
          userEmail: finalEmail,
          userPhone: finalPhone,
          shippingAddress: finalAddress,
          notes: finalNotes
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      // Treat success ONLY when res.ok && data.success && data.data?.id
      if (!res.ok || !data?.success || !data?.data?.id) {
        throw new Error("We couldn't send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865.");
      }

      const savedOrder = data.data;

      // Honest conversion tracking: fire ONLY on verified backend success
      triggerGoogleAdsConversion({
        type: 'purchase',
        orderId: savedOrder.id,
        value: typeof savedOrder.totalAmount === 'number' && !isNaN(savedOrder.totalAmount) ? savedOrder.totalAmount : cartTotal,
        items: (Array.isArray(savedOrder.items) && savedOrder.items.length > 0) ? savedOrder.items : cleanItems
      });
      trackPurchase({
        orderId: savedOrder.id,
        value: typeof savedOrder.totalAmount === 'number' && !isNaN(savedOrder.totalAmount) ? savedOrder.totalAmount : cartTotal,
        items: (Array.isArray(savedOrder.items) && savedOrder.items.length > 0) ? savedOrder.items : cleanItems
      });

      // Clear cart only on verified success
      setCartItems([]);
      refreshUserRequests();
      if (adminToken) fetchAdminRequests();

      if (currentUser) {
        setActionStatus({
          type: 'success',
          title: 'Order Placed Successfully',
          message: `Thank you, ${finalName}! Confirmation sent to ${finalEmail}.`,
          referenceId: savedOrder.id
        });
        setIsCartOpen(false);
        handleOpenUserDashboard();
      }

      return savedOrder;
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('API order placement failed:', err);
      throw new Error("We couldn't send your request. Please try again or contact us on WhatsApp / call 1-945-287-9865.");
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  // Expose test handlers for automated testing verification
  if (typeof window !== 'undefined') {
    window.__appTestHandlers = {
      handleRequestItem,
      handleReserveItem,
      handleConfirmGuestReservation,
      handleProceedToCheckout,
      setCartItems,
      setIsCartOpen,
      setActionStatus
    };
  }

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
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] font-technical-data selection:bg-[#ff7a1a] selection:text-black pb-14 md:pb-0">
      
      {/* Sticky Top Volkswagen Navigation Bar (Hidden on User Dashboard Portal) */}
      {!isDashboardView && (
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
            if (route.name !== 'home' && route.name !== 'parts') {
              navigate('/parts');
            }
            handleSelectFilter(filterObj, options);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigateToShop={() => navigate('/')}
          onNavigate={navigate}
        />
      )}

      {/* Global Status Banner (Confirmed Success Banner with Server Ref ID or Inline Error) */}
      {actionStatus && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-xl p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3 text-white animate-in slide-in-from-top-4 duration-300 border-2"
          style={{
            backgroundColor: actionStatus.type === 'error' ? 'rgba(69, 10, 10, 0.95)' : 'rgba(15, 23, 42, 0.95)',
            borderColor: actionStatus.type === 'error' ? '#ef4444' : '#10b981'
          }}
          role={actionStatus.type === 'error' ? 'alert' : 'status'}
        >
          {actionStatus.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-bold font-display ${actionStatus.type === 'error' ? 'text-rose-300' : 'text-emerald-400'}`}>
              {actionStatus.title || (actionStatus.type === 'error' ? 'Submission Failed' : 'Success')}
            </h4>
            <p className="text-xs text-slate-200 font-mono mt-0.5 leading-relaxed">
              {actionStatus.message}
            </p>
            {actionStatus.referenceId && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-emerald-500/40 rounded-lg text-xs font-mono text-emerald-300">
                <span>SERVER REFERENCE:</span>
                <strong className="text-amber-400 font-bold">#{actionStatus.referenceId}</strong>
              </div>
            )}
            {actionStatus.type === 'error' && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs items-center">
                <a
                  href="https://wa.me/19452879865"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-mono font-bold transition-colors"
                >
                  💬 WhatsApp Us
                </a>
                <a
                  href="tel:19452879865"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-mono font-bold transition-colors"
                >
                  📞 Call 1-945-287-9865
                </a>
              </div>
            )}
          </div>
          <button
            onClick={() => setActionStatus(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className={isDashboardView ? "pt-28 md:pt-36 min-h-screen pb-16 bg-[#0e0e0f]" : "pt-24 md:pt-28 min-h-[80vh]"}>
        {isDashboardView ? (
          <UserDashboard
            isOpen={true}
            onClose={handleCloseUserDashboard}
            onBackToShop={handleCloseUserDashboard}
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
              handleCloseUserDashboard();
            }}
            onRequestItem={handleRequestItem}
            onReserveItem={handleReserveItem}
            onRemoveWishlist={(id) => setWishlistIds(prev => prev.filter(wId => wId !== id))}
            onUpdateProfile={(updated) => setUserProfile(updated)}
            onOpenCatalog={() => {
              handleCloseUserDashboard();
              navigate('/parts');
            }}
          />
        ) : route.name === 'engines' ? (
          <EnginesPage
            onAddToCart={handleAddToCart}
            onRequestItem={handleRequestItem}
            onReserveItem={handleReserveItem}
            onViewPartDetails={handleViewPartDetails}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            searchTerm={searchTerm}
            onNavigate={navigate}
          />
        ) : route.name === 'parts' ? (
          <PartsPage
            onAddToCart={handleAddToCart}
            onRequestItem={handleRequestItem}
            onReserveItem={handleReserveItem}
            onViewPartDetails={handleViewPartDetails}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            searchTerm={searchTerm}
            onNavigate={navigate}
          />
        ) : route.name === 'parts-category' ? (
          <PartsPage
            category={route.params?.category}
            onAddToCart={handleAddToCart}
            onRequestItem={handleRequestItem}
            onReserveItem={handleReserveItem}
            onViewPartDetails={handleViewPartDetails}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            searchTerm={searchTerm}
            onNavigate={navigate}
          />
        ) : route.name === 'restoration' ? (
          <RestorationPage
            onAddToCart={handleAddToCart}
            onRequestItem={handleRequestItem}
            onReserveItem={handleReserveItem}
            onViewPartDetails={handleViewPartDetails}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            searchTerm={searchTerm}
            onNavigate={navigate}
          />
        ) : route.name === 'product' ? (
          <ProductDetailPage
            productId={route.params?.id}
            productSlug={route.params?.slug}
            rawParam={route.params?.raw}
            onAddToCart={handleAddToCart}
            onRequestItem={handleRequestItem}
            onReserveItem={handleReserveItem}
            onNavigate={navigate}
          />
        ) : route.name === 'privacy' ? (
          <PrivacyPolicy onNavigate={navigate} />
        ) : route.name === 'shipping' ? (
          <ShippingPolicy onNavigate={navigate} />
        ) : route.name === 'returns' ? (
          <ReturnsPolicy onNavigate={navigate} />
        ) : route.name === 'terms' ? (
          <TermsOfService onNavigate={navigate} />
        ) : route.name === 'contact' ? (
          <ContactPage onNavigate={navigate} />
        ) : route.name === 'home' ? (
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
        ) : (
          <NotFoundPage onNavigate={navigate} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigate} />

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

      {/* Guest Reservation Modal */}
      {guestReservationPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-technical-data select-none animate-in fade-in">
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

            {guestResSuccess ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-lg font-bold font-display text-white">Reservation Confirmed!</h3>
                <p className="text-xs text-slate-300 font-mono">
                  Thank you, <strong>{guestResSuccess.name}</strong>. Your hold for "{guestResSuccess.title}" is confirmed.
                </p>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/40 text-xs font-mono text-emerald-300">
                  RESERVATION REFERENCE: <strong className="text-amber-400 font-bold">#{guestResSuccess.id}</strong>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Our master technicians have held this vintage part for you and will contact you via {guestResSuccess.contact || 'your email/phone'} shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setGuestResSuccess(null);
                    setGuestReservationPart(null);
                    setGuestResForm({ name: '', email: '', phone: '', city: '', notes: '' });
                  }}
                  className="w-full bg-[#ff7a1a] hover:bg-[#ffb68e] text-black font-bold py-3 rounded-xl uppercase tracking-wider text-xs font-mono shadow-xl transition-all cursor-pointer"
                >
                  Close & Continue Browsing
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmGuestReservation} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    YOUR FULL NAME <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    placeholder="e.g. Michael Schmidt"
                    value={guestResForm.name}
                    onChange={(e) => setGuestResForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
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
                      name="email"
                      placeholder="name@email.com"
                      value={guestResForm.email}
                      onChange={(e) => setGuestResForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      PHONE / WHATSAPP <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      name="phone"
                      placeholder="+1 (555) 019-2834"
                      value={guestResForm.phone}
                      onChange={(e) => setGuestResForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    DELIVERY CITY / STATE / COUNTRY
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Austin, Texas, USA"
                    value={guestResForm.city}
                    onChange={(e) => setGuestResForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    NOTES / COMPATIBILITY QUESTIONS (OPTIONAL)
                  </label>
                  <textarea
                    rows={2}
                    name="notes"
                    placeholder="e.g. Need confirmation for 1971 Super Beetle dual port"
                    value={guestResForm.notes}
                    onChange={(e) => setGuestResForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                {guestResError && (
                  <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-200 font-mono space-y-2 animate-in fade-in" role="alert">
                    <div className="flex items-center gap-1.5 font-bold text-rose-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Submission Error</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{guestResError}</p>
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] items-center">
                      <a href="https://wa.me/19452879865" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-bold hover:text-emerald-300">
                        WhatsApp Us
                      </a>
                      <span className="text-slate-500">•</span>
                      <a href="tel:19452879865" className="text-amber-400 underline font-bold hover:text-amber-300">
                        Call 1-945-287-9865
                      </a>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingGuestRes}
                  className="w-full min-h-[46px] bg-[#ff7a1a] hover:bg-[#ffb68e] text-black font-bold py-3 rounded-xl uppercase tracking-wider text-xs font-mono shadow-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingGuestRes ? 'Confirming Reservation...' : 'Confirm Reservation (Hold Item)'}
                </button>
              </form>
            )}
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
      />

      {/* User Authentication Modal Guard */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        onAuthSuccess={(user, token) => {
          const userRole = (user?.role || '').toLowerCase();
          const isAdmin = userRole === 'admin';

          setCurrentUser(user);
          setAuthToken(token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          if (token) localStorage.setItem('authToken', token);

          if (isAdmin && token) {
            setAdminToken(token);
            localStorage.setItem('adminToken', token);
            handleOpenAdminPanel();
          } else {
            handleOpenUserDashboard();
          }
        }}
        cartTotal={cartTotal}
      />

      {/* Admin Gateway Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={handleCloseAdminLogin}
        onAdminSuccess={(token, user) => {
          if (token) {
            setAdminToken(token);
            localStorage.setItem('adminToken', token);
          }
          if (user) {
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          handleOpenAdminPanel();
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

      {/* Sticky Mobile "Call Now" & WhatsApp Bar */}
      <StickyCallBar
        isModalOpen={Boolean(
          isCartOpen ||
          isAuthOpen ||
          isAdminLoginOpen ||
          isAdminPanelOpen ||
          isGuidedSearchOpen ||
          activeModalPart ||
          guestReservationPart
        )}
      />

    </div>
  );
}
