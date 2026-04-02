import { getToken, logout } from './auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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
      console.error(`[API ERROR] ${response.status} ${response.statusText}`, {
        url: `${BASE_URL}${endpoint}`,
        data,
      });
      throw new Error(data.detail || `Server returned ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[API Network/Parse Error] ${endpoint}:`, error);
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
