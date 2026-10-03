// localStorage wrapper that never throws.
// Storage access can fail in Safari private mode, in-app browsers (Facebook, Instagram,
// WhatsApp), when site data is blocked, or when the quota is exceeded. An uncaught error
// in a render or effect unmounts the whole React tree, so every access goes through here.
// When real storage is unavailable we fall back to an in-memory map for the session.
const memory = new Map();

export const safeStorage = {
  getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memory.has(key) ? memory.get(key) : null;
    }
  },

  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
      memory.delete(key);
      return true;
    } catch {
      memory.set(key, String(value));
      return false;
    }
  },

  removeItem(key) {
    memory.delete(key);
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },

  getJSON(key, fallback = null) {
    const raw = safeStorage.getItem(key);
    if (raw === null || raw === undefined || raw === '') return fallback;
    try {
      const parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch {
      return fallback;
    }
  },

  setJSON(key, value) {
    try {
      return safeStorage.setItem(key, JSON.stringify(value));
    } catch {
      return false;
    }
  }
};

export const safeSession = {
  getItem(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  }
};
