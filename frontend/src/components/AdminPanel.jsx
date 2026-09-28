import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/api';
import { 
  X, Plus, Trash2, Edit3, ShieldAlert, Database, Layers, Car, Check, Search, 
  RefreshCw, DollarSign, Package, FileText, CheckCircle2, AlertTriangle, Eye, 
  Upload, Tag, Box, MapPin, Calendar, Cpu, Wrench, Bell, HelpCircle, User, 
  Sliders, Settings, ShoppingCart, ArrowLeft, Image as ImageIcon, Flame, Disc, Menu,
  Video, UploadCloud, Layers3, Sparkles, LogOut, MessageSquare, Send, Mail, Phone, Clock
} from 'lucide-react';
import { 
  VW_NAV_CATEGORIES, 
  VEHICLE_SYSTEMS, 
  ADMIN_LISTING_TYPES,
  ADMIN_VEHICLE_CATEGORIES,
  ADMIN_SYSTEM_SUBCATEGORIES,
  ADMIN_MATERIAL_PRESETS,
  ADMIN_FINISH_PRESETS,
  ADMIN_CONDITION_PRESETS,
  ADMIN_PERFORMANCE_PRESETS,
  ADMIN_STORAGE_PRESETS,
  ENGINE_COMPATIBILITIES 
} from '../data/vwNavigationData';

export default function AdminPanel({ 
  isOpen, 
  onClose, 
  onLogout,
  onRefreshCatalog,
  userRequests = [],
  onUpdateUserRequestStatus,
  adminToken
}) {
  const [sidebarTab, setSidebarTab] = useState('inventory'); // 'inventory', 'orders', 'chat', 'settings'
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminActiveTab') || 'add-part'); // 'add-part', 'parts-list', 'requests-manage', 'customer-chat'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [parts, setParts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [editingPartId, setEditingPartId] = useState(null);
  const [selectedCustomerReq, setSelectedCustomerReq] = useState(null);

  // Manual Write-in Toggles & Tag Inputs for Flexible Custom Fields
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [isCustomSubcat, setIsCustomSubcat] = useState(false);
  const [isCustomEngine, setIsCustomEngine] = useState(false);
  const [isCustomCondition, setIsCustomCondition] = useState(false);
  const [isCustomPerformance, setIsCustomPerformance] = useState(false);
  const [newCustomModelTag, setNewCustomModelTag] = useState('');
  const [newCustomEngineTag, setNewCustomEngineTag] = useState('');

  // Chat & Direct Messages State - Persisted across page refreshes
  const [conversations, setConversations] = useState([]);
  const [selectedUserThread, setSelectedUserThread] = useState(() => {
    try {
      const saved = localStorage.getItem('adminSelectedThread');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const selectedThreadRef = useRef(null);
  selectedThreadRef.current = selectedUserThread;

  // Persist Admin activeTab & thread across browser refreshes
  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedUserThread) {
      localStorage.setItem('adminSelectedThread', JSON.stringify(selectedUserThread));
    } else {
      localStorage.removeItem('adminSelectedThread');
    }
  }, [selectedUserThread]);

  const [threadMessages, setThreadMessages] = useState([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const adminChatContainerRef = useRef(null);

  // Auto-scroll admin chat container ONLY (never moves page/modal)
  const scrollToAdminChatBottom = (smooth = true) => {
    if (adminChatContainerRef.current) {
      adminChatContainerRef.current.scrollTo({
        top: adminChatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Fetch all customer conversations without mutating or jumping selected thread
  const fetchConversations = async () => {
    const token = adminToken || localStorage.getItem('adminToken') || 'master-admin-token-2026';
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setConversations(data.data);
        localStorage.setItem('admin_chat_conversations', JSON.stringify(data.data));
      }
    } catch (err) {
      console.warn('Admin fetch conversations note:', err.message);
      const cached = localStorage.getItem('admin_chat_conversations');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) setConversations(parsed);
        } catch (e) {}
      }
    }
  };

  // Fetch thread messages for a specific user
  const fetchThreadMessages = async (userId, userEmail = '') => {
    if (!userId && !userEmail) return;
    const token = adminToken || localStorage.getItem('adminToken') || 'master-admin-token-2026';
    if (!token) return;
    try {
      const emailQuery = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
      const res = await fetch(`${API_BASE_URL}/api/admin/chat/messages/${encodeURIComponent(userId || 'user')}${emailQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setThreadMessages(data.data);
        localStorage.setItem(`admin_chat_thread_${userId}`, JSON.stringify(data.data));
      }
    } catch (err) {
      console.warn('Admin fetch thread error:', err.message);
      const cached = localStorage.getItem(`admin_chat_thread_${userId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) setThreadMessages(parsed);
        } catch (e) {}
      }
    }
  };

  // Polling for live chat in admin panel - stable timer that does NOT switch threads
  useEffect(() => {
    if (!isOpen) return;
    const cachedConvos = localStorage.getItem('admin_chat_conversations');
    if (cachedConvos) {
      try {
        const parsed = JSON.parse(cachedConvos);
        if (Array.isArray(parsed) && parsed.length > 0) setConversations(parsed);
      } catch (e) {}
    }
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedThreadRef.current?.userId) {
        fetchThreadMessages(selectedThreadRef.current.userId, selectedThreadRef.current.userEmail);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [adminToken, isOpen]);

  const handleSelectConversation = (convo) => {
    if (!convo) return;
    setSelectedUserThread(convo);
    fetchThreadMessages(convo.userId, convo.userEmail);
    setConversations(prev => prev.map(c => (c.userId === convo.userId || (convo.userEmail && c.userEmail === convo.userEmail)) ? { ...c, unreadCount: 0 } : c));
    setTimeout(() => scrollToAdminChatBottom(false), 80);
  };

  const handleOpenChatForRequest = (req) => {
    const targetUserId = req.userId || `user-${(req.userEmail || 'guest').replace(/[^a-zA-Z0-9]/g, '_')}`;
    const convo = {
      userId: targetUserId,
      userName: req.userName || 'Restorer Member',
      userEmail: req.userEmail || '',
      lastMessage: `Inquiry regarding Request #${req.id} (${req.partTitle})`,
      unreadCount: 0
    };
    setSelectedCustomerReq(null);
    setSidebarTab('chat');
    setActiveTab('customer-chat');
    handleSelectConversation(convo);
  };

  const handleSendAdminReply = async (presetText) => {
    const textToSend = presetText || adminReplyText;
    if (!textToSend || !textToSend.trim() || !selectedUserThread) return;

    const trimmed = textToSend.trim();
    setAdminReplyText('');
    setIsSendingReply(true);

    const token = adminToken || localStorage.getItem('adminToken') || 'master-admin-token-2026';
    const newMsg = {
      id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: selectedUserThread.userId,
      userName: selectedUserThread.userName,
      userEmail: selectedUserThread.userEmail,
      senderRole: 'ADMIN',
      senderName: 'Master Admin Engineer',
      message: trimmed,
      createdAt: new Date().toISOString()
    };

    setThreadMessages(prev => [...prev, newMsg]);

    const threadKey = `admin_chat_thread_${selectedUserThread.userId}`;
    const prevList = JSON.parse(localStorage.getItem(threadKey) || '[]');
    localStorage.setItem(threadKey, JSON.stringify([...prevList, newMsg]));

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/admin/chat/reply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: selectedUserThread.userId,
            userName: selectedUserThread.userName,
            userEmail: selectedUserThread.userEmail,
            message: trimmed
          })
        });
        fetchConversations();
        fetchThreadMessages(selectedUserThread.userId);
      } catch (err) {
        console.warn('Admin reply error:', err.message);
      }
    }

    setIsSendingReply(false);
    setTimeout(() => scrollToAdminChatBottom(true), 60);
  };

  const totalUnreadChatCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // 10-Section Form State
  const [formData, setFormData] = useState({
    // Section 1: Product Type
    listingType: 'spare-part', // 'spare-part' | 'engine' | 'vehicle'

    // Section 2: Vehicle Classification
    vehicleCategory: 'type-1',
    modelYearRange: 'Beetle 1968–1979',

    // Section 3: System Classification
    mainSystem: 'engine-system',
    subcategory: 'Cylinder Heads',

    // Section 4: Product Details
    partName: 'Dual Port Cylinder Head 1600cc',
    sku: '043-101-375-H',
    description: 'Factory original specification dual port cylinder head casting for Type 1 air-cooled engines.',

    // Section 5: Specifications
    material: 'Aluminum Alloy',
    weight: '4.8',
    dimensions: '32 x 24 x 18 cm',
    finish: 'Bare Aluminum',

    // Section 6: Engine-Specific (Conditional)
    engineSize: '1600cc',
    performanceType: 'Stock', // 'Stock' | 'Performance' | 'Racing'

    // Section 7: Condition & Status
    condition: 'New', // 'New' | 'Used' | 'Rebuilt / Restored'
    status: 'Available', // 'Available' | 'Sold' | 'Reserved'

    // Section 8: Pricing & Inventory
    retailPrice: '289.00',
    wholesalePrice: '210.00',
    stockQuantity: '12',
    storageLocation: 'Main Warehouse A (Bin 12-B)',

    // Section 9: Compatibility
    compatibleEngineSizes: ['1600cc', '1776cc'],
    compatibleModels: ['Beetle 1968–1979', 'Super Beetle (1302/1303)'],

    // Section 10: Media
    mediaImages: [],
    videoUrl: ''
  });

  // Dynamic Models based on Selected Vehicle Category
  const currentVehCategoryObj = ADMIN_VEHICLE_CATEGORIES.find(c => c.id === formData.vehicleCategory);
  const availableModelYearRanges = currentVehCategoryObj ? currentVehCategoryObj.models : [];

  // Dynamic Subcategories based on Main System
  const availableSubcategories = ADMIN_SYSTEM_SUBCATEGORIES[formData.mainSystem] || [];

  // Conditional logic for Engine Section 6
  const isEngineSectionVisible = formData.listingType === 'engine' || formData.mainSystem === 'engine-system';

  // Fetch admin catalog items (Treating server database as authoritative single source of truth)
  const fetchAdminData = async () => {
    setIsLoading(true);
    let serverParts = null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/parts`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        serverParts = data.data;
      }
    } catch (err) {
      console.warn('Backend fetch fallback to local store');
    }

    const localParts = JSON.parse(localStorage.getItem('custom_parts') || '[]');
    const deletedIds = new Set(JSON.parse(localStorage.getItem('deleted_part_ids') || '[]'));

    if (serverParts !== null && Array.isArray(serverParts)) {
      // Server database is the authoritative source of truth across all devices
      const filteredServerParts = serverParts.filter(p => !deletedIds.has(p.id));
      const serverIdSet = new Set(serverParts.map(p => p.id));
      const unsyncedLocal = localParts.filter(p => !deletedIds.has(p.id) && !serverIdSet.has(p.id));
      setParts([...unsyncedLocal, ...filteredServerParts]);
    } else {
      // Offline fallback only when backend server is completely unreachable
      const filteredLocal = localParts.filter(p => !deletedIds.has(p.id));
      setParts(filteredLocal);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Input Change Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'vehicleCategory') {
      const categoryObj = ADMIN_VEHICLE_CATEGORIES.find(c => c.id === value);
      const firstModel = categoryObj && categoryObj.models.length > 0 ? categoryObj.models[0] : '';
      setIsCustomModel(false);
      setFormData(prev => ({
        ...prev,
        vehicleCategory: value,
        modelYearRange: firstModel,
        compatibleModels: firstModel ? [firstModel] : []
      }));
    } else if (name === 'mainSystem') {
      const subcats = ADMIN_SYSTEM_SUBCATEGORIES[value] || [];
      const firstSub = subcats.length > 0 ? subcats[0] : '';
      setIsCustomSubcat(false);
      setFormData(prev => ({
        ...prev,
        mainSystem: value,
        subcategory: firstSub
      }));
    } else if (name === 'modelYearRange') {
      if (value === '__CUSTOM__') {
        setIsCustomModel(true);
      } else {
        setIsCustomModel(false);
        setFormData(prev => ({ ...prev, modelYearRange: value }));
      }
    } else if (name === 'subcategory') {
      if (value === '__CUSTOM__') {
        setIsCustomSubcat(true);
      } else {
        setIsCustomSubcat(false);
        setFormData(prev => ({ ...prev, subcategory: value }));
      }
    } else if (name === 'engineSize') {
      if (value === '__CUSTOM__') {
        setIsCustomEngine(true);
      } else {
        setIsCustomEngine(false);
        setFormData(prev => ({ ...prev, engineSize: value }));
      }
    } else if (name === 'condition') {
      if (value === '__CUSTOM__') {
        setIsCustomCondition(true);
      } else {
        setIsCustomCondition(false);
        setFormData(prev => ({ ...prev, condition: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Toggle multi-select items
  const toggleArrayItem = (fieldName, item) => {
    setFormData(prev => {
      const current = prev[fieldName] || [];
      const exists = current.includes(item);
      const updated = exists ? current.filter(i => i !== item) : [...current, item];
      return { ...prev, [fieldName]: updated };
    });
  };

  // Add custom tag to compatibleModels
  const handleAddCustomModelTag = (e) => {
    if (e) e.preventDefault();
    if (!newCustomModelTag.trim()) return;
    const tag = newCustomModelTag.trim();
    if (!formData.compatibleModels.includes(tag)) {
      setFormData(prev => ({ ...prev, compatibleModels: [...prev.compatibleModels, tag] }));
    }
    setNewCustomModelTag('');
  };

  // Add custom tag to compatibleEngineSizes
  const handleAddCustomEngineTag = (e) => {
    if (e) e.preventDefault();
    if (!newCustomEngineTag.trim()) return;
    const tag = newCustomEngineTag.trim();
    if (!formData.compatibleEngineSizes.includes(tag)) {
      setFormData(prev => ({ ...prev, compatibleEngineSizes: [...prev.compatibleEngineSizes, tag] }));
    }
    setNewCustomEngineTag('');
  };

  // Client-side Image Compression (Reduces 5MB photos to ~40KB WebP/JPEG)
  const compressImage = (file, callback, maxWidth = 800, quality = 0.75) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        callback(compressedDataUrl);
      };
    };
  };

  // Image Upload Handlers (Auto-Compressed)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      compressImage(file, (compressedBase64) => {
        setFormData(prev => ({
          ...prev,
          mediaImages: [...prev.mediaImages, compressedBase64]
        }));
      });
    });
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      mediaImages: [...prev.mediaImages, imageUrlInput.trim()]
    }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      mediaImages: prev.mediaImages.filter((_, i) => i !== index)
    }));
  };

  // Form Reset / Discard
  const handleResetForm = () => {
    setEditingPartId(null);
    setIsCustomModel(false);
    setIsCustomSubcat(false);
    setIsCustomEngine(false);
    setIsCustomCondition(false);
    setIsCustomPerformance(false);
    setNewCustomModelTag('');
    setNewCustomEngineTag('');
    setFormData({
      listingType: 'spare-part',
      vehicleCategory: 'type-1',
      modelYearRange: 'Beetle 1968–1979',
      mainSystem: 'engine-system',
      subcategory: 'Cylinder Heads',
      partName: '',
      sku: '',
      description: '',
      material: '',
      weight: '',
      dimensions: '',
      finish: '',
      engineSize: '1600cc',
      performanceType: 'Stock OEM Replacement',
      condition: 'NOS (New Old Stock - Rare Vintage)',
      status: 'Available',
      retailPrice: '',
      wholesalePrice: '',
      stockQuantity: '1',
      storageLocation: '',
      compatibleEngineSizes: ['1600cc'],
      compatibleModels: ['Beetle 1968–1979'],
      mediaImages: [],
      videoUrl: ''
    });
  };

  // Edit / Modify Part Handler
  const handleEditPart = (part) => {
    setEditingPartId(part.id);
    const categoryObj = ADMIN_VEHICLE_CATEGORIES.find(c => c.id === (part.vehicleCategory || 'type-1'));
    const validModels = categoryObj ? categoryObj.models : [];
    const isModelCustom = part.modelYearRange && !validModels.includes(part.modelYearRange);
    setIsCustomModel(Boolean(isModelCustom));

    const validSubcats = ADMIN_SYSTEM_SUBCATEGORIES[part.partSystem || part.systemCategory || 'engine-system'] || [];
    const isSubcatCustom = part.partSubcategory && !validSubcats.includes(part.partSubcategory);
    setIsCustomSubcat(Boolean(isSubcatCustom));

    const isEngCustom = part.engineSize && !ENGINE_COMPATIBILITIES.includes(part.engineSize);
    setIsCustomEngine(Boolean(isEngCustom));

    const isCondCustom = part.condition && !ADMIN_CONDITION_PRESETS.includes(part.condition);
    setIsCustomCondition(Boolean(isCondCustom));

    const isPerfCustom = part.performanceType && !ADMIN_PERFORMANCE_PRESETS.includes(part.performanceType);
    setIsCustomPerformance(Boolean(isPerfCustom));

    setFormData({
      listingType: part.listingType || 'spare-part',
      vehicleCategory: part.vehicleCategory || 'type-1',
      modelYearRange: part.modelYearRange || 'Beetle 1968–1979',
      mainSystem: part.partSystem || part.systemCategory || 'engine-system',
      subcategory: part.partSubcategory || part.subcategory || part.subcatId || 'Cylinder Heads',
      partName: part.title || '',
      sku: part.sku || part.oemNumber || '',
      description: part.description || part.provenance || '',
      material: part.material || '',
      weight: part.weight || '',
      dimensions: part.dimensions || '',
      finish: part.finish || '',
      engineSize: part.engineSize || '1600cc',
      performanceType: part.performanceType || 'Stock OEM Replacement',
      condition: part.condition || 'NOS (New Old Stock - Rare Vintage)',
      status: part.status || 'Available',
      retailPrice: part.price ? part.price.toString() : '',
      wholesalePrice: part.wholesalePrice ? part.wholesalePrice.toString() : '',
      stockQuantity: part.stock ? part.stock.toString() : '1',
      storageLocation: part.storageLocation || '',
      compatibleEngineSizes: Array.isArray(part.compatibleEngineSizes) ? part.compatibleEngineSizes : [],
      compatibleModels: Array.isArray(part.compatibleModels) ? part.compatibleModels : [],
      mediaImages: part.additionalImages && part.additionalImages.length > 0 ? part.additionalImages : (part.image ? [part.image] : []),
      videoUrl: part.videoUrl || ''
    });
    setActiveTab('add-part');
  };

  // Form Validation & Publish Submit
  const handleSaveProduct = async (saveStatus = 'Available') => {
    if (!formData.partName.trim()) {
      alert('⚠️ Required Field Missing: Please enter Part Name (Section 4).');
      return;
    }
    if (!formData.description.trim()) {
      alert('⚠️ Required Field Missing: Please enter Product Description (Section 4).');
      return;
    }
    if (!formData.retailPrice || parseFloat(formData.retailPrice) <= 0) {
      alert('⚠️ Required Field Missing: Please enter valid Retail Price (Section 8).');
      return;
    }
    if (!formData.stockQuantity) {
      alert('⚠️ Required Field Missing: Please enter Stock Quantity (Section 8).');
      return;
    }

    const targetId = editingPartId || `part-${Date.now()}`;

    const newPart = {
      id: targetId,
      title: formData.partName,
      sku: formData.sku,
      oemNumber: formData.sku,
      description: formData.description,
      listingType: formData.listingType,
      vehicleCategory: formData.vehicleCategory,
      modelYearRange: formData.modelYearRange,
      systemCategory: formData.mainSystem,
      partSystem: formData.mainSystem,
      subcatId: formData.subcategory,
      partSubcategory: formData.subcategory,
      specificPartCategory: formData.subcategory,
      material: formData.material,
      weight: formData.weight,
      dimensions: formData.dimensions,
      finish: formData.finish,
      engineSize: formData.engineSize,
      performanceType: formData.performanceType,
      condition: formData.condition,
      status: saveStatus,
      price: parseFloat(formData.retailPrice) || 0,
      wholesalePrice: parseFloat(formData.wholesalePrice) || 0,
      stock: parseInt(formData.stockQuantity) || 1,
      inStock: (parseInt(formData.stockQuantity) || 1) > 0,
      storageLocation: formData.storageLocation,
      compatibleEngineSizes: formData.compatibleEngineSizes,
      compatibleModels: formData.compatibleModels,
      image: formData.mediaImages[0] || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      additionalImages: formData.mediaImages,
      videoUrl: formData.videoUrl,
      createdAt: new Date().toISOString()
    };

    try {
      setIsLoading(true);
      
      // Save to LocalStorage immediately for instant offline/frontend persistence
      const localParts = JSON.parse(localStorage.getItem('custom_parts') || '[]');
      const filteredLocal = localParts.filter(p => p.id !== targetId);
      localStorage.setItem('custom_parts', JSON.stringify([newPart, ...filteredLocal]));

      const method = editingPartId ? 'PUT' : 'POST';
      const apiUrl = editingPartId 
        ? `${API_BASE_URL}/api/admin/parts/${editingPartId}` 
        : `${API_BASE_URL}/api/admin/parts`;

      const activeToken = adminToken || localStorage.getItem('adminToken') || 'master-admin-token-2026';
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeToken}`
      };

      const res = await fetch(apiUrl, {
        method,
        headers,
        body: JSON.stringify(newPart)
      });
      const data = await res.json();
      const actionText = editingPartId ? 'Updated' : 'Published';
      if (data.success) {
        setStatusMessage(`✅ Successfully ${actionText} "${formData.partName}" to Catalog!`);
      } else {
        setStatusMessage(`✅ ${actionText} "${formData.partName}" to Landing Page!`);
      }
    } catch (err) {
      const actionText = editingPartId ? 'Updated' : 'Published';
      setStatusMessage(`✅ ${actionText} "${formData.partName}" to Landing Page!`);
    } finally {
      setIsLoading(false);
      setEditingPartId(null);
      setTimeout(() => setStatusMessage(null), 3000);
      fetchAdminData();
      if (onRefreshCatalog) onRefreshCatalog();
      setActiveTab('parts-list');
    }
  };

  // Delete Item Handler
  const handleDeletePart = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    // Save ID to deleted_part_ids so hardcoded or server parts stay deleted
    const deletedIds = JSON.parse(localStorage.getItem('deleted_part_ids') || '[]');
    if (!deletedIds.includes(id)) {
      localStorage.setItem('deleted_part_ids', JSON.stringify([...deletedIds, id]));
    }

    // Remove from custom_parts in localStorage
    const localParts = JSON.parse(localStorage.getItem('custom_parts') || '[]');
    const updatedLocal = localParts.filter(p => p.id !== id);
    localStorage.setItem('custom_parts', JSON.stringify(updatedLocal));

    setParts(prev => prev.filter(p => p.id !== id));

    try {
      setIsLoading(true);
      const activeToken = adminToken || localStorage.getItem('adminToken') || 'master-admin-token-2026';
      const headers = {
        'Authorization': `Bearer ${activeToken}`
      };

      await fetch(`${API_BASE_URL}/api/admin/parts/${id}`, {
        method: 'DELETE',
        headers
      });
    } catch (err) {
      console.warn('Backend delete sync');
    } finally {
      setIsLoading(false);
      setStatusMessage(`Deleted "${title}"`);
      setTimeout(() => setStatusMessage(null), 3000);
      if (onRefreshCatalog) onRefreshCatalog();
    }
  };

  const filteredParts = parts.filter(p => 
    !searchQuery || 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.oemNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#131314] text-white w-screen h-screen flex flex-col md:flex-row overflow-hidden font-technical-data select-none">
      
      {/* MOBILE BACKDROP OVERLAY WHEN SIDEBAR IS OPEN */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Mobile Drawer Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fade-in cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* 1. LEFT SIDEBAR / MOBILE DRAWER NAVIGATION */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 h-full bg-[#141416] border-r border-[#262426] flex flex-col justify-between shrink-0 transition-all duration-300 overflow-hidden ${
        isSidebarOpen ? 'w-72 md:w-64 opacity-100 shadow-2xl' : 'w-0 opacity-0 p-0 border-r-0 pointer-events-none'
      }`}>
        <div className="w-72 md:w-64 flex flex-col h-full justify-between">
          <div>
            {/* Logo & Header */}
            <div className="p-4 sm:p-6 border-b border-[#262426] flex items-center justify-between">
              <div>
                <h1 className="font-h1 text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  VW Specialist
                </h1>
                <span className="text-[10px] text-[#ff7a1a] font-mono uppercase tracking-widest font-bold block mt-0.5">
                  RESTORATION ADMIN
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center p-2 text-[#a78b7d] hover:text-[#ff7a1a] hover:bg-[#201f20] rounded-xs transition-colors cursor-pointer"
                title="Close Navigation Menu"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section Navigation Links */}
            <nav className="p-3 sm:p-4 space-y-1.5 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="text-[10px] text-[#a78b7d] px-3 py-1 block uppercase font-bold tracking-widest">
                Admin Sections
              </span>

              <button
                onClick={() => { setActiveTab('add-part'); setIsSidebarOpen(false); }}
                className={`min-h-[46px] w-full flex items-center gap-3 px-3.5 py-3 rounded-xs transition-all cursor-pointer ${
                  activeTab === 'add-part' 
                    ? 'bg-[#ff7a1a] text-black shadow-md' 
                    : 'text-[#a78b7d] hover:text-white hover:bg-[#1f1e20]'
                }`}
              >
                <Box className="w-4 h-4 shrink-0" />
                <span>1. Inventory Form</span>
              </button>

              <button
                onClick={() => { setActiveTab('parts-list'); setIsSidebarOpen(false); }}
                className={`min-h-[46px] w-full flex items-center justify-between px-3.5 py-3 rounded-xs transition-all cursor-pointer ${
                  activeTab === 'parts-list' 
                    ? 'bg-[#ff7a1a] text-black shadow-md' 
                    : 'text-[#a78b7d] hover:text-white hover:bg-[#1f1e20]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  <span>2. Parts Catalog</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-xs font-bold ${activeTab === 'parts-list' ? 'bg-black text-[#ff7a1a]' : 'bg-[#262426] text-[#a78b7d]'}`}>
                  {parts.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('requests-manage'); setIsSidebarOpen(false); }}
                className={`min-h-[46px] w-full flex items-center justify-between px-3.5 py-3 rounded-xs transition-all cursor-pointer ${
                  activeTab === 'requests-manage' 
                    ? 'bg-[#ff7a1a] text-black shadow-md' 
                    : 'text-[#a78b7d] hover:text-white hover:bg-[#1f1e20]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>3. Customer Requests</span>
                </div>
                {userRequests.length > 0 && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-xs ${activeTab === 'requests-manage' ? 'bg-black text-[#ff7a1a]' : 'bg-[#ff7a1a] text-black'}`}>
                    {userRequests.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setActiveTab('customer-chat'); setIsSidebarOpen(false); }}
                className={`min-h-[46px] w-full flex items-center justify-between px-3.5 py-3 rounded-xs transition-all cursor-pointer ${
                  activeTab === 'customer-chat' 
                    ? 'bg-[#ff7a1a] text-black shadow-md' 
                    : 'text-[#a78b7d] hover:text-white hover:bg-[#1f1e20]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>4. Live Chat Portal</span>
                </div>
                {totalUnreadChatCount > 0 ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-xs bg-red-500 text-white animate-pulse">
                    {totalUnreadChatCount} NEW
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
              </button>
            </nav>
          </div>

          {/* Sidebar Footer Buttons */}
          <div className="p-4 border-t border-[#262426] space-y-2">
            <button
              onClick={() => { setActiveTab('add-part'); setIsSidebarOpen(false); }}
              className="min-h-[44px] w-full bg-[#201f20] hover:bg-[#ff7a1a] hover:text-black border border-[#584236]/60 text-[#e0c0b1] py-2 px-3 text-xs font-mono font-bold uppercase tracking-wider rounded-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Post New Part</span>
            </button>

            <button
              onClick={onLogout || onClose}
              className="min-h-[44px] w-full bg-red-900/40 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 py-2 px-3 text-xs font-mono font-bold uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>SIGN OUT OF ADMIN</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col h-full bg-[#131314] overflow-hidden relative">
        
        {/* TOP NAVBAR */}
        <header className="min-h-16 bg-[#181719] border-b border-[#262426] px-3 sm:px-6 md:px-8 py-2.5 flex items-center justify-between gap-2 shrink-0 z-10">
          
          {/* Left: 3-Line Menu Trigger + Title */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="min-h-[40px] px-2.5 sm:px-3.5 py-2 text-[#e0c0b1] hover:text-white bg-[#201f20] hover:bg-[#282729] rounded-xs border border-[#584236]/60 transition-all flex items-center gap-2 group cursor-pointer shadow-sm"
              title={isSidebarOpen ? "Close Menu" : "Open 3-Line Section Menu"}
              aria-label="Toggle Section Menu"
            >
              <Menu className="w-5 h-5 text-[#ff7a1a] group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Menu
              </span>
            </button>

            <div className="hidden min-[400px]:block">
              <h2 className="text-sm sm:text-base md:text-lg font-bold font-h2 text-white truncate flex items-center gap-2">
                <span>Specialist Admin</span>
                {activeTab === 'customer-chat' && <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#ff7a1a]/20 text-[#ff7a1a] border border-[#ff7a1a]/30 hidden sm:inline">LIVE CHAT</span>}
                {activeTab === 'requests-manage' && <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#ff7a1a]/20 text-[#ff7a1a] border border-[#ff7a1a]/30 hidden sm:inline">REQUESTS</span>}
                {activeTab === 'parts-list' && <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#ff7a1a]/20 text-[#ff7a1a] border border-[#ff7a1a]/30 hidden sm:inline">CATALOG</span>}
                {activeTab === 'add-part' && <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#ff7a1a]/20 text-[#ff7a1a] border border-[#ff7a1a]/30 hidden sm:inline">INVENTORY FORM</span>}
              </h2>
            </div>
          </div>

          {/* Right Navigation Controls */}
          {/* A. Mobile Right Quick Actions (< md) */}
          <div className="flex md:hidden items-center gap-1.5">
            <button 
              onClick={() => setActiveTab('customer-chat')}
              className={`min-h-[40px] px-2.5 py-1.5 rounded-xs font-mono text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                activeTab === 'customer-chat' 
                  ? 'bg-[#ff7a1a] text-black border-[#ff7a1a]' 
                  : 'bg-[#201f20] text-[#e0c0b1] border-[#584236]/40'
              }`}
              title="Open Live Chat"
            >
              <MessageSquare className="w-4 h-4" />
              {totalUnreadChatCount > 0 && (
                <span className="px-1 py-0.2 text-[9px] font-bold rounded-xs bg-red-500 text-white">
                  {totalUnreadChatCount}
                </span>
              )}
            </button>

            <button 
              onClick={onLogout || onClose}
              className="min-h-[40px] px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold rounded-xs flex items-center justify-center gap-1 transition-all border border-red-500 shadow-md cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* B. Desktop Full Navigation Tabs (>= md) */}
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('customer-chat')}
              className={`min-h-[38px] text-xs px-3 py-2 rounded-xs font-mono font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'customer-chat' 
                  ? 'bg-[#ff7a1a] text-black border-[#ff7a1a]' 
                  : 'bg-[#201f20] text-[#e0c0b1] border-[#584236]/40 hover:border-[#ff7a1a]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Chat</span>
              {totalUnreadChatCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-xs bg-red-500 text-white">
                  {totalUnreadChatCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('requests-manage')}
              className={`min-h-[38px] text-xs px-3 py-2 rounded-xs font-mono font-bold transition-all border cursor-pointer ${
                activeTab === 'requests-manage' 
                  ? 'bg-[#ff7a1a] text-black border-[#ff7a1a]' 
                  : 'bg-[#201f20] text-[#e0c0b1] border-[#584236]/40 hover:border-[#ff7a1a]'
              }`}
            >
              Requests ({userRequests.length})
            </button>
            <button 
              onClick={() => setActiveTab('parts-list')}
              className={`min-h-[38px] text-xs px-3 py-2 rounded-xs font-mono font-bold transition-all border cursor-pointer ${
                activeTab === 'parts-list' 
                  ? 'bg-[#ff7a1a] text-black border-[#ff7a1a]' 
                  : 'bg-[#201f20] text-[#e0c0b1] border-[#584236]/40 hover:border-[#ff7a1a]'
              }`}
            >
              Catalog ({parts.length})
            </button>
            <button 
              onClick={() => setActiveTab('add-part')}
              className={`min-h-[38px] text-xs px-3 py-2 rounded-xs font-mono font-bold transition-all border cursor-pointer ${
                activeTab === 'add-part' 
                  ? 'bg-[#ff7a1a] text-black border-[#ff7a1a]' 
                  : 'bg-[#201f20] text-[#e0c0b1] border-[#584236]/40 hover:border-[#ff7a1a]'
              }`}
            >
              + Add Item
            </button>
            <button 
              onClick={onLogout || onClose}
              className="min-h-[38px] bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold px-3 py-2 rounded-xs flex items-center gap-1.5 transition-all border border-red-500 shadow-md cursor-pointer ml-1"
              title="Sign out completely from Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>SIGN OUT</span>
            </button>
          </div>
        </header>

        {/* STATUS TOAST NOTIFICATION */}
        {statusMessage && (
          <div className="bg-[#ff7a1a] text-black font-bold text-xs py-2.5 px-8 text-center animate-fade-in shrink-0 z-20 shadow-lg">
            {statusMessage}
          </div>
        )}

        {/* WORKSPACE CONTENT SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-24">
          
          {/* TAB 1: 10-SECTION GLASSMORPHISM ADMIN FORM */}
          {activeTab === 'add-part' && (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveProduct('Available'); }} className="max-w-5xl mx-auto space-y-6">
              
              {/* Form Title Banner */}
              <div className="bg-[#181719]/80 border border-[#584236]/40 backdrop-blur-md rounded-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                <div>
                  <span className="text-[10px] text-[#ff7a1a] uppercase font-bold tracking-widest font-mono block mb-1">
                    AUTOMOTIVE PARTS & VEHICLE MARKETPLACE // INVENTORY FORM
                  </span>
                  <h1 className="text-2xl font-bold font-h2 text-white">
                    Add Automotive Part / Vehicle Listing
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-[#83cffb] hover:underline font-mono uppercase font-bold self-start md:self-auto"
                >
                  Reset All Fields
                </button>
              </div>

              {/* 📌 SECTION 1: PRODUCT TYPE (PROTECTED CATEGORIZATION) */}
              <div className="bg-[#181719]/80 border border-[#584236]/40 backdrop-blur-md rounded-md p-6 shadow-xl space-y-4 hover:border-[#ff7a1a]/50 transition-all">
                <div className="flex items-center justify-between border-b border-[#584236]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-[#ff7a1a]" />
                    <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                      SECTION 1: PRODUCT TYPE
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#ff7a1a] bg-[#ff7a1a]/10 border border-[#ff7a1a]/30 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                    🔒 Protected Placement
                  </span>
                </div>

                <div>
                  <label className="text-xs text-[#a78b7d] uppercase block mb-1.5 font-bold font-mono">
                    LISTING TYPE <span className="text-[#ff7a1a]">*</span>
                  </label>
                  <select
                    name="listingType"
                    value={formData.listingType}
                    onChange={handleInputChange}
                    className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs cursor-pointer font-mono"
                  >
                    {ADMIN_LISTING_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#a78b7d] mt-1.5 font-mono">
                    Determines top-level showcase placement (Spare Parts Catalog, Complete Engines, or Vehicle Sales). Strictly structured to maintain navigation routing.
                  </p>
                </div>
              </div>

              {/* 📌 SECTION 2: VEHICLE CLASSIFICATION */}
              <div className="bg-[#181719]/80 border border-[#584236]/40 backdrop-blur-md rounded-md p-6 shadow-xl space-y-4 hover:border-[#ff7a1a]/50 transition-all">
                <div className="flex items-center justify-between border-b border-[#584236]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-[#ff7a1a]" />
                    <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                      SECTION 2: VEHICLE CLASSIFICATION
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#83cffb] bg-[#83cffb]/10 border border-[#83cffb]/30 px-2 py-0.5 rounded font-mono font-bold">
                    Standard Platform + Custom Model
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehicle Category: LOCKED TAXONOMY */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-[#a78b7d] uppercase font-bold font-mono">
                        VEHICLE CATEGORY <span className="text-[#ff7a1a]">*</span>
                      </label>
                      <span className="text-[10px] text-[#ff7a1a] font-mono">🔒 Locked Category</span>
                    </div>
                    <select
                      name="vehicleCategory"
                      value={formData.vehicleCategory}
                      onChange={handleInputChange}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs cursor-pointer font-mono"
                    >
                      {ADMIN_VEHICLE_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-[#a78b7d] mt-1.5 font-mono">
                      Categorization determines vehicle catalog filter tabs.
                    </p>
                  </div>

                  {/* Model / Year Range: DUAL PRESET + WRITE-IN */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-[#a78b7d] uppercase font-bold font-mono">
                        MODEL / YEAR RANGE <span className="text-[#ff7a1a]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomModel(!isCustomModel)}
                        className="text-[10px] text-[#83cffb] hover:text-[#ff7a1a] hover:underline font-mono uppercase font-bold"
                      >
                        {isCustomModel ? '← Use Presets' : '✍️ Write Custom'}
                      </button>
                    </div>

                    {isCustomModel ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="modelYearRange"
                          placeholder="e.g., 1974 Super Beetle Sunroof 1303S Special Edition"
                          value={formData.modelYearRange}
                          onChange={handleInputChange}
                          className="w-full bg-[#131314] border border-[#ff7a1a] p-3 text-xs text-white focus:outline-none rounded-xs font-mono"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {availableModelYearRanges.slice(0, 4).map(mod => (
                            <button
                              key={mod}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, modelYearRange: mod }))}
                              className="text-[10px] px-2 py-0.5 bg-[#201f20] hover:bg-[#ff7a1a] hover:text-black text-[#e0c0b1] rounded border border-[#584236]/40 font-mono"
                            >
                              {mod}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <select
                        name="modelYearRange"
                        value={availableModelYearRanges.includes(formData.modelYearRange) ? formData.modelYearRange : '__CUSTOM__'}
                        onChange={handleInputChange}
                        className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs cursor-pointer font-mono"
                      >
                        {availableModelYearRanges.map(mod => (
                          <option key={mod} value={mod}>{mod}</option>
                        ))}
                        <option value="__CUSTOM__">✍️ + Write Custom Model / Year...</option>
                      </select>
                    )}
                    <p className="text-[10px] text-[#a78b7d] mt-1.5 font-mono">
                      {isCustomModel ? 'Custom model specified. Switch back to presets anytime.' : 'Choose preset or switch to write custom model/year.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 📌 SECTION 3: SYSTEM CLASSIFICATION */}
              <div className="bg-[#181719]/80 border border-[#584236]/40 backdrop-blur-md rounded-md p-6 shadow-xl space-y-4 hover:border-[#ff7a1a]/50 transition-all">
                <div className="flex items-center justify-between border-b border-[#584236]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#ff7a1a]" />
                    <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                      SECTION 3: SYSTEM CLASSIFICATION
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#83cffb] bg-[#83cffb]/10 border border-[#83cffb]/30 px-2 py-0.5 rounded font-mono font-bold">
                    Standard System + Custom Subcategory
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Main System: LOCKED TAXONOMY */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-[#a78b7d] uppercase font-bold font-mono">
                        MAIN SYSTEM <span className="text-[#ff7a1a]">*</span>
                      </label>
                      <span className="text-[10px] text-[#ff7a1a] font-mono">🔒 Locked System</span>
                    </div>
                    <select
                      name="mainSystem"
                      value={formData.mainSystem}
                      onChange={handleInputChange}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs cursor-pointer font-mono"
                    >
                      {VEHICLE_SYSTEMS.map(sys => (
                        <option key={sys.id} value={sys.id}>{sys.emoji || '⚙️'} {sys.name}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-[#a78b7d] mt-1.5 font-mono">
                      Controls the system catalog filter buttons (Engine, Brakes, Transmission, etc.).
                    </p>
                  </div>

                  {/* Subcategory: DUAL PRESET + WRITE-IN */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-[#a78b7d] uppercase font-bold font-mono">
                        SUBCATEGORY <span className="text-[#ff7a1a]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomSubcat(!isCustomSubcat)}
                        className="text-[10px] text-[#83cffb] hover:text-[#ff7a1a] hover:underline font-mono uppercase font-bold"
                      >
                        {isCustomSubcat ? '← Use Presets' : '✍️ Write Custom'}
                      </button>
                    </div>

                    {isCustomSubcat ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="subcategory"
                          placeholder="e.g., Custom CNC Billet Intake Plenum"
                          value={formData.subcategory}
                          onChange={handleInputChange}
                          className="w-full bg-[#131314] border border-[#ff7a1a] p-3 text-xs text-white focus:outline-none rounded-xs font-mono"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {availableSubcategories.slice(0, 4).map(sub => (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, subcategory: sub }))}
                              className="text-[10px] px-2 py-0.5 bg-[#201f20] hover:bg-[#ff7a1a] hover:text-black text-[#e0c0b1] rounded border border-[#584236]/40 font-mono"
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <select
                        name="subcategory"
                        value={availableSubcategories.includes(formData.subcategory) ? formData.subcategory : '__CUSTOM__'}
                        onChange={handleInputChange}
                        className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs cursor-pointer font-mono"
                      >
                        {availableSubcategories.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                        <option value="__CUSTOM__">✍️ + Write Custom Subcategory...</option>
                      </select>
                    )}
                    <p className="text-[10px] text-[#a78b7d] mt-1.5 font-mono">
                      {isCustomSubcat ? 'Custom subcategory active.' : 'Filtered by selected system.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 📌 SECTION 4: PRODUCT DETAILS */}
              <div className="bg-[#181719]/80 border border-[#584236]/40 backdrop-blur-md rounded-md p-6 shadow-xl space-y-4 hover:border-[#ff7a1a]/50 transition-all">
                <div className="flex items-center gap-2 border-b border-[#584236]/30 pb-3">
                  <FileText className="w-5 h-5 text-[#ff7a1a]" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                    SECTION 4: PRODUCT DETAILS
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-xs text-[#a78b7d] uppercase block mb-1.5 font-bold font-mono">
                      PART NAME <span className="text-[#ff7a1a]">*</span>
                    </label>
                    <input
                      type="text"
                      name="partName"
                      required
                      placeholder="e.g., Dual Port Cylinder Head 1600cc"
                      value={formData.partName}
                      onChange={handleInputChange}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#a78b7d] uppercase block mb-1.5 font-bold font-mono">
                      SKU / PART NUMBER
                    </label>
                    <input
                      type="text"
                      name="sku"
                      placeholder="e.g., 043-101-375-H"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#a78b7d] uppercase block mb-1.5 font-bold font-mono">
                    DESCRIPTION <span className="text-[#ff7a1a]">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    required
                    placeholder="Enter detailed technical description, casting numbers, valve specifications, and vehicle compatibility notes..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs font-mono"
                  ></textarea>
                </div>
              </div>

              {/* 📌 SECTION 5: SPECIFICATIONS (WITH QUICK PRESET PILLS + MANUAL WRITE-IN) */}
              <div className="bg-[#181719]/80 border border-[#584236]/40 backdrop-blur-md rounded-md p-6 shadow-xl space-y-4 hover:border-[#ff7a1a]/50 transition-all">
                <div className="flex items-center justify-between border-b border-[#584236]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-[#ff7a1a]" />
                    <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                      SECTION 5: SPECIFICATIONS
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#83cffb] font-mono">Click chips to fill or type freely</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                  {/* Material with Quick Preset Chips */}
                  <div>
                    <label className="text-xs text-[#a78b7d] uppercase block mb-1.5 font-bold">MATERIAL</label>
                    <input
                      type="text"
                      name="material"
                      placeholder="Type custom material or click preset..."
                      value={formData.material}
                      onChange={handleInputChange}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs mb-2"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {ADMIN_MATERIAL_PRESETS.map(mat => (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, material: mat }))}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                            formData.material === mat
                              ? 'bg-[#ff7a1a] text-black border-[#ff7a1a] font-bold'
                              : 'bg-[#201f20] text-[#e0c0b1] border-[#584236]/40 hover:border-[#ff7a1a]'
                          }`}
                        >
                          {mat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Finish with Quick Preset Chips */}
                  <div>
                    <label className="text-xs text-[#a78b7d] uppercase block mb-1.5 font-bold">FINISH / COATING</label>
                    <input
                      type="text"
                      name="finish"
                      placeholder="Type custom finish or click preset..."
                      value={formData.finish}
                      onChange={handleInputChange}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs mb-2"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {ADMIN_FINISH_PRESETS.map(fin => (
                        <button
                          key={fin}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, finish: fin }))}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                            formData.finish === fin
                              ? 'bg-[#ff7a1a] text-black border-[#ff7a1a] font-bold'
                              : 'bg-[#201f20] text-[#e0c0b1] border-[#584236]/40 hover:border-[#ff7a1a]'
                          }`}
                        >
                          {fin}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono pt-2 border-t border-[#584236]/20">
                  <div>
                    <label className="text-xs text-[#a78b7d] uppercase block mb-1.5 font-bold">WEIGHT (KG / LBS)</label>
                    <input
                      type="text"
                      name="weight"
                      placeholder="e.g., 4.8 kg / 10.5 lbs"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#a78b7d] uppercase block mb-1.5 font-bold">DIMENSIONS</label>
                    <input
                      type="text"
                      name="dimensions"
                      placeholder="e.g., 32 x 24 x 18 cm"
                      value={formData.dimensions}
                      onChange={handleInputChange}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 📌 SECTION 6: ENGINE-SPECIFIC (CONDITIONAL WITH PRESET + WRITE-IN) */}
              {isEngineSectionVisible && (
                <div className="bg-[#181719]/80 border border-[#ff7a1a]/60 backdrop-blur-md rounded-md p-6 shadow-xl space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-[#ff7a1a]/30 pb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#ff7a1a]" />
                      <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                        SECTION 6: ENGINE-SPECIFIC (ACTIVE)
                      </h3>
                    </div>
                    <span className="text-[10px] text-[#ff7a1a] font-mono font-bold">Preset + Custom Write-in</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                    {/* Engine Size / Displacement */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-[#a78b7d] uppercase font-bold">
                          ENGINE SIZE / DISPLACEMENT
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCustomEngine(!isCustomEngine)}
                          className="text-[10px] text-[#83cffb] hover:text-[#ff7a1a] hover:underline font-mono uppercase font-bold"
                        >
                          {isCustomEngine ? '← Preset Sizes' : '✍️ Write Custom'}
                        </button>
                      </div>

                      {isCustomEngine ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            name="engineSize"
                            placeholder="e.g., 2387cc Stroker Drag Spec"
                            value={formData.engineSize}
                            onChange={handleInputChange}
                            className="w-full bg-[#131314] border border-[#ff7a1a] p-3 text-xs text-white focus:outline-none rounded-xs font-mono"
                          />
                          <div className="flex flex-wrap gap-1.5">
                            {ENGINE_COMPATIBILITIES.slice(0, 5).map(size => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, engineSize: size }))}
                                className="text-[10px] px-2 py-0.5 bg-[#201f20] hover:bg-[#ff7a1a] hover:text-black text-[#e0c0b1] rounded border border-[#584236]/40 font-mono"
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <select
                          name="engineSize"
                          value={ENGINE_COMPATIBILITIES.includes(formData.engineSize) ? formData.engineSize : '__CUSTOM__'}
                          onChange={handleInputChange}
                          className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs cursor-pointer font-mono"
                        >
                          {ENGINE_COMPATIBILITIES.map(size => (
                            <option key={size} value={size}>{size} Air-Cooled Engine</option>
                          ))}
                          <option value="__CUSTOM__">✍️ + Write Custom Displacement...</option>
                        </select>
                      )}
                    </div>

                    {/* Performance Type */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-[#a78b7d] uppercase font-bold">
                          PERFORMANCE CATEGORY
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCustomPerformance(!isCustomPerformance)}
                          className="text-[10px] text-[#83cffb] hover:text-[#ff7a1a] hover:underline font-mono uppercase font-bold"
                        >
                          {isCustomPerformance ? '← Preset Types' : '✍️ Write Custom'}
                        </button>
                      </div>

                      {isCustomPerformance ? (
                        <input
                          type="text"
                          name="performanceType"
                          placeholder="e.g., Supercharged Methanol Drag Race"
                          value={formData.performanceType}
                          onChange={handleInputChange}
                          className="w-full bg-[#131314] border border-[#ff7a1a] p-3 text-xs text-white focus:outline-none rounded-xs font-mono"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {ADMIN_PERFORMANCE_PRESETS.map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, performanceType: type }))}
                              className={`text-xs px-2.5 py-1.5 font-bold rounded-xs border transition-all ${
                                formData.performanceType === type
                                  ? 'bg-[#ff7a1a] text-black border-[#ff7a1a]'
                                  : 'bg-[#131314] text-[#e0c0b1] border-[#584236]/60 hover:border-[#ff7a1a]'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 📌 SECTION 7: CONDITION & STATUS */}
              <div className="bg-[#181719]/80 border border-[#584236]/40 backdrop-blur-md rounded-md p-6 shadow-xl space-y-4 hover:border-[#ff7a1a]/50 transition-all">
                <div className="flex items-center justify-between border-b border-[#584236]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#ff7a1a]" />
                    <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                      SECTION 7: CONDITION & STATUS
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#83cffb] font-mono">Standardized Condition + Write-in</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                  {/* Condition with Custom Write-in Toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-[#a78b7d] uppercase font-bold">
                        CONDITION <span className="text-[#ff7a1a]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomCondition(!isCustomCondition)}
                        className="text-[10px] text-[#83cffb] hover:text-[#ff7a1a] hover:underline font-mono uppercase font-bold"
                      >
                        {isCustomCondition ? '← Preset Conditions' : '✍️ Write Custom'}
                      </button>
                    </div>

                    {isCustomCondition ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="condition"
                          placeholder="e.g., Restored with 1964 German NOS Parts"
                          value={formData.condition}
                          onChange={handleInputChange}
                          className="w-full bg-[#131314] border border-[#ff7a1a] p-3 text-xs text-white focus:outline-none rounded-xs font-mono"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {ADMIN_CONDITION_PRESETS.slice(0, 3).map(cond => (
                            <button
                              key={cond}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, condition: cond }))}
                              className="text-[10px] px-2 py-0.5 bg-[#201f20] hover:bg-[#ff7a1a] hover:text-black text-[#e0c0b1] rounded border border-[#584236]/40 font-mono"
                            >
                              {cond}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <select
                        name="condition"
                        value={ADMIN_CONDITION_PRESETS.includes(formData.condition) ? formData.condition : '__CUSTOM__'}
                        onChange={handleInputChange}
                        className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs cursor-pointer font-mono"
                      >
                        {ADMIN_CONDITION_PRESETS.map(cond => (
                          <option key={cond} value={cond}>{cond}</option>
                        ))}
                        <option value="__CUSTOM__">✍️ + Write Custom Condition...</option>
                      </select>
                    )}
                  </div>

                  {/* Availability Status */}
                  <div>
                    <label className="text-xs text-[#a78b7d] uppercase block mb-1.5 font-bold">
                      AVAILABILITY STATUS <span className="text-[#ff7a1a]">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs cursor-pointer font-mono"
                    >
                      <option value="Available">Available (In Stock & Published)</option>
                      <option value="Reserved">Reserved (Draft / Hold)</option>
                      <option value="Sold">Sold (Out of Stock)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 📌 SECTION 8: PRICING & INVENTORY */}
              <div className="bg-[#181719]/80 border border-[#584236]/40 backdrop-blur-md rounded-md p-6 shadow-xl space-y-4 hover:border-[#ff7a1a]/50 transition-all">
                <div className="flex items-center justify-between border-b border-[#584236]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#ff7a1a]" />
                    <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                      SECTION 8: PRICING & INVENTORY
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#83cffb] font-mono">Prices, Stocks & Bin Locations</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono">
                  <div>
                    <label className="text-xs text-[#a78b7d] uppercase block mb-1.5 font-bold">
                      RETAIL PRICE ($) <span className="text-[#ff7a1a]">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="retailPrice"
                      required
                      placeholder="289.00"
                      value={formData.retailPrice}
                      onChange={handleInputChange}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#a78b7d] uppercase block mb-1.5 font-bold">WHOLESALE PRICE ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="wholesalePrice"
                      placeholder="210.00"
                      value={formData.wholesalePrice}
                      onChange={handleInputChange}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#a78b7d] uppercase block mb-1.5 font-bold">
                      STOCK QUANTITY <span className="text-[#ff7a1a]">*</span>
                    </label>
                    <input
                      type="number"
                      name="stockQuantity"
                      required
                      placeholder="12"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs"
                    />
                  </div>
                </div>

                {/* Storage Location with Quick Presets */}
                <div className="pt-2 border-t border-[#584236]/20 font-mono">
                  <label className="text-xs text-[#a78b7d] uppercase block mb-1.5 font-bold">
                    STORAGE LOCATION / WAREHOUSE BIN
                  </label>
                  <input
                    type="text"
                    name="storageLocation"
                    placeholder="Type custom bin/bay or click preset..."
                    value={formData.storageLocation}
                    onChange={handleInputChange}
                    className="w-full bg-[#131314] border border-[#584236]/60 p-3 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs mb-2"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {ADMIN_STORAGE_PRESETS.map(loc => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, storageLocation: loc }))}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                          formData.storageLocation === loc
                            ? 'bg-[#ff7a1a] text-black border-[#ff7a1a] font-bold'
                            : 'bg-[#201f20] text-[#e0c0b1] border-[#584236]/40 hover:border-[#ff7a1a]'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 📌 SECTION 9: COMPATIBILITY MATRIX (MULTI-SELECT + CUSTOM TAG ADDER) */}
              <div className="bg-[#181719]/80 border border-[#584236]/40 backdrop-blur-md rounded-md p-6 shadow-xl space-y-6 hover:border-[#ff7a1a]/50 transition-all">
                <div className="flex items-center justify-between border-b border-[#584236]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#ff7a1a]" />
                    <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                      SECTION 9: COMPATIBILITY MATRIX
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#83cffb] font-mono">Presets + Add Custom Tags</span>
                </div>

                <div className="space-y-6 font-mono">
                  {/* Compatible Engine Sizes */}
                  <div>
                    <label className="text-xs text-[#a78b7d] uppercase block mb-2 font-bold flex items-center justify-between">
                      <span>COMPATIBLE ENGINE SIZES ({formData.compatibleEngineSizes.length} selected)</span>
                      <span className="text-[10px] text-[#83cffb]">Toggle chips or add custom tag below</span>
                    </label>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {Array.from(new Set([...ENGINE_COMPATIBILITIES, ...formData.compatibleEngineSizes])).map(size => {
                        const isSelected = formData.compatibleEngineSizes.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleArrayItem('compatibleEngineSizes', size)}
                            className={`text-xs px-3 py-1.5 rounded-xs font-bold border transition-all ${
                              isSelected
                                ? 'bg-[#ff7a1a] text-black border-[#ff7a1a]'
                                : 'bg-[#131314] text-[#e0c0b1] border-[#584236]/60 hover:border-[#ff7a1a]'
                            }`}
                          >
                            {size} {isSelected && '✓'}
                          </button>
                        );
                      })}
                    </div>

                    {/* Inline Custom Engine Tag Adder */}
                    <div className="flex gap-2 max-w-md">
                      <input
                        type="text"
                        placeholder="Type custom engine size (e.g., 2442cc Drag Spec)..."
                        value={newCustomEngineTag}
                        onChange={(e) => setNewCustomEngineTag(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomEngineTag(); } }}
                        className="flex-1 bg-[#131314] border border-[#584236]/60 p-2 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomEngineTag}
                        className="bg-[#201f20] hover:bg-[#ff7a1a] hover:text-black text-[#83cffb] border border-[#584236]/60 px-3 text-xs font-bold rounded-xs transition-all font-mono"
                      >
                        + Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Compatible Vehicle Models */}
                  <div className="pt-4 border-t border-[#584236]/20">
                    <label className="text-xs text-[#a78b7d] uppercase block mb-2 font-bold flex items-center justify-between">
                      <span>COMPATIBLE VEHICLE MODELS ({formData.compatibleModels.length} selected)</span>
                      <span className="text-[10px] text-[#83cffb]">Platform: {currentVehCategoryObj?.name}</span>
                    </label>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {Array.from(new Set([...availableModelYearRanges, ...formData.compatibleModels])).map(mod => {
                        const isSelected = formData.compatibleModels.includes(mod);
                        return (
                          <button
                            key={mod}
                            type="button"
                            onClick={() => toggleArrayItem('compatibleModels', mod)}
                            className={`text-xs px-3 py-1.5 rounded-xs font-bold border transition-all ${
                              isSelected
                                ? 'bg-[#ff7a1a] text-black border-[#ff7a1a]'
                                : 'bg-[#131314] text-[#e0c0b1] border-[#584236]/60 hover:border-[#ff7a1a]'
                            }`}
                          >
                            {mod} {isSelected && '✓'}
                          </button>
                        );
                      })}
                    </div>

                    {/* Inline Custom Model Tag Adder */}
                    <div className="flex gap-2 max-w-md">
                      <input
                        type="text"
                        placeholder="Type custom vehicle model/year tag..."
                        value={newCustomModelTag}
                        onChange={(e) => setNewCustomModelTag(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomModelTag(); } }}
                        className="flex-1 bg-[#131314] border border-[#584236]/60 p-2 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomModelTag}
                        className="bg-[#201f20] hover:bg-[#ff7a1a] hover:text-black text-[#83cffb] border border-[#584236]/60 px-3 text-xs font-bold rounded-xs transition-all font-mono"
                      >
                        + Add Tag
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 📌 SECTION 10: MEDIA */}
              <div className="bg-[#181719]/80 border border-[#584236]/40 backdrop-blur-md rounded-md p-6 shadow-xl space-y-4 hover:border-[#ff7a1a]/50 transition-all">
                <div className="flex items-center gap-2 border-b border-[#584236]/30 pb-3">
                  <ImageIcon className="w-5 h-5 text-[#ff7a1a]" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                    SECTION 10: MEDIA & IMAGES
                  </h3>
                </div>

                <div className="space-y-4 font-mono">
                  {/* Drag & Drop File Upload Box */}
                  <div className="border-2 border-dashed border-[#584236]/60 hover:border-[#ff7a1a] bg-[#131314] p-6 text-center rounded-xs transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <UploadCloud className="w-10 h-10 text-[#ff7a1a] mx-auto mb-2" />
                    <p className="text-xs text-[#e5e2e3] font-bold">
                      Drag & Drop Product Photos here, or <span className="text-[#ff7a1a]">Browse Files</span>
                    </p>
                    <p className="text-[10px] text-[#a78b7d] mt-1">Supports PNG, JPG, WEBP formats</p>
                  </div>

                  {/* URL Image Input Option */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Or paste Direct Image URL (https://...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 bg-[#131314] border border-[#584236]/60 p-2.5 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="bg-[#201f20] hover:bg-[#ff7a1a] text-[#e0c0b1] hover:text-black border border-[#584236]/60 px-4 text-xs font-bold rounded-xs transition-all"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Uploaded Thumbnails Preview */}
                  {formData.mediaImages.length > 0 && (
                    <div>
                      <span className="text-xs text-[#a78b7d] uppercase block mb-2 font-bold">
                        Uploaded Photos ({formData.mediaImages.length})
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        {formData.mediaImages.map((imgSrc, idx) => (
                          <div key={idx} className="relative group h-24 bg-black border border-[#584236]/50 rounded-xs overflow-hidden">
                            <img src={imgSrc} alt={`Upload ${idx+1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-xs opacity-80 hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optional Video URL */}
                  <div>
                    <label className="text-xs text-[#a78b7d] uppercase block mb-1 font-bold">
                      OPTIONAL DEMO VIDEO URL
                    </label>
                    <input
                      type="url"
                      name="videoUrl"
                      placeholder="e.g., https://youtube.com/watch?v=..."
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                      className="w-full bg-[#131314] border border-[#584236]/60 p-2.5 text-xs text-white focus:outline-none focus:border-[#ff7a1a] rounded-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 📌 STICKY BOTTOM ACTION BAR */}
              <div className="sticky bottom-0 bg-[#141416]/95 border-t border-[#ff7a1a]/40 p-4 rounded-t-md flex items-center justify-between gap-4 shadow-2xl backdrop-blur-xl z-30">
                <div className="text-xs font-mono text-[#a78b7d] hidden sm:block">
                  <span className="text-[#ff7a1a] font-bold">Ready:</span> {formData.partName || 'New Product Form'}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveProduct('Reserved')}
                    className="border border-[#584236] hover:border-[#ff7a1a] text-[#e0c0b1] hover:text-white bg-[#201f20] px-3.5 py-2 text-xs font-mono font-bold uppercase rounded-xs transition-all"
                  >
                    Save Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveProduct('Available')}
                    disabled={isLoading}
                    className="bg-[#ff7a1a] hover:bg-[#ffb68e] text-black font-mono font-bold px-4 py-2 text-xs uppercase rounded-xs transition-all shadow-[0_0_20px_rgba(255,122,26,0.4)] glow-button flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isLoading ? 'Saving...' : editingPartId ? 'Update Item' : 'Publish Product'}</span>
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* TAB: MANAGE CUSTOMER REQUESTS & RESERVATIONS */}
          {activeTab === 'requests-manage' && (
            <div className="space-y-4 font-mono max-w-5xl mx-auto">
              <div className="flex items-center justify-between border-b border-[#262426] pb-3">
                <h3 className="text-base font-bold text-[#ff7a1a] uppercase tracking-wider flex items-center gap-2">
                  <Box className="w-5 h-5" /> Customer Item Requests & Reservations ({userRequests.length})
                </h3>
                <span className="text-xs text-[#a78b7d]">Update request status live for user dashboard</span>
              </div>

              {userRequests.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#584236]/40 rounded-xs text-[#a78b7d] text-xs">
                  No active customer requests or reservations yet. Submissions from the storefront will appear here!
                </div>
              ) : (
                <div className="divide-y divide-[#262426] border border-[#262426] rounded-xs bg-[#141416]">
                  {userRequests.map((req) => (
                    <div 
                      key={req.id} 
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#181719] transition-colors cursor-pointer group"
                      onClick={() => setSelectedCustomerReq(req)}
                    >
                      <div className="flex items-center gap-4">
                        {req.partImage ? (
                          <img src={req.partImage} alt={req.partTitle} className="w-12 h-12 object-cover rounded-xs border border-[#3a383a] shrink-0" />
                        ) : (
                          <div className="w-12 h-12 bg-[#1c1b1c] border border-[#3a383a] flex items-center justify-center text-[#ff7a1a] shrink-0">
                            <Box className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] text-[#ff7a1a] font-bold block uppercase tracking-wider">
                            REQ #{req.id} • SKU: {req.sku || 'N/A'}
                          </span>
                          <h4 className="text-sm font-bold text-white group-hover:text-[#ff7a1a] transition-colors">{req.partTitle}</h4>
                          <span className="text-xs text-[#a78b7d] block mt-0.5">
                            Customer: <strong className="text-white">{req.userName || 'Restorer Member'}</strong> ({req.userEmail || 'N/A'}) • <strong className="text-[#ff7a1a]">${req.price}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenChatForRequest(req)}
                          className="bg-[#ff7a1a]/15 hover:bg-[#ff7a1a] text-[#ff7a1a] hover:text-black border border-[#ff7a1a]/40 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-xs transition-all flex items-center gap-1.5 shadow-sm"
                          title="Open In-App Live Chat with Customer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message</span>
                        </button>

                        <a
                          href={`mailto:${req.userEmail}?subject=${encodeURIComponent(`Classic Aircooled VW Works - Update on Request #${req.id} (${req.partTitle})`)}&body=${encodeURIComponent(`Hello ${req.userName || 'Restorer'},\n\nRegarding your request for ${req.partTitle} (Request ID: #${req.id}):\n\nCurrent Status: ${req.status || 'Pending'}\nPart Value: $${req.price}\n\nBest regards,\nMaster Admin Engineer\nClassic Aircooled VW Works`)}`}
                          className="bg-[#201f20] hover:bg-emerald-600 hover:text-white border border-emerald-500/40 text-emerald-400 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-xs transition-all flex items-center gap-1.5 shadow-sm"
                          title="Send Direct Email to Customer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setSelectedCustomerReq(req)}
                          className="bg-[#201f20] hover:bg-[#ff7a1a] hover:text-black border border-[#584236]/60 text-[#e0c0b1] px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-xs transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        <select
                          value={req.status || 'Pending'}
                          onChange={(e) => onUpdateUserRequestStatus && onUpdateUserRequestStatus(req.id, e.target.value)}
                          className="bg-[#1c1b1c] border border-[#ff7a1a]/60 text-xs font-bold text-[#ff7a1a] p-1.5 rounded-xs focus:outline-none"
                        >
                          <option value="Pending">Pending Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Reserved">Item Reserved</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 📌 CUSTOMER REQUEST DETAILS MODAL */}
          {selectedCustomerReq && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
              <div className="bg-[#131314] border border-[#ff7a1a]/60 text-white w-full max-w-xl rounded-xs shadow-[0_0_50px_rgba(255,122,26,0.25)] overflow-hidden my-8 animate-scale-up font-technical-data">
                
                {/* Modal Header */}
                <div className="bg-[#181719] px-6 py-4 border-b border-[#262426] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#ff7a1a] text-black font-bold flex items-center justify-center text-sm shadow-md">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Customer Request Details
                      </h3>
                      <span className="text-[10px] text-[#ff7a1a] font-mono font-bold block">
                        ID: #{selectedCustomerReq.id} • Date: {selectedCustomerReq.date || 'Today'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomerReq(null)}
                    className="p-1.5 text-[#a78b7d] hover:text-white hover:bg-[#201f20] rounded-xs transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                  
                  {/* Customer Profile Info Card */}
                  <div className="bg-[#181719] border border-[#584236]/40 p-4 rounded-xs space-y-3">
                    <div className="text-xs font-mono font-bold text-[#ff7a1a] uppercase tracking-wider border-b border-[#262426] pb-2 flex items-center justify-between">
                      <span>Customer Contact Profile</span>
                      <span className="text-[10px] bg-[#ff7a1a]/20 text-[#ff7a1a] px-2 py-0.5 rounded-xs border border-[#ff7a1a]/40">
                        VERIFIED MEMBER
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#a78b7d] block text-[10px] uppercase font-bold">Full Name</span>
                        <strong className="text-white text-sm block mt-0.5">{selectedCustomerReq.userName || 'Restorer Member'}</strong>
                      </div>

                      <div>
                        <span className="text-[#a78b7d] block text-[10px] uppercase font-bold">Email Address</span>
                        <a 
                          href={`mailto:${selectedCustomerReq.userEmail}`} 
                          className="text-[#ff7a1a] hover:underline text-xs block mt-0.5 font-mono font-bold truncate"
                        >
                          {selectedCustomerReq.userEmail || 'customer@vintagemotors.com'}
                        </a>
                      </div>

                      <div>
                        <span className="text-[#a78b7d] block text-[10px] uppercase font-bold">Phone Number</span>
                        <span className="text-white block mt-0.5 font-mono">{selectedCustomerReq.userPhone || '+1 (555) 019-2834'}</span>
                      </div>

                      <div>
                        <span className="text-[#a78b7d] block text-[10px] uppercase font-bold">Location / City</span>
                        <span className="text-white block mt-0.5">{selectedCustomerReq.userCity || selectedCustomerReq.shippingAddress || 'Los Angeles, CA'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Info Card */}
                  <div className="bg-[#181719] border border-[#584236]/40 p-4 rounded-xs space-y-3">
                    <div className="text-xs font-mono font-bold text-[#ff7a1a] uppercase tracking-wider border-b border-[#262426] pb-2">
                      Requested Part Details
                    </div>

                    <div className="flex items-start gap-4">
                      {selectedCustomerReq.partImage ? (
                        <img 
                          src={selectedCustomerReq.partImage} 
                          alt={selectedCustomerReq.partTitle} 
                          className="w-20 h-20 object-cover rounded-xs border border-[#3a383a] shrink-0" 
                        />
                      ) : (
                        <div className="w-20 h-20 bg-[#1c1b1c] border border-[#3a383a] flex items-center justify-center text-[#ff7a1a] shrink-0">
                          <Box className="w-8 h-8" />
                        </div>
                      )}

                      <div className="space-y-1 overflow-hidden">
                        <span className="text-[10px] text-[#ff7a1a] font-bold block uppercase">
                          SKU / OEM: {selectedCustomerReq.sku || 'N/A'}
                        </span>
                        <h4 className="text-sm font-bold text-white leading-tight">{selectedCustomerReq.partTitle}</h4>
                        <p className="text-xs text-[#a78b7d]">Compatibility: <strong className="text-white">{selectedCustomerReq.compatibility || 'VW Vintage Range'}</strong></p>
                        <div className="text-sm font-bold text-[#ff7a1a] font-mono pt-1">
                          ${selectedCustomerReq.price}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Update Control */}
                  <div className="bg-[#181719] border border-[#584236]/40 p-4 rounded-xs space-y-3">
                    <div className="text-xs font-mono font-bold text-[#ff7a1a] uppercase tracking-wider border-b border-[#262426] pb-2 flex items-center justify-between">
                      <span>Manage Request Status</span>
                      <span className="text-xs text-[#a78b7d]">Current: <strong className="text-white">{selectedCustomerReq.status || 'Pending'}</strong></span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <select
                        value={selectedCustomerReq.status || 'Pending'}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          setSelectedCustomerReq(prev => ({ ...prev, status: newStatus }));
                          if (onUpdateUserRequestStatus) {
                            onUpdateUserRequestStatus(selectedCustomerReq.id, newStatus);
                          }
                        }}
                        className="flex-1 bg-[#131314] border border-[#ff7a1a]/60 text-xs font-bold text-[#ff7a1a] p-2.5 rounded-xs focus:outline-none"
                      >
                        <option value="Pending">Pending Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Reserved">Item Reserved</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleOpenChatForRequest(selectedCustomerReq)}
                        className="bg-[#ff7a1a] hover:bg-[#ffb68e] text-black px-4 py-2.5 text-xs font-mono font-bold uppercase rounded-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Live Chat</span>
                      </button>

                      <a
                        href={`mailto:${selectedCustomerReq.userEmail}?subject=${encodeURIComponent(`Classic Aircooled VW Works - Update on Request #${selectedCustomerReq.id} (${selectedCustomerReq.partTitle})`)}&body=${encodeURIComponent(`Hello ${selectedCustomerReq.userName || 'Restorer'},\n\nRegarding your request for ${selectedCustomerReq.partTitle} (Request ID: #${selectedCustomerReq.id}):\n\nCurrent Status: ${selectedCustomerReq.status || 'Pending'}\nPart Value: $${selectedCustomerReq.price}\n\nBest regards,\nMaster Admin Engineer\nClassic Aircooled VW Works`)}`}
                        className="bg-[#201f20] hover:bg-emerald-600 hover:text-white border border-emerald-500/40 text-emerald-400 px-4 py-2.5 text-xs font-mono font-bold uppercase rounded-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </a>
                    </div>

                    <div className="text-[11px] text-[#a78b7d] bg-[#111112] p-2.5 rounded-xs border border-[#2d2b2e] flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#ff7a1a] shrink-0" />
                      <span>Changing status automatically sends an in-app live chat update and dispatches an email notification to <strong>{selectedCustomerReq.userEmail}</strong>.</span>
                    </div>
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="bg-[#181719] px-6 py-3 border-t border-[#262426] flex justify-end">
                  <button
                    onClick={() => setSelectedCustomerReq(null)}
                    className="bg-[#ff7a1a] hover:bg-[#ffb68e] text-black font-mono font-bold px-5 py-2 text-xs uppercase rounded-xs transition-all shadow-md"
                  >
                    Done
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: MANAGE INVENTORY LIST */}
          {activeTab === 'parts-list' && (
            <div className="space-y-4 font-mono max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a78b7d]" />
                  <input
                    type="text"
                    placeholder="Search SKU, part name, category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1c1b1c] border border-[#3a383a] pl-9 pr-3 py-2 text-xs text-white"
                  />
                </div>

                <button
                  onClick={fetchAdminData}
                  className="text-xs text-[#ff7a1a] flex items-center gap-1.5 bg-[#1c1b1c] px-4 py-2 border border-[#3a383a] hover:border-[#ff7a1a]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Sync Database
                </button>
              </div>

              <div className="divide-y divide-[#262426] border border-[#262426] rounded-xs overflow-hidden bg-[#141416]">
                {filteredParts.length === 0 ? (
                  <div className="p-8 text-center text-[#a78b7d] text-xs">
                    No matching parts found in the catalog database. Use the "+ Add Item Form" above to post inventory!
                  </div>
                ) : (
                  filteredParts.map((part) => (
                    <div key={part.id} className="p-4 hover:bg-[#1c1b1c] flex items-center justify-between gap-4 transition-all">
                      <div className="flex items-center gap-4">
                        {part.image ? (
                          <img src={part.image} alt={part.title} className="w-12 h-12 object-cover rounded-xs border border-[#3a383a]" />
                        ) : (
                          <div className="w-12 h-12 bg-[#1c1b1c] border border-[#3a383a] flex items-center justify-center text-[#584236]">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] text-[#ff7a1a] font-bold block uppercase">
                            SKU: {part.sku || 'N/A'} • {part.systemCategory || part.partSystem || 'Part'}
                          </span>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{part.title}</h4>
                          <div className="flex items-center gap-4 text-xs text-[#a78b7d] mt-1">
                            <span>PRICE: <strong className="text-green-400">${part.price}</strong></span>
                            <span>STOCK: <strong className="text-white">{part.stock || 1}</strong></span>
                            <span>STATUS: <strong className="text-[#ff7a1a]">{part.status || 'Available'}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPart(part)}
                          className="bg-[#ff7a1a]/20 hover:bg-[#ff7a1a] text-[#ff7a1a] hover:text-black border border-[#ff7a1a]/40 text-xs px-3 py-1.5 rounded-xs flex items-center gap-1 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit / Modify
                        </button>

                        <button
                          onClick={() => handleDeletePart(part.id, part.title)}
                          className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-black border border-red-500/40 text-xs px-3 py-1.5 rounded-xs flex items-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER LIVE CHAT CONSOLE */}
          {activeTab === 'customer-chat' && (
            <div className="h-full flex flex-col space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#262426]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-h2 text-white uppercase tracking-tight">
                      Customer Live Messages & Inquiry Portal
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      LIVE DISPATCH
                    </span>
                  </div>
                  <p className="text-xs text-[#a78b7d] mt-0.5">
                    Real-time direct chat with registered customers and restorer members.
                  </p>
                </div>

                <button
                  onClick={fetchConversations}
                  className="text-xs text-[#ff7a1a] flex items-center gap-1.5 bg-[#1c1b1c] px-4 py-2 border border-[#3a383a] hover:border-[#ff7a1a] self-start sm:self-auto rounded-xs transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Threads
                </button>
              </div>

              {/* Two Column / Master-Detail Layout */}
              <div className="flex-1 flex flex-col md:grid md:grid-cols-3 gap-4 min-h-0">
                
                {/* Left Panel: Conversation List */}
                <div className={`md:col-span-1 bg-[#141416] border border-[#262426] rounded-xs flex flex-col overflow-hidden h-[calc(100vh-230px)] min-h-[480px] max-h-[700px] ${
                  selectedUserThread ? 'hidden md:flex' : 'flex'
                }`}>
                  {/* Search Bar */}
                  <div className="p-3 border-b border-[#262426] bg-[#181719] shrink-0">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#a78b7d]" />
                      <input
                        type="text"
                        placeholder="Search customers or emails..."
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        className="w-full min-h-[38px] bg-[#0e0e0f] border border-[#3a383a] rounded-xs pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#a78b7d] focus:outline-none focus:border-[#ff7a1a] font-mono"
                      />
                    </div>
                  </div>

                  {/* List of Customers */}
                  <div className="flex-1 overflow-y-auto divide-y divide-[#262426]">
                    {conversations
                      .filter(c => 
                        !chatSearchQuery || 
                        c.userName?.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                        c.userEmail?.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                        c.lastMessage?.toLowerCase().includes(chatSearchQuery.toLowerCase())
                      )
                      .length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#a78b7d] space-y-2">
                          <MessageSquare className="w-6 h-6 mx-auto opacity-40 text-[#ff7a1a]" />
                          <p>No active customer conversations yet.</p>
                        </div>
                      ) : (
                        conversations
                          .filter(c => 
                            !chatSearchQuery || 
                            c.userName?.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                            c.userEmail?.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                            c.lastMessage?.toLowerCase().includes(chatSearchQuery.toLowerCase())
                          )
                          .map((convo) => {
                            const isSelected = selectedUserThread?.userId === convo.userId;
                            return (
                              <button
                                key={convo.userId}
                                onClick={() => handleSelectConversation(convo)}
                                className={`w-full text-left p-3.5 flex items-start gap-3 transition-all cursor-pointer min-h-[58px] ${
                                  isSelected 
                                    ? 'bg-[#222022] border-l-4 border-l-[#ff7a1a]' 
                                    : 'hover:bg-[#1a191b]'
                                }`}
                              >
                                <div className="w-9 h-9 rounded-full bg-[#ff7a1a]/20 border border-[#ff7a1a]/40 text-[#ff7a1a] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                  {convo.userName ? convo.userName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <h4 className="text-xs font-bold text-white truncate">{convo.userName}</h4>
                                    <span className="text-[9px] text-[#a78b7d] font-mono shrink-0">
                                      {convo.lastMessageTime ? new Date(convo.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-[#83cffb] font-mono truncate">{convo.userEmail || 'Customer Member'}</div>
                                  <p className="text-[11px] text-[#a78b7d] truncate mt-1">{convo.lastMessage}</p>
                                </div>
                                {convo.unreadCount > 0 && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-[#ff7a1a] text-black shrink-0 self-center">
                                    {convo.unreadCount}
                                  </span>
                                )}
                              </button>
                            );
                          })
                      )}
                  </div>
                </div>

                {/* Right Panel: Active Chat Thread View */}
                <div className={`md:col-span-2 bg-[#141416] border border-[#262426] rounded-xs flex flex-col overflow-hidden h-[calc(100vh-230px)] min-h-[480px] max-h-[700px] ${
                  selectedUserThread ? 'flex' : 'hidden md:flex'
                }`}>
                  {selectedUserThread ? (
                    <>
                      {/* Thread Header with Mobile Back Button */}
                      <div className="p-3 sm:p-3.5 bg-[#181719] border-b border-[#262426] flex items-center justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          {/* Mobile Back Button to Customer List */}
                          <button
                            type="button"
                            onClick={() => setSelectedUserThread(null)}
                            className="md:hidden min-h-[36px] min-w-[36px] flex items-center justify-center p-2 bg-[#201f20] hover:bg-[#ff7a1a] text-[#e0c0b1] hover:text-black border border-[#584236]/60 rounded-xs transition-colors cursor-pointer shrink-0"
                            title="Back to Customer List"
                            aria-label="Back to Customer List"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>

                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#ff7a1a]/20 border border-[#ff7a1a]/40 text-[#ff7a1a] flex items-center justify-center font-bold text-xs shrink-0">
                            {selectedUserThread.userName ? selectedUserThread.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs sm:text-sm font-bold text-white truncate">{selectedUserThread.userName}</h4>
                              <span className="text-[9px] px-1.5 py-0.2 bg-[#83cffb]/20 text-[#83cffb] border border-[#83cffb]/30 rounded-xs font-mono shrink-0">
                                Restorer
                              </span>
                            </div>
                            <span className="text-[10px] text-[#a78b7d] font-mono block truncate">
                              ✉️ {selectedUserThread.userEmail}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 shrink-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="hidden sm:inline">Thread Active</span>
                        </span>
                      </div>

                      {/* Quick Admin Canned Responses */}
                      <div className="p-2 bg-[#1b1a1c] border-b border-[#262426] flex items-center gap-2 overflow-x-auto text-[11px] font-mono no-scrollbar shrink-0">
                        <span className="text-[#a78b7d] uppercase text-[9px] shrink-0 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#ff7a1a]" /> Quick:
                        </span>
                        <button 
                          type="button"
                          onClick={() => handleSendAdminReply("Hello! Yes, that item is in stock and crated ready for global dispatch.")}
                          className="shrink-0 min-h-[30px] bg-[#222123] hover:bg-[#ff7a1a] text-[#e0c0b1] hover:text-black px-2.5 py-1 rounded-xs border border-[#3a383a] transition-all text-[10px] cursor-pointer"
                        >
                          📦 In Stock
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleSendAdminReply("Please send your engine case casting code (AS41, Single/Dual relief) so we can verify exact fitment.")}
                          className="shrink-0 min-h-[30px] bg-[#222123] hover:bg-[#ff7a1a] text-[#e0c0b1] hover:text-black px-2.5 py-1 rounded-xs border border-[#3a383a] transition-all text-[10px] cursor-pointer"
                        >
                          🔧 Casting Code
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleSendAdminReply("We can offer a special 10% restorer bundle discount for this complete set.")}
                          className="shrink-0 min-h-[30px] bg-[#222123] hover:bg-[#ff7a1a] text-[#e0c0b1] hover:text-black px-2.5 py-1 rounded-xs border border-[#3a383a] transition-all text-[10px] cursor-pointer"
                        >
                          💰 10% Discount
                        </button>
                      </div>

                      {/* Messages Scroll Area */}
                      <div ref={adminChatContainerRef} className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-[#101011]">
                        {threadMessages.map((msg, idx) => {
                          const isAdmin = msg.senderRole === 'ADMIN';
                          return (
                            <div 
                              key={msg.id || idx}
                              className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-[#a78b7d] font-mono">
                                <span>{isAdmin ? 'Master Admin Engineer (You)' : selectedUserThread.userName}</span>
                                <span>•</span>
                                <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                              </div>

                              <div 
                                className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-xs text-xs leading-relaxed ${
                                  isAdmin 
                                    ? 'bg-[#ff7a1a] text-black font-semibold shadow-md rounded-tr-none'
                                    : 'bg-[#201f20] text-[#e5e2e3] border border-[#584236]/60 shadow-md rounded-tl-none'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{msg.message}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Reply Input Box - Always sticky and accessible at bottom */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendAdminReply();
                        }}
                        className="p-2.5 sm:p-3 bg-[#181719] border-t border-[#262426] flex items-center gap-2 shrink-0"
                      >
                        <input
                          type="text"
                          placeholder={`Reply to ${selectedUserThread.userName}...`}
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          className="flex-1 min-h-[44px] bg-[#0e0e0f] border border-[#3a383a] rounded-xs px-3.5 py-2 text-xs sm:text-sm text-white placeholder-[#a78b7d] focus:outline-none focus:border-[#ff7a1a] font-mono"
                        />
                        <button
                          type="submit"
                          disabled={isSendingReply || !adminReplyText.trim()}
                          className="min-h-[44px] bg-[#ff7a1a] hover:bg-[#ffb68e] disabled:opacity-40 text-black font-bold text-xs uppercase px-4 sm:px-5 py-2 rounded-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Reply</span>
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#a78b7d] space-y-3">
                      <MessageSquare className="w-10 h-10 text-[#ff7a1a] opacity-50" />
                      <h4 className="text-sm font-bold text-white uppercase font-mono">Select a Customer Conversation</h4>
                      <p className="text-xs max-w-xs">
                        Pick a customer thread from the left panel to review inquiry history and send immediate responses.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
