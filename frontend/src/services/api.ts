import { getToken, removeToken } from '@/utils/auth';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${path}`;
};

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    throw new Error(data.error || data.detail || 'Request failed');
  }

  return data;
};

export const api = {
  get: (endpoint: string) => request(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: any) => {
    const isFormData = body instanceof FormData;
    return request(endpoint, { method: 'POST', body: isFormData ? body : JSON.stringify(body) });
  },
  put: (endpoint: string, body: any) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
};
