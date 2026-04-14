import { toast } from 'react-hot-toast';
import { getToken, logout } from './auth';

// Smart BASE_URL detection: use env var if present, otherwise default based on current hostname
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  // Self-healing fallback: if not on localhost, use the production Render URL
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocal 
    ? 'http://localhost:8000/api/v1' 
    : 'https://ai-career-guide-odjt.onrender.com/api/v1';
};

const BASE_URL = getBaseUrl();

async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      console.warn(`[API] 401 Unauthorized for ${endpoint}. Logging out...`);
      logout();
      window.location.href = '/login';
      return null;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.detail || `Server error: ${response.status}`;
      console.error(`[API ERROR] ${response.status} ${response.statusText}`, {
        url: `${BASE_URL}${endpoint}`,
        data,
      });
      // We don't toast every 400/500 here to avoid double toasts in components, 
      // but we throw it for components to handle.
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`[API Network/Parse Error] ${endpoint}:`, error);
    
    // Explicitly handle "Failed to fetch" which usually means network/CORS error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      toast.error('Network Error: Cannot connect to the server. Please check your connection or CORS settings.', {
        id: 'network-error', // Prevent duplicate toasts
      });
      throw new Error('Network Error');
    }
    
    throw error;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),

  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }

    return data;
  },

  // For file uploads (multipart)
  upload: async (endpoint, formData) => {
    const token = getToken();
    const config = {
      method: 'POST',
      body: formData,
      headers: {},
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Upload failed');
    }

    return data;
  },
};

export { BASE_URL };
