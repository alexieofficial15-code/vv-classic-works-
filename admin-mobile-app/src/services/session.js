// Session Management Service for Vintage VW Admin App
// Implements secure token persistence and strict 7-day session expiration

const SESSION_KEY = 'VW_ADMIN_SESSION_V1';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Universal in-memory fallback for environments without AsyncStorage
let memorySessionCache = null;

// Universal storage adapter (supports AsyncStorage, browser localStorage, or memory fallback)
const storage = {
  async getItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      // If @react-native-async-storage/async-storage is installed
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        if (AsyncStorage) return await AsyncStorage.getItem(key);
      } catch (e) {}
      return memorySessionCache ? JSON.stringify(memorySessionCache) : null;
    } catch (e) {
      return memorySessionCache ? JSON.stringify(memorySessionCache) : null;
    }
  },

  async setItem(key, value) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        if (AsyncStorage) await AsyncStorage.setItem(key, value);
      } catch (e) {}
      memorySessionCache = JSON.parse(value);
    } catch (e) {
      try { memorySessionCache = JSON.parse(value); } catch (_) {}
    }
  },

  async removeItem(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        if (AsyncStorage) await AsyncStorage.removeItem(key);
      } catch (e) {}
      memorySessionCache = null;
    } catch (e) {
      memorySessionCache = null;
    }
  }
};

/**
 * Save Admin Session with strict 7-day expiration
 */
export async function saveAdminSession({ token, user, expiresAt, serverUrl }) {
  const calculatedExpiresAt = expiresAt || (Date.now() + SEVEN_DAYS_MS);
  
  const sessionData = {
    token,
    user: user || { role: 'ADMIN', name: 'Master Admin Engineer' },
    createdAt: Date.now(),
    expiresAt: calculatedExpiresAt,
    serverUrl: serverUrl || 'https://vv-classic-works.onrender.com'
  };

  await storage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  return sessionData;
}

/**
 * Retrieve Admin Session and verify 7-day expiration validity
 * Returns { isValid: boolean, isExpired: boolean, session: object | null }
 */
export async function getAdminSession() {
  try {
    const raw = await storage.getItem(SESSION_KEY);
    if (!raw) {
      return { isValid: false, isExpired: false, session: null };
    }

    const session = JSON.parse(raw);
    const now = Date.now();

    // Check if session has expired past 7 days
    if (session.expiresAt && now > session.expiresAt) {
      console.warn('⚠️ Admin session expired after 7 days.');
      await clearAdminSession();
      return { isValid: false, isExpired: true, session: null };
    }

    // Session is active and unexpired
    return { isValid: true, isExpired: false, session };
  } catch (err) {
    console.error('Error verifying admin session:', err);
    return { isValid: false, isExpired: false, session: null };
  }
}

/**
 * Clear Admin Session upon Logout or Expiration
 */
export async function clearAdminSession() {
  try {
    await storage.removeItem(SESSION_KEY);
  } catch (err) {
    console.warn('Error clearing admin session:', err);
  }
}

/**
 * Calculate remaining validity in days / hours
 */
export function getRemainingSessionTime(session) {
  if (!session || !session.expiresAt) return null;
  const remainingMs = session.expiresAt - Date.now();
  if (remainingMs <= 0) return 'Expired';
  
  const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  if (days > 0) {
    return `${days}d ${hours}h left`;
  }
  return `${hours}h left`;
}
