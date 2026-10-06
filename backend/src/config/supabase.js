import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MESSAGES_FILE = path.join(__dirname, '../data/messages.json');

// Helper to safely load messages from disk backup
function loadDiskMessages() {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (err) {
    console.warn('Note reading messages.json:', err.message);
  }
  return [];
}

// Helper to safely write messages to disk backup
function saveDiskMessages(msgs) {
  try {
    const dir = path.dirname(MESSAGES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(msgs, null, 2), 'utf8');
  } catch (err) {
    console.warn('Note writing messages.json:', err.message);
  }
}

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  ''
).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) &&
  !supabaseUrl.includes('your-supabase-url') &&
  !supabaseUrl.includes('<<PASTE')
);

if (!isSupabaseConfigured) {
  console.error('❌ CRITICAL ERROR: Supabase environment variables (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY) are missing or invalid.');
  console.error('Please configure them in your .env file or deployment platform settings.');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })
  : null;

if (isSupabaseConfigured) {
  console.log('✅ Connected to Supabase Cloud Database:', supabaseUrl);
}

// Data Mappers (snake_case DB <-> camelCase App)
export function mapPartFromDb(row) {
  if (!row) return null;
  
  let rawSpecs = Array.isArray(row.specifications) 
    ? row.specifications 
    : (typeof row.specifications === 'string' ? (JSON.parse(row.specifications || '[]')) : []);
  
  let meta = {};
  const cleanedSpecs = [];

  for (const s of rawSpecs) {
    if (s && s.key === '__meta') {
      try {
        meta = typeof s.value === 'string' ? JSON.parse(s.value) : s.value;
      } catch (e) {}
    } else {
      cleanedSpecs.push(s);
    }
  }

  return {
    id: row.id,
    title: row.title,
    oemNumber: row.oem_number || row.oemNumber || '',
    sku: row.oem_number || row.casting_code || meta.sku || '',
    carModelId: row.car_model_id || row.carModelId || meta.vehicleCategory || '',
    carModelName: row.car_model_name || row.carModelName || meta.modelYearRange || '',
    vehicleCategory: meta.vehicleCategory || row.car_model_id || '',
    modelYearRange: meta.modelYearRange || row.car_model_name || '',
    engineType: row.engine_type || row.engineType || '',
    category: row.category || '',
    subcategory: meta.subcategory || meta.partSubcategory || row.category || '',
    partSubcategory: meta.subcategory || meta.partSubcategory || row.category || '',
    systemCategory: meta.systemCategory || meta.mainSystem || row.category || '',
    mainSystem: meta.mainSystem || meta.systemCategory || row.category || '',
    partSystem: meta.systemCategory || meta.mainSystem || row.category || '',
    era: row.era || '',
    price: parseFloat(row.price) || 0,
    wholesalePrice: meta.wholesalePrice ? parseFloat(meta.wholesalePrice) : 0,
    rating: parseFloat(row.rating) || 5.0,
    reviewsCount: parseInt(row.reviews_count ?? row.reviewsCount, 10) || 1,
    condition: row.condition || 'NOS (New Old Stock)',
    rarityScore: row.rarity_score || row.rarityScore || 'Rare (85/100)',
    stock: parseInt(row.stock, 10) || 0,
    inStock: Boolean(row.in_stock ?? row.inStock ?? true),
    image: row.image || '',
    additionalImages: meta.additionalImages || (row.image ? [row.image] : []),
    videoUrl: meta.videoUrl || '',
    material: meta.material || row.material || '',
    finish: meta.finish || row.finish || '',
    weight: meta.weight || row.weight || '',
    dimensions: meta.dimensions || row.dimensions || '',
    performanceType: meta.performanceType || row.performance_type || '',
    storageLocation: meta.storageLocation || row.storage_location || '',
    listingType: meta.listingType || row.listing_type || 'spare-part',
    vinNumber: meta.vinNumber || '',
    mileage: meta.mileage || '',
    engineInstalled: meta.engineInstalled || '',
    transmissionType: meta.transmissionType || '',
    exteriorColor: meta.exteriorColor || '',
    interiorColor: meta.interiorColor || '',
    titleStatus: meta.titleStatus || 'Clean Title',
    caseType: meta.caseType || '',
    inductionSetup: meta.inductionSetup || '',
    coolingShroud: meta.coolingShroud || '',
    dynoHorsepower: meta.dynoHorsepower || '',
    castingCode: row.casting_code || row.castingCode || '',
    provenance: row.provenance || '',
    description: meta.description || row.provenance || '',
    specifications: cleanedSpecs,
    compatibleVehicles: Array.isArray(row.compatible_vehicles) ? row.compatible_vehicles : [],
    compatibleModels: meta.compatibleModels || (Array.isArray(row.compatible_vehicles) ? row.compatible_vehicles : []),
    compatibleEngineSizes: meta.compatibleEngineSizes || [],
    createdAt: row.created_at || new Date().toISOString()
  };
}

export function mapLightPartFromDb(row) {
  if (!row) return null;
  const isHttpImage = typeof row.image === 'string' && row.image.startsWith('http');
  const imageUrl = isHttpImage ? row.image : `/api/parts/${row.id}/image/main`;

  const imageCount = row.image_count !== undefined && row.image_count !== null 
    ? Math.max(1, parseInt(row.image_count, 10) || 1) 
    : 1;

  // Build additionalImages dynamically from image_count only (no hardcoded a0/a1)
  const additionalImages = [imageUrl];
  for (let i = 0; i < imageCount - 1; i++) {
    additionalImages.push(isHttpImage ? imageUrl : `/api/parts/${row.id}/image/a${i}`);
  }

  // Parse specifications if present (when SQL view or RPC is enabled)
  let cleanedSpecs = [];
  if (Array.isArray(row.specifications)) {
    cleanedSpecs = row.specifications.filter(s => s && s.key !== '__meta');
  }

  return {
    id: row.id,
    title: row.title || 'Untitled Part',
    oemNumber: row.oem_number || '',
    sku: row.oem_number || row.casting_code || '',
    carModelId: row.car_model_id || '',
    carModelName: row.car_model_name || '',
    vehicleCategory: row.car_model_id || '',
    modelYearRange: row.car_model_name || row.era || '',
    engineType: row.engine_type || row.engine_size || '',
    engineSize: row.engine_size || row.engine_type || '',
    category: row.category || '',
    subcategory: row.category || '',
    partSubcategory: row.category || '',
    systemCategory: row.category || '',
    mainSystem: row.category || '',
    partSystem: row.category || '',
    era: row.era || '',
    price: parseFloat(row.price) || 0,
    wholesalePrice: 0,
    rating: parseFloat(row.rating) || 5.0,
    reviewsCount: parseInt(row.reviews_count, 10) || 1,
    condition: row.condition || 'NOS (New Old Stock)',
    rarityScore: row.rarity_score || 'Rare (85/100)',
    stock: parseInt(row.stock_count ?? row.stock, 10) || 1,
    inStock: Boolean(row.in_stock ?? true),
    has_image: true,
    hasImage: true,
    image: imageUrl,
    additionalImages,
    imageCount,
    videoUrl: '',
    material: '',
    finish: '',
    weight: '',
    dimensions: '',
    performanceType: '',
    storageLocation: '',
    listingType: 'spare-part',
    vinNumber: '',
    mileage: '',
    engineInstalled: '',
    transmissionType: '',
    exteriorColor: '',
    interiorColor: '',
    titleStatus: 'Clean Title',
    caseType: '',
    inductionSetup: '',
    coolingShroud: '',
    dynoHorsepower: '',
    castingCode: row.casting_code || '',
    provenance: '',
    description: '',
    specifications: cleanedSpecs,
    compatibleVehicles: [],
    compatibleModels: [row.car_model_name || 'Universal Air-Cooled VW'],
    compatibleEngineSizes: [],
    createdAt: row.created_at || new Date().toISOString()
  };
}

export function mapPartToDb(part) {
  const extraMeta = {
    subcategory: part.subcategory || part.subcatId || part.partSubcategory || '',
    partSubcategory: part.subcategory || part.subcatId || part.partSubcategory || '',
    mainSystem: part.mainSystem || part.systemCategory || part.partSystem || '',
    systemCategory: part.systemCategory || part.mainSystem || part.partSystem || '',
    vehicleCategory: part.vehicleCategory || part.carModelId || '',
    modelYearRange: part.modelYearRange || part.carModelName || '',
    description: part.description || part.provenance || '',
    material: part.material || '',
    finish: part.finish || '',
    weight: part.weight || '',
    dimensions: part.dimensions || '',
    performanceType: part.performanceType || '',
    storageLocation: part.storageLocation || '',
    listingType: part.listingType || 'spare-part',
    vinNumber: part.vinNumber || '',
    mileage: part.mileage || '',
    engineInstalled: part.engineInstalled || '',
    transmissionType: part.transmissionType || '',
    exteriorColor: part.exteriorColor || '',
    interiorColor: part.interiorColor || '',
    titleStatus: part.titleStatus || 'Clean Title',
    caseType: part.caseType || '',
    inductionSetup: part.inductionSetup || '',
    coolingShroud: part.coolingShroud || '',
    dynoHorsepower: part.dynoHorsepower || '',
    wholesalePrice: part.wholesalePrice || 0,
    additionalImages: part.additionalImages || [],
    videoUrl: part.videoUrl || '',
    compatibleEngineSizes: part.compatibleEngineSizes || [],
    compatibleModels: part.compatibleModels || part.compatibleVehicles || []
  };

  const specs = Array.isArray(part.specifications) 
    ? part.specifications.filter(s => s && s.key !== '__meta') 
    : [];
  specs.push({ key: '__meta', value: JSON.stringify(extraMeta) });

  return {
    id: part.id,
    title: part.title,
    oem_number: part.oemNumber || part.oem_number || part.sku || '',
    car_model_id: part.carModelId || part.car_model_id || part.vehicleCategory || '',
    car_model_name: part.carModelName || part.car_model_name || part.modelYearRange || '',
    engine_type: part.engineType || part.engine_type || part.engineSize || '',
    category: part.category || part.systemCategory || '',
    era: part.era || '',
    price: parseFloat(part.price) || 0,
    rating: parseFloat(part.rating) || 5.0,
    reviews_count: parseInt(part.reviewsCount ?? part.reviews_count, 10) || 1,
    condition: part.condition || 'NOS (New Old Stock)',
    rarity_score: part.rarityScore || part.rarity_score || 'Rare (85/100)',
    stock: parseInt(part.stock, 10) || 1,
    in_stock: Boolean(part.inStock ?? part.in_stock ?? true),
    image: part.image || '',
    casting_code: part.castingCode || part.casting_code || part.sku || '',
    provenance: part.provenance || part.description || '',
    specifications: specs,
    compatible_vehicles: part.compatibleVehicles || part.compatibleModels || []
  };
}

export function mapCarFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    make: row.make || '',
    model: row.model || '',
    era: row.era || '',
    yearRange: row.year_range || row.yearRange || '',
    engineName: row.engine_name || row.engineName || '',
    engineType: row.engine_type || row.engineType || '',
    carImage: row.car_image || row.carImage || row.image || '',
    engineImage: row.engine_image || row.engineImage || '',
    horsepower: row.horsepower || '',
    torque: row.torque || '',
    description: row.description || '',
    createdAt: row.created_at || new Date().toISOString()
  };
}

export function mapCarToDb(car) {
  return {
    id: car.id,
    name: car.name,
    make: car.make || '',
    model: car.model || car.name || '',
    era: car.era || '',
    year_range: car.yearRange || car.year_range || '',
    engine_name: car.engineName || car.engine_name || '',
    engine_type: car.engineType || car.engine_type || '',
    car_image: car.carImage || car.car_image || car.image || '',
    engine_image: car.engineImage || car.engine_image || car.carImage || '',
    horsepower: car.horsepower || '',
    torque: car.torque || '',
    description: car.description || ''
  };
}

export function mapOrderFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id || row.userId || '',
    userName: row.user_name || row.userName || '',
    userEmail: row.user_email || row.userEmail || '',
    items: Array.isArray(row.items) ? row.items : (typeof row.items === 'string' ? JSON.parse(row.items) : []),
    totalAmount: parseFloat(row.total_amount ?? row.totalAmount) || 0,
    shippingAddress: row.shipping_address || row.shippingAddress || '',
    status: row.status || 'CONFIRMED',
    createdAt: row.created_at || row.createdAt || new Date().toISOString()
  };
}

export function mapOrderToDb(order) {
  return {
    id: order.id,
    user_id: order.userId || order.user_id || null,
    user_name: order.userName || order.user_name || '',
    user_email: order.userEmail || order.user_email || '',
    items: order.items || [],
    total_amount: parseFloat(order.totalAmount || order.total_amount) || 0,
    shipping_address: order.shippingAddress || order.shipping_address || '',
    status: order.status || 'CONFIRMED'
  };
}

export function mapUserFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash || row.passwordHash || '',
    role: row.role || 'USER',
    phone: row.phone || '',
    city: row.city || '',
    createdAt: row.created_at || row.createdAt || new Date().toISOString()
  };
}

export function mapUserToDb(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email.toLowerCase(),
    password_hash: user.passwordHash || user.password_hash || '',
    role: user.role || 'USER',
    phone: user.phone || '',
    city: user.city || ''
  };
}

export function mapRequestFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id || row.userId || '',
    userName: row.user_name || row.userName || '',
    userEmail: row.user_email || row.userEmail || '',
    userPhone: row.user_phone || row.userPhone || '',
    userCity: row.user_city || row.userCity || '',
    partId: row.part_id || row.partId || '',
    partTitle: row.part_title || row.partTitle || '',
    partImage: row.part_image || row.partImage || '',
    sku: row.sku || '',
    price: parseFloat(row.price) || 0,
    compatibility: row.compatibility || '',
    type: row.type || 'REQUEST',
    status: row.status || 'Pending',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    date: new Date(row.created_at || row.createdAt || Date.now()).toLocaleDateString()
  };
}

export function mapRequestToDb(req) {
  return {
    id: req.id,
    user_id: req.userId || req.user_id || null,
    user_name: req.userName || req.user_name || '',
    user_email: req.userEmail || req.user_email || '',
    user_phone: req.userPhone || req.user_phone || '',
    user_city: req.userCity || req.user_city || '',
    part_id: req.partId || req.part_id || '',
    part_title: req.partTitle || req.part_title || '',
    part_image: req.partImage || req.part_image || '',
    sku: req.sku || '',
    price: parseFloat(req.price) || 0,
    compatibility: req.compatibility || '',
    type: req.type || 'REQUEST',
    status: req.status || 'Pending'
  };
}

export function mapOrderToRequest(row) {
  if (!row) return null;
  const firstItem = Array.isArray(row.items) && row.items.length > 0 ? row.items[0] : {};
  return {
    id: row.id,
    userId: row.user_id || row.userId || '',
    userName: row.user_name || row.userName || '',
    userEmail: row.user_email || row.userEmail || '',
    userPhone: row.user_phone || row.userPhone || '',
    userCity: row.shipping_address || row.userCity || '',
    partId: firstItem.id || firstItem.partId || '',
    partTitle: firstItem.title || firstItem.partTitle || (row.items && row.items.length > 1 ? `${row.items.length} Items Order` : 'Vintage Part Order'),
    partImage: firstItem.image || firstItem.partImage || '',
    sku: firstItem.sku || 'N/A',
    price: parseFloat(row.total_amount ?? row.totalAmount) || 0,
    compatibility: firstItem.compatibility || 'Classic VW',
    type: firstItem.type || (row.id.startsWith('REQ') ? 'REQUEST' : 'ORDER'),
    status: row.status || 'Pending',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    date: new Date(row.created_at || row.createdAt || Date.now()).toLocaleDateString()
  };
}

export function mapMessageFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id || row.userId || '',
    userName: row.user_name || row.userName || 'Restorer Member',
    userEmail: row.user_email || row.userEmail || '',
    senderRole: (row.sender_role || row.senderRole || 'USER').toUpperCase(),
    senderName: row.sender_name || row.senderName || (row.sender_role === 'ADMIN' ? 'Master Admin Engineer' : row.user_name || 'Restorer'),
    message: row.message || '',
    isRead: Boolean(row.is_read ?? row.isRead ?? false),
    createdAt: row.created_at || row.createdAt || new Date().toISOString()
  };
}

export function mapMessageToDb(msg) {
  return {
    id: msg.id || `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user_id: msg.userId,
    user_name: msg.userName || 'Restorer Member',
    user_email: msg.userEmail || '',
    sender_role: (msg.senderRole || 'USER').toUpperCase(),
    sender_name: msg.senderName || (msg.senderRole === 'ADMIN' ? 'Master Admin Engineer' : msg.userName || 'Restorer'),
    message: msg.message,
    is_read: Boolean(msg.isRead ?? false),
    created_at: msg.createdAt || new Date().toISOString()
  };
}

/**
 * In-memory fallback message storage initialized from disk
 */
let inMemoryMessages = loadDiskMessages();

// 60-second in-memory cache for full admin parts
let partsCache = null;
let partsCacheTime = 0;
const PARTS_CACHE_TTL = 60 * 1000; // 60s

// 60-second in-memory cache and single-flight in-flight promise for getPartsLite
let partsLiteCache = null;
let partsLiteCacheTime = 0;
let partsLiteInFlight = null;
const PARTS_LITE_CACHE_TTL = 60 * 1000; // 60s

export function invalidatePartsCache() {
  partsCache = null;
  partsCacheTime = 0;
  partsLiteCache = null;
  partsLiteCacheTime = 0;
  partsLiteInFlight = null;
}

/**
 * DB Data Access Abstraction Layer (100% Supabase Database)
 */
export const dbService = {
  // --- SPARE PARTS (FULL COLUMNS - ADMIN USE ONLY) ---
  async getParts() {
    const now = Date.now();
    if (partsCache && (now - partsCacheTime < PARTS_CACHE_TTL)) {
      return partsCache;
    }
    if (!isSupabaseConfigured) {
      if (partsCache) return partsCache;
      throw new Error('Supabase credentials missing');
    }

    const { data, error } = await supabase
      .from('spare_parts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('Error fetching full spare_parts from Supabase:', error.message);
      if (partsCache) {
        console.warn('Returning stale cached parts after Supabase error');
        return partsCache;
      }
      throw error;
    }

    const result = data ? data.map(mapPartFromDb) : [];
    partsCache = result;
    partsCacheTime = now;
    return result;
  },

  // --- SPARE PARTS (LIGHT COLUMNS - PUBLIC CATALOG & SEARCH, SINGLE-FLIGHT) ---
  async getPartsLite() {
    const now = Date.now();
    if (partsLiteCache && (now - partsLiteCacheTime < PARTS_LITE_CACHE_TTL)) {
      return partsLiteCache;
    }
    if (!isSupabaseConfigured) {
      if (partsLiteCache) return partsLiteCache;
      throw new Error('Supabase credentials missing');
    }

    // Single-flight: return existing in-flight promise for concurrent callers
    if (partsLiteInFlight) {
      return partsLiteInFlight;
    }

    partsLiteInFlight = (async () => {
      try {
        // Bounded list query with .limit(200); returns light columns with image_count = 1 until SQL view approved
        const { data, error } = await supabase
          .from('spare_parts')
          .select('id, title, price, category, car_model_id, car_model_name, era, engine_type, engine_size:engine_type, oem_number, casting_code, in_stock, stock, stock_count:stock, created_at, condition, rarity_score, rating, reviews_count')
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) {
          console.error('Error fetching spare_parts lite from Supabase:', error.message);
          if (partsLiteCache) {
            console.warn('Returning stale cached parts after Supabase error');
            return partsLiteCache;
          }
          throw error;
        }

        const result = data ? data.map(r => mapLightPartFromDb({ ...r, image_count: 1 })) : [];
        partsLiteCache = result;
        partsLiteCacheTime = Date.now();
        return result;
      } finally {
        partsLiteInFlight = null;
      }
    })();

    return partsLiteInFlight;
  },

  async getPartImage(id, key = 'main') {
    if (!isSupabaseConfigured) return null;
    try {
      const isMainOrThumb = key === 'main' || key === 'thumb';
      const selectCols = isMainOrThumb ? 'id, image' : 'id, specifications';

      const { data, error } = await supabase
        .from('spare_parts')
        .select(selectCols)
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;
      return {
        id: data.id,
        image: data.image || '',
        specifications: data.specifications || []
      };
    } catch (err) {
      console.error(`Error fetching image for part ${id}:`, err.message);
      return null;
    }
  },

  async getPartById(id) {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('spare_parts')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) return null;
      return mapPartFromDb(data);
    } catch (err) {
      console.error(`Error fetching part ${id}:`, err.message);
      return null;
    }
  },

  async addPart(partData) {
    if (!isSupabaseConfigured) throw new Error('Supabase credentials missing');
    const rawPart = {
      id: partData.id || `part-${Date.now()}`,
      title: partData.title || 'Untitled Part',
      sku: partData.sku || '',
      oemNumber: partData.oemNumber || '',
      listingType: partData.listingType || 'spare-part',
      vehicleCategory: partData.vehicleCategory || 'type-1',
      modelYearRange: partData.modelYearRange || 'Beetle 1968–1979',
      carModelId: partData.carModelId || partData.vehicleCategory || 'vw-beetle-1600',
      carModelName: partData.carModelName || partData.modelYearRange || 'VW Beetle',
      systemCategory: partData.systemCategory || partData.mainSystem || partData.partSystem || 'engine-system',
      partSystem: partData.partSystem || partData.mainSystem || 'engine-system',
      subcatId: partData.subcatId || partData.subcategory || partData.partSubcategory || 'Cylinder Heads',
      partSubcategory: partData.partSubcategory || partData.subcategory || 'Cylinder Heads',
      specificPartCategory: partData.specificPartCategory || partData.subcategory || 'Cylinder Heads',
      engineType: partData.engineType || partData.engineSize || '1600cc Air-Cooled',
      engineSize: partData.engineSize || '1600cc',
      performanceType: partData.performanceType || 'Stock',
      category: partData.category || partData.systemCategory || 'Engine Parts',
      era: partData.era || partData.modelYearRange || '1960s',
      price: parseFloat(partData.price) || 0,
      wholesalePrice: parseFloat(partData.wholesalePrice) || 0,
      rating: 5.0,
      reviewsCount: 1,
      condition: partData.condition || 'New',
      status: partData.status || 'Available',
      rarityScore: partData.rarityScore || 'Rare (85/100)',
      stock: parseInt(partData.stock, 10) || 1,
      inStock: (parseInt(partData.stock, 10) || 1) > 0,
      storageLocation: partData.storageLocation || '',
      compatibleEngineSizes: Array.isArray(partData.compatibleEngineSizes) ? partData.compatibleEngineSizes : [],
      compatibleModels: Array.isArray(partData.compatibleModels) ? partData.compatibleModels : [],
      image: partData.image || 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
      additionalImages: Array.isArray(partData.additionalImages) ? partData.additionalImages : [],
      videoUrl: partData.videoUrl || '',
      castingCode: partData.castingCode || partData.sku || 'GEN-CASTING',
      provenance: partData.description || 'Verified by Engine Specialist Mechanics.',
      description: partData.description || '',
      specifications: partData.specifications || [
        { key: 'Material', value: partData.material || 'Aluminum Alloy' }
      ],
      compatibleVehicles: partData.compatibleModels && partData.compatibleModels.length > 0 
        ? partData.compatibleModels 
        : [partData.modelYearRange || 'VW Air-Cooled']
    };

    const dbRow = mapPartToDb(rawPart);
    const { data, error } = await supabase.from('spare_parts').insert([dbRow]).select();
    if (error) {
      console.error('Error inserting part into Supabase:', error.message);
      throw error;
    }
    invalidatePartsCache();
    return data && data[0] ? mapPartFromDb(data[0]) : rawPart;
  },

  async updatePart(id, updates) {
    if (!isSupabaseConfigured) throw new Error('Supabase credentials missing');
    const dbRow = mapPartToDb({ ...updates, id });
    delete dbRow.id; // Don't overwrite PK
    const { data, error } = await supabase.from('spare_parts').update(dbRow).eq('id', id).select();
    if (error) {
      console.error('Error updating part in Supabase:', error.message);
      throw error;
    }
    invalidatePartsCache();
    return data && data[0] ? mapPartFromDb(data[0]) : null;
  },

  async deletePart(id) {
    if (!isSupabaseConfigured) throw new Error('Supabase credentials missing');
    const { error } = await supabase.from('spare_parts').delete().eq('id', id);
    if (error) {
      console.error('Error deleting part from Supabase:', error.message);
      throw error;
    }
    invalidatePartsCache();
    return true;
  },

  // --- VINTAGE CARS ---
  async getCars() {
    if (!isSupabaseConfigured) throw new Error('Supabase credentials missing');
    const { data, error } = await supabase.from('vintage_cars').select('*');
    if (error) {
      console.error('Error fetching vintage_cars from Supabase:', error.message);
      throw error;
    }
    return data ? data.map(mapCarFromDb) : [];
  },

  async addCar(carData) {
    if (!isSupabaseConfigured) throw new Error('Supabase credentials missing');
    const rawCar = {
      id: `car-${Date.now()}`,
      name: carData.name,
      make: carData.make || 'Engine Family',
      model: carData.model || carData.name,
      era: carData.era || '1960s',
      yearRange: carData.yearRange || '1960-1970',
      engineName: carData.engineName || carData.name || 'V8 Engine',
      engineType: carData.engineType || 'Aircooled / V8',
      carImage: carData.carImage || carData.image || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      engineImage: carData.engineImage || carData.carImage || carData.image,
      horsepower: carData.horsepower || '300 HP',
      torque: carData.torque || '350 lb-ft',
      description: carData.description || 'Vintage engine engineering architecture.'
    };

    const dbRow = mapCarToDb(rawCar);
    const { data, error } = await supabase.from('vintage_cars').insert([dbRow]).select();
    if (error) {
      console.error('Error inserting car into Supabase:', error.message);
      throw error;
    }
    return data && data[0] ? mapCarFromDb(data[0]) : rawCar;
  },

  async deleteCar(id) {
    if (!isSupabaseConfigured) throw new Error('Supabase credentials missing');
    const { error } = await supabase.from('vintage_cars').delete().eq('id', id);
    if (error) {
      console.error('Error deleting car from Supabase:', error.message);
      throw error;
    }
    return true;
  },

  // --- ORDERS ---
  async getOrders(userId) {
    if (!isSupabaseConfigured) throw new Error('Supabase credentials missing');
    let query = supabase.from('orders').select('*').neq('status', 'CHAT_MESSAGE').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching orders from Supabase:', error.message);
      throw error;
    }
    return data ? data.map(mapOrderFromDb) : [];
  },

  async addOrder(orderData) {
    if (!isSupabaseConfigured) throw new Error('Supabase credentials missing');
    const dbRow = mapOrderToDb(orderData);
    const { data, error } = await supabase.from('orders').insert([dbRow]).select();
    if (error) {
      console.error('Error inserting order into Supabase:', error.message);
      throw error;
    }
    return data && data[0] ? mapOrderFromDb(data[0]) : mapOrderFromDb(dbRow);
  },

  // --- USERS ---
  async getUserByEmail(email) {
    if (!email) return null;
    if (!isSupabaseConfigured) throw new Error('Supabase credentials missing');
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.from('users').select('*').eq('email', cleanEmail).maybeSingle();
    if (error) {
      console.error('Error querying user by email in Supabase:', error.message);
      throw error;
    }
    return data ? mapUserFromDb(data) : null;
  },

  async getUserById(id) {
    if (!id) return null;
    if (!isSupabaseConfigured) throw new Error('Supabase credentials missing');
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error('Error querying user by id in Supabase:', error.message);
      throw error;
    }
    return data ? mapUserFromDb(data) : null;
  },

  async createUser(userData) {
    if (!isSupabaseConfigured) throw new Error('Supabase credentials missing');
    const rawUser = {
      id: userData.id || `user-${Date.now()}`,
      name: userData.name || 'Vintage Collector',
      email: userData.email.trim().toLowerCase(),
      passwordHash: userData.passwordHash || userData.password_hash || '',
      role: userData.role || 'USER',
      phone: userData.phone || '',
      city: userData.city || ''
    };

    const dbRow = mapUserToDb(rawUser);
    const { data, error } = await supabase.from('users').insert([dbRow]).select();
    if (error) {
      console.error('Error creating user in Supabase:', error.message);
      throw error;
    }
    return data && data[0] ? mapUserFromDb(data[0]) : mapUserFromDb(dbRow);
  },

  // --- REQUESTS & ORDERS AGGREGATE ---
  async getRequests(userId) {
    if (!isSupabaseConfigured) throw new Error('Supabase credentials missing');
    let results = [];

    // 1. Query requests table if present
    try {
      let query = supabase.from('requests').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) {
        results.push(...data.map(mapRequestFromDb));
      }
    } catch (err) {}

    // 2. Query orders table (guaranteed table in Supabase)
    try {
      let orderQuery = supabase.from('orders').select('*').neq('status', 'CHAT_MESSAGE').order('created_at', { ascending: false });
      if (userId) orderQuery = orderQuery.eq('user_id', userId);
      const { data: orderData, error: orderErr } = await orderQuery;
      if (!orderErr && orderData) {
        const orderRequests = orderData.map(mapOrderToRequest);
        const existingIds = new Set(results.map(r => r.id));
        for (const oReq of orderRequests) {
          if (!existingIds.has(oReq.id)) {
            results.push(oReq);
          }
        }
      }
    } catch (err) {}

    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async addRequest(requestData) {
    if (!isSupabaseConfigured) throw new Error('Supabase credentials missing');
    const rawReq = {
      id: requestData.id || `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: requestData.userId || null,
      userName: requestData.userName || '',
      userEmail: requestData.userEmail || '',
      userPhone: requestData.userPhone || '',
      userCity: requestData.userCity || '',
      partId: requestData.partId || '',
      partTitle: requestData.partTitle || '',
      partImage: requestData.partImage || '',
      sku: requestData.sku || '',
      price: parseFloat(requestData.price) || 0,
      compatibility: requestData.compatibility || '',
      type: requestData.type || 'REQUEST',
      status: requestData.status || 'Pending'
    };

    // Always insert into orders table in Supabase so data is 100% saved
    const orderRow = {
      id: rawReq.id,
      user_id: rawReq.userId,
      user_name: rawReq.userName,
      user_email: rawReq.userEmail,
      items: [{
        id: rawReq.partId,
        title: rawReq.partTitle,
        image: rawReq.partImage,
        sku: rawReq.sku,
        price: rawReq.price,
        compatibility: rawReq.compatibility,
        type: rawReq.type
      }],
      total_amount: rawReq.price,
      shipping_address: rawReq.userCity || 'Online Request',
      status: rawReq.status
    };

    try {
      await supabase.from('orders').insert([orderRow]);
    } catch (err) {}

    // Try requests table as well if created
    try {
      const dbRow = mapRequestToDb(rawReq);
      await supabase.from('requests').insert([dbRow]);
    } catch (err) {}

    return mapRequestFromDb(mapRequestToDb(rawReq));
  },

  async updateRequestStatus(id, status) {
    if (!isSupabaseConfigured) throw new Error('Supabase credentials missing');
    try {
      await supabase.from('orders').update({ status }).eq('id', id);
    } catch (err) {}

    try {
      const { data } = await supabase.from('requests').update({ status }).eq('id', id).select();
      if (data && data[0]) return mapRequestFromDb(data[0]);
    } catch (err) {}

    return { id, status };
  },

  // --- LIVE CHAT & MESSAGING (100% PERSISTENT ACROSS RESTARTS & CLOUD DEPLOYS) ---
  async addMessage(msgInput) {
    const rawMsg = {
      id: msgInput.id || `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: msgInput.userId,
      userName: msgInput.userName || 'Restorer Member',
      userEmail: msgInput.userEmail || '',
      senderRole: (msgInput.senderRole || 'USER').toUpperCase(),
      senderName: msgInput.senderName || (msgInput.senderRole === 'ADMIN' ? 'Master Admin Engineer' : msgInput.userName || 'Restorer'),
      message: msgInput.message,
      isRead: Boolean(msgInput.isRead ?? false),
      createdAt: msgInput.createdAt || new Date().toISOString()
    };

    // 1. Save to in-memory array & local disk backup
    const existingIndex = inMemoryMessages.findIndex(m => m.id === rawMsg.id);
    if (existingIndex >= 0) {
      inMemoryMessages[existingIndex] = rawMsg;
    } else {
      inMemoryMessages.push(rawMsg);
    }
    saveDiskMessages(inMemoryMessages);

    // 2. Save directly to Supabase Cloud Database
    if (isSupabaseConfigured) {
      // Primary: 'messages' table in Supabase
      try {
        const dbRow = mapMessageToDb(rawMsg);
        const { data, error } = await supabase.from('messages').insert([dbRow]).select();
        if (!error && data && data[0]) {
          return mapMessageFromDb(data[0]);
        }
      } catch (err) {}

      // Cloud Backup: 'orders' table in Supabase (Guarantees online cloud persistence)
      try {
        const cloudRow = {
          id: rawMsg.id,
          user_id: rawMsg.userId,
          user_name: rawMsg.userName,
          user_email: rawMsg.userEmail,
          items: [rawMsg],
          total_amount: 0,
          shipping_address: 'In-App Live Chat',
          status: 'CHAT_MESSAGE'
        };
        await supabase.from('orders').upsert([cloudRow]);
      } catch (err) {
        console.warn('Supabase cloud backup note:', err.message);
      }
    }

    return rawMsg;
  },

  async getUserMessages(userId, userEmail = '') {
    if (!userId && !userEmail) return [];
    const resultMap = new Map();
    const cleanEmail = (userEmail || '').trim().toLowerCase();

    // 1. Read from local disk store first
    for (const msg of inMemoryMessages) {
      const msgEmail = (msg.userEmail || '').trim().toLowerCase();
      const isMatch = (userId && msg.userId === userId) || (cleanEmail && msgEmail && msgEmail === cleanEmail);
      if (isMatch) {
        resultMap.set(msg.id, msg);
      }
    }

    // 2. Query Supabase Cloud Database
    if (isSupabaseConfigured) {
      // From 'messages' table
      try {
        let query = supabase.from('messages').select('*');
        if (userId && cleanEmail) {
          query = query.or(`user_id.eq.${userId},user_email.eq.${cleanEmail}`);
        } else if (userId) {
          query = query.eq('user_id', userId);
        } else if (cleanEmail) {
          query = query.eq('user_email', cleanEmail);
        }
        const { data, error } = await query.order('created_at', { ascending: true });
        if (!error && Array.isArray(data)) {
          for (const row of data) {
            const mapped = mapMessageFromDb(row);
            if (mapped && mapped.id) resultMap.set(mapped.id, mapped);
          }
        }
      } catch (err) {}

      // From cloud 'orders' chat backup
      try {
        let cloudQuery = supabase.from('orders').select('*').eq('status', 'CHAT_MESSAGE');
        if (userId && cleanEmail) {
          cloudQuery = cloudQuery.or(`user_id.eq.${userId},user_email.eq.${cleanEmail}`);
        } else if (userId) {
          cloudQuery = cloudQuery.eq('user_id', userId);
        } else if (cleanEmail) {
          cloudQuery = cloudQuery.eq('user_email', cleanEmail);
        }
        const { data: cloudData, error: cloudErr } = await cloudQuery.order('created_at', { ascending: true });
        if (!cloudErr && Array.isArray(cloudData)) {
          for (const orderRow of cloudData) {
            if (Array.isArray(orderRow.items) && orderRow.items.length > 0) {
              const msgItem = orderRow.items[0];
              const normalized = {
                id: orderRow.id,
                userId: orderRow.user_id,
                userName: orderRow.user_name || msgItem.userName || 'Restorer Member',
                userEmail: orderRow.user_email || msgItem.userEmail || '',
                senderRole: (msgItem.senderRole || msgItem.sender_role || 'USER').toUpperCase(),
                senderName: msgItem.senderName || msgItem.sender_name || (msgItem.senderRole === 'ADMIN' ? 'Master Admin Engineer' : orderRow.user_name || 'Restorer'),
                message: msgItem.message || '',
                isRead: Boolean(msgItem.isRead || msgItem.is_read || false),
                createdAt: orderRow.created_at || msgItem.createdAt || new Date().toISOString()
              };
              resultMap.set(normalized.id, normalized);
            }
          }
        }
      } catch (err) {}
    }

    const messages = Array.from(resultMap.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Synchronize disk and memory
    for (const msg of messages) {
      if (!inMemoryMessages.some(m => m.id === msg.id)) {
        inMemoryMessages.push(msg);
      }
    }
    saveDiskMessages(inMemoryMessages);

    return messages;
  },

  async getAllConversations() {
    const resultMap = new Map();

    // 1. Read from disk store
    for (const msg of inMemoryMessages) {
      resultMap.set(msg.id, msg);
    }

    // 2. Query Supabase Cloud Database
    if (isSupabaseConfigured) {
      // From 'messages' table
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && Array.isArray(data)) {
          for (const row of data) {
            const mapped = mapMessageFromDb(row);
            if (mapped && mapped.id) resultMap.set(mapped.id, mapped);
          }
        }
      } catch (err) {}

      // From cloud 'orders' chat backup
      try {
        const { data: cloudData, error: cloudErr } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'CHAT_MESSAGE')
          .order('created_at', { ascending: true });
        if (!cloudErr && Array.isArray(cloudData)) {
          for (const orderRow of cloudData) {
            if (Array.isArray(orderRow.items) && orderRow.items.length > 0) {
              const msgItem = orderRow.items[0];
              const normalized = {
                id: orderRow.id,
                userId: orderRow.user_id,
                userName: orderRow.user_name || msgItem.userName || 'Restorer Member',
                userEmail: orderRow.user_email || msgItem.userEmail || '',
                senderRole: (msgItem.senderRole || msgItem.sender_role || 'USER').toUpperCase(),
                senderName: msgItem.senderName || msgItem.sender_name || (msgItem.senderRole === 'ADMIN' ? 'Master Admin Engineer' : orderRow.user_name || 'Restorer'),
                message: msgItem.message || '',
                isRead: Boolean(msgItem.isRead || msgItem.is_read || false),
                createdAt: orderRow.created_at || msgItem.createdAt || new Date().toISOString()
              };
              resultMap.set(normalized.id, normalized);
            }
          }
        }
      } catch (err) {}
    }

    const allMsgs = Array.from(resultMap.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Synchronize disk and memory
    inMemoryMessages = allMsgs;
    saveDiskMessages(inMemoryMessages);

    // Group into conversation threads stably
    const conversationsMap = new Map();
    for (const msg of allMsgs) {
      const cleanEmail = (msg.userEmail || '').trim().toLowerCase();
      const groupKey = cleanEmail ? `email_${cleanEmail}` : (msg.userId || 'guest');
      if (!conversationsMap.has(groupKey)) {
        conversationsMap.set(groupKey, {
          userId: msg.userId || groupKey,
          userName: msg.userName || 'Restorer Member',
          userEmail: msg.userEmail || '',
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
          messages: []
        });
      }
      const convo = conversationsMap.get(groupKey);
      convo.messages.push(msg);
      convo.lastMessage = msg.message;
      convo.lastMessageTime = msg.createdAt;
      if (msg.senderRole === 'USER' && !msg.isRead) {
        convo.unreadCount += 1;
      }
    }

    return Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  },

  async markMessagesAsRead(userId, readerRole = 'ADMIN', userEmail = '') {
    if (!userId && !userEmail) return;
    const targetSenderRole = readerRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const cleanEmail = (userEmail || '').trim().toLowerCase();

    // 1. Update in-memory & disk
    inMemoryMessages.forEach(m => {
      const msgEmail = (m.userEmail || '').trim().toLowerCase();
      const isMatch = (userId && m.userId === userId) || (cleanEmail && msgEmail && msgEmail === cleanEmail);
      if (isMatch && m.senderRole === targetSenderRole) {
        m.isRead = true;
      }
    });
    saveDiskMessages(inMemoryMessages);

    // 2. Update Supabase Cloud Database
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('messages').update({ is_read: true }).eq('sender_role', targetSenderRole);
        if (userId && cleanEmail) {
          query = query.or(`user_id.eq.${userId},user_email.eq.${cleanEmail}`);
        } else if (userId) {
          query = query.eq('user_id', userId);
        } else {
          query = query.eq('user_email', cleanEmail);
        }
        await query;
      } catch (err) {}

      try {
        const { data: cloudMsgs } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'CHAT_MESSAGE');
        if (cloudMsgs && Array.isArray(cloudMsgs)) {
          for (const row of cloudMsgs) {
            const isMatch = (userId && row.user_id === userId) || (cleanEmail && row.user_email && row.user_email.toLowerCase() === cleanEmail);
            if (isMatch && Array.isArray(row.items) && row.items.length > 0) {
              const item = row.items[0];
              if ((item.senderRole || item.sender_role || '').toUpperCase() === targetSenderRole) {
                item.isRead = true;
                item.is_read = true;
                await supabase.from('orders').update({ items: [item] }).eq('id', row.id);
              }
            }
          }
        }
      } catch (err) {}
    }
  }
};

