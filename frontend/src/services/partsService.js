import { createClient } from '@supabase/supabase-js';
import { API_BASE_URL } from '../config/api';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://dehilnrxrziityivlksq.supabase.co').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaGlsbnJ4cnppaXR5aXZsa3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMDU3MzQsImV4cCI6MjEwMTU4MTczNH0.KA73cpnS-fB0qAD5_CDZ8vijipBcCLG_7ougMtD20zc').trim();

// Direct Supabase Edge Client (Bypasses Render Cold Starts!)
let supabaseClient = null;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
  }
} catch (e) {
  console.warn('Direct Supabase client init error:', e);
}

// Data Mapper for raw DB rows -> Application Objects
export function mapPartFromDb(row) {
  if (!row) return null;
  
  let rawSpecs = Array.isArray(row.specifications) 
    ? row.specifications 
    : (typeof row.specifications === 'string' ? JSON.parse(row.specifications || '[]') : []);
  
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

// In-Memory Stale Cache
let inMemoryParts = null;
let activeFetchPromise = null;
const subscribers = new Set();

export const subscribeToPartsUpdates = (callback) => {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
};

const notifySubscribers = (parts) => {
  subscribers.forEach(cb => {
    try {
      cb(parts);
    } catch (e) {}
  });
};

// 0ms Instant Synchronous Initializer
export const getCachedPartsSync = () => {
  if (inMemoryParts && inMemoryParts.length > 0) {
    return inMemoryParts;
  }
  try {
    const cached = localStorage.getItem('cached_db_parts');
    const local = localStorage.getItem('custom_parts');
    const deleted = new Set(JSON.parse(localStorage.getItem('deleted_part_ids') || '[]'));
    
    let combined = [];
    if (cached) {
      combined = [...combined, ...JSON.parse(cached)];
    }
    if (local) {
      combined = [...combined, ...JSON.parse(local)];
    }
    
    const unique = Array.from(new Map(combined.map(p => [p.id, p])).values())
      .filter(p => !deleted.has(p.id));
      
    if (unique.length > 0) {
      inMemoryParts = unique;
      return unique;
    }
  } catch (e) {}
  return [];
};

// High-Speed Multi-Tier Fetcher
export const fetchPartsFast = async (forceRefresh = false) => {
  // If a request is already in-flight, return the same promise to prevent duplicate network traffic
  if (activeFetchPromise && !forceRefresh) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    const deletedIds = new Set(JSON.parse(localStorage.getItem('deleted_part_ids') || '[]'));
    const customParts = JSON.parse(localStorage.getItem('custom_parts') || '[]');

    let freshParts = null;

    // TIER 1: Direct Edge Supabase Query (Bypasses Render 50s Cold Start!)
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('spare_parts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          freshParts = data.map(mapPartFromDb);
        }
      } catch (err) {
        console.warn('Direct Supabase query failed, falling back to Render API:', err);
      }
    }

    // TIER 2: Fallback to Render Backend API if Direct Supabase wasn't available
    if (!freshParts) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/parts`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            freshParts = json.data;
          }
        }
      } catch (err) {
        console.warn('Render API fetch error:', err);
      }
    }

    // Merge and Deduplicate with local items
    if (freshParts && Array.isArray(freshParts)) {
      const filteredServerParts = freshParts.filter(p => !deletedIds.has(p.id));
      const serverIdSet = new Set(freshParts.map(p => p.id));
      const unsyncedLocal = customParts.filter(p => !deletedIds.has(p.id) && !serverIdSet.has(p.id));
      const finalParts = [...unsyncedLocal, ...filteredServerParts];

      inMemoryParts = finalParts;
      try {
        localStorage.setItem('cached_db_parts', JSON.stringify(finalParts));
      } catch (e) {}

      notifySubscribers(finalParts);
      return finalParts;
    }

    // Return whatever cached items exist if all network attempts fail
    return getCachedPartsSync();
  })();

  try {
    const result = await activeFetchPromise;
    return result;
  } finally {
    activeFetchPromise = null;
  }
};
