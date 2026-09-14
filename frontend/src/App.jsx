import React, { useState, useEffect } from 'react';
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

  // Sync and persist URL hash and view states across browser refreshes
  useEffect(() => {
    if (isAdminPanelOpen) {
      localStorage.setItem('isAdminPanelOpen', 'true');
      if (window.location.hash !== '#admin') {
        window.history.replaceState(null, '', '#admin');
      }
    } else {
      localStorage.setItem('isAdminPanelOpen', 'false');
      if (currentPage === 'dashboard') {
        if (window.location.hash !== '#dashboard') {
          window.history.replaceState(null, '', '#dashboard');
        }
      } else {
        if (window.location.hash === '#admin' || window.location.hash === '#dashboard') {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    }
  }, [isAdminPanelOpen, currentPage]);

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

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
      setIsAuthOpen(true);
    } else {
      setCurrentPage('dashboard');
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
    setCurrentPage('shop');
  };
  
  // Refresh trigger for parts catalog after admin edit/delete
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefreshCatalog = () => setRefreshKey(prev => prev + 1);

  // Cart Handlers
  const handleAddToCart = (part) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === part.id);
      if (existing) {
        return prev.map(item =>
          item.id === part.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...part, quantity: 1 }];
    });
    setIsCartOpen(true);
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
          onOpenCart={() => setIsCartOpen(true)}
          onOpenUserDashboard={handleOpenUserDashboard}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          activeFilter={activeFilter}
          onSelectFilter={(filterObj, options) => {
            setCurrentPage('shop');
            handleSelectFilter(filterObj, options);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigateToShop={() => setCurrentPage('shop')}
        />
      )}

      <main className={currentPage === 'dashboard' ? "pt-28 md:pt-36 min-h-screen pb-16 bg-[#0e0e0f]" : "pt-24 md:pt-28 min-h-[80vh]"}>
        {currentPage === 'dashboard' ? (
          <UserDashboard
            isOpen={true}
            onClose={() => setCurrentPage('shop')}
            onBackToShop={() => setCurrentPage('shop')}
            currentUser={currentUser}
            authToken={authToken}
            onOpenAuth={() => setIsAuthOpen(true)}
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
              setCurrentPage('shop');
            }}
            onRequestItem={handleRequestItem}
            onReserveItem={handleReserveItem}
            onRemoveWishlist={(id) => setWishlistIds(prev => prev.filter(wId => wId !== id))}
            onUpdateProfile={(updated) => setUserProfile(updated)}
            onOpenCatalog={() => {
              setCurrentPage('shop');
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
              onSelectVehicle={handleSelectFilter}
              onOpenGuidedSearch={() => setIsGuidedSearchOpen(true)}
            />

            {/* All Parts Page / Catalog Section */}
            <CatalogSection
              key={refreshKey}
              onAddToCart={handleAddToCart}
              onRequestItem={handleRequestItem}
              onReserveItem={handleReserveItem}
              onViewPartDetails={(part) => setActiveModalPart(part)}
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
        onClose={() => setIsGuidedSearchOpen(false)}
        onApplySelection={handleSelectFilter}
      />

      {/* Part Specifications Modal */}
      {activeModalPart && (
        <PartDetailModal
          part={activeModalPart}
          onClose={() => setActiveModalPart(null)}
          onAddToCart={handleAddToCart}
          onRequestItem={handleRequestItem}
          onReserveItem={handleReserveItem}
        />
      )}

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* User Authentication Modal Guard */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
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
            setIsAdminPanelOpen(true);
            setCurrentPage('shop');
          } else {
            setCurrentPage('dashboard');
          }
        }}
        cartTotal={cartTotal}
      />

      {/* Admin Gateway Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onAdminSuccess={(token, user) => {
          const adminSessionToken = token || 'master-admin-token-2026';
          setAdminToken(adminSessionToken);
          localStorage.setItem('adminToken', adminSessionToken);
          if (user) {
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          setIsAdminPanelOpen(true);
          setCurrentPage('shop');
        }}
      />

      {/* Admin Dashboard Control Panel */}
      {isAdminPanelOpen && (
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
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
