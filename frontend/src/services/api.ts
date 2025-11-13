import { getToken, removeToken, getRefreshToken, setToken } from '@/utils/auth';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${path}`;
};

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
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

  if (response.status === 401 && !endpoint.includes('/auth/')) {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      removeToken();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        return request(endpoint, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setToken(data.access_token);
        processQueue(null, data.access_token);
        isRefreshing = false;
        return request(endpoint, options);
      } else {
        processQueue(new Error('Token refresh failed'), null);
        isRefreshing = false;
        removeToken();
        window.location.href = '/login';
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      processQueue(error, null);
      isRefreshing = false;
      removeToken();
      window.location.href = '/login';
      throw error;
    }
  }

  const data = await response.json();

  if (!response.ok) {
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
