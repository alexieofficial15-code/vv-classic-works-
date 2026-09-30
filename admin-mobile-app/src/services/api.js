// API Service for Vintage VW Admin Mobile Desk
// Synchronized with Supabase 'messages' table & 7-Day Session Management

export const DEFAULT_API_BASE = 'https://vv-classic-works.onrender.com';
export const DEFAULT_ADMIN_TOKEN = 'master-admin-token-2026';

let currentBaseUrl = DEFAULT_API_BASE;
let currentAdminToken = DEFAULT_ADMIN_TOKEN;

/**
 * Sanitize text inputs before sending across the wire
 * Defense in depth against SQL injection, null-byte injection, and XSS
 */
export const sanitizeClientInput = (text) => {
  if (typeof text !== 'string') return '';
  return text.replace(/\0/g, '').trim();
};

export const setApiConfig = (baseUrl, token) => {
  if (baseUrl) currentBaseUrl = baseUrl.replace(/\/+$/, '');
  if (token) currentAdminToken = token;
};

export const getApiConfig = () => ({
  baseUrl: currentBaseUrl,
  token: currentAdminToken,
});

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${currentAdminToken}`,
});

/**
 * Secure Admin Login - returns 7-day session token
 */
export const loginAdmin = async ({ email, password, serverUrl }) => {
  const targetBaseUrl = (serverUrl || currentBaseUrl).replace(/\/+$/, '');
  const cleanEmail = sanitizeClientInput(email).toLowerCase();
  const cleanPassword = sanitizeClientInput(password);

  try {
    const res = await fetch(`${targetBaseUrl}/api/auth/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        password: cleanPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Authentication failed: Invalid admin credentials');
    }

    // Set active config
    setApiConfig(targetBaseUrl, data.token);

    return {
      token: data.token,
      expiresAt: data.expiresAt || (Date.now() + 7 * 24 * 60 * 60 * 1000),
      expiresInDays: data.expiresInDays || 7,
      user: data.user,
      serverUrl: targetBaseUrl,
    };
  } catch (err) {
    console.warn('loginAdmin error:', err.message);
    throw err;
  }
};

// 1. Fetch all customer conversations from Supabase
export const fetchConversations = async () => {
  try {
    const res = await fetch(`${currentBaseUrl}/api/admin/chat/conversations`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (res.status === 401) {
      throw new Error('SESSION_EXPIRED');
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch (err) {
    console.warn('fetchConversations error:', err.message);
    throw err;
  }
};

// 2. Fetch full conversation thread with a specific customer
export const fetchCustomerMessages = async (userId, userEmail = '') => {
  try {
    const query = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
    const res = await fetch(`${currentBaseUrl}/api/admin/chat/messages/${encodeURIComponent(userId)}${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (res.status === 401) {
      throw new Error('SESSION_EXPIRED');
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch (err) {
    console.warn('fetchCustomerMessages error:', err.message);
    throw err;
  }
};

// 3. Send admin reply to customer (Persists directly into Supabase 'messages' table)
export const sendAdminReply = async ({ userId, userName, userEmail, message }) => {
  try {
    const cleanMsg = sanitizeClientInput(message);
    if (!cleanMsg) {
      throw new Error('Message cannot be empty');
    }

    const res = await fetch(`${currentBaseUrl}/api/admin/chat/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        userId: sanitizeClientInput(userId),
        userName: sanitizeClientInput(userName),
        userEmail: sanitizeClientInput(userEmail),
        message: cleanMsg,
      }),
    });

    if (res.status === 401) {
      throw new Error('SESSION_EXPIRED');
    }

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to send reply');
    }
    return data.data;
  } catch (err) {
    console.warn('sendAdminReply error:', err.message);
    throw err;
  }
};

// 4. Register Expo Push Token on backend for notifications
export const registerPushToken = async (pushToken) => {
  try {
    const res = await fetch(`${currentBaseUrl}/api/admin/push-token`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ pushToken: sanitizeClientInput(pushToken) }),
    });
    return await res.json();
  } catch (err) {
    console.warn('registerPushToken error:', err.message);
    return { success: false, error: err.message };
  }
};

// 5. Unregister Expo Push Token
export const unregisterPushToken = async (pushToken) => {
  try {
    const res = await fetch(`${currentBaseUrl}/api/admin/push-token`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ pushToken: sanitizeClientInput(pushToken) }),
    });
    return await res.json();
  } catch (err) {
    console.warn('unregisterPushToken error:', err.message);
    return { success: false };
  }
};

// 6. Test push notification from phone
export const sendTestPush = async (pushToken) => {
  try {
    const res = await fetch(`${currentBaseUrl}/api/admin/push-token/test`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ pushToken: sanitizeClientInput(pushToken) }),
    });
    return await res.json();
  } catch (err) {
    console.warn('sendTestPush error:', err.message);
    throw err;
  }
};
