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
      logout();
      window.location.href = '/login';
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
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
