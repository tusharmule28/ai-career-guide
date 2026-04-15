import { toast } from 'react-hot-toast';
import { getToken, logout } from './auth';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  
  // Fallback logic for local development if env var is missing
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocal 
      ? 'http://localhost:8000/api/v1' 
      : 'https://ai-career-guide-odjt.onrender.com/api/v1';
  }
  
  // Server-side fallback (assuming local for SSR if not specified)
  return 'http://localhost:8000/api/v1';
};

const BASE_URL = getBaseUrl();

async function request(endpoint: string, options: any = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
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
      if (typeof window !== 'undefined') {
        logout();
        window.location.href = '/login';
      }
      return null;
    }

    // Try to parse JSON but handle empty/non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => ({}));
    } else {
      await response.text(); // Consume body
      data = {};
    }

    if (!response.ok) {
      const errorMsg = data.detail || data.message || `Server error: ${response.status} ${response.statusText}`;
      console.error(`[API ERROR] ${response.status} ${response.statusText}`, {
        url: `${BASE_URL}${endpoint}`,
        data,
      });
      throw new Error(errorMsg);
    }

    return data;
  } catch (error: any) {
    console.error(`[API Network/Parse Error] ${endpoint}:`, error);
    
    // Distinguish between actual "Failed to fetch" (network) and other errors
    const isNetworkError = error instanceof TypeError && (
      error.message === 'Failed to fetch' || 
      error.message.includes('network error') ||
      error.message.includes('Load failed')
    );

    if (typeof window !== 'undefined' && isNetworkError) {
      toast.error('Connection Lost: The server is unreachable. Check your internet or backend status.', {
        id: 'network-error',
        duration: 5000,
      });
    } else if (typeof window !== 'undefined') {
      toast.error(error.message || 'An unexpected error occurred.', {
        id: 'generic-error',
      });
    }
    
    throw error;
  }
}

export const api = {
  get: (endpoint: string, options?: any) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, body?: any, options?: any) =>
    request(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (endpoint: string, body?: any, options?: any) =>
    request(endpoint, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: (endpoint: string, options?: any) => request(endpoint, { ...options, method: 'DELETE' }),

  login: async (username: string, password: string) => {
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

  upload: async (endpoint: string, formData: FormData) => {
    const token = getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers,
    });
    
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || 'Upload failed');
    }

    return data;
  },
};

export { BASE_URL };
