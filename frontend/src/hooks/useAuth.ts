import { api } from '@/services/api';

export const useAuth = () => {
  const login = (email: string, password: string) =>
    api.post('/auth/login', { email, password });

  const register = (first_name: string, last_name: string, email: string, password: string, phone?: string) =>
    api.post('/auth/register', { first_name, last_name, email, password, phone });

  const verifyToken = () =>
    api.get('/auth/verify');

  const getMe = () =>
    api.get('/auth/me');

  const refreshToken = (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token });

  const logoutAll = (userId: string) =>
    api.post(`/auth/logout-all/${userId}`, {});

  const getLoginHistory = (userId: string) =>
    api.get(`/auth/login-history/${userId}`);

  return { login, register, verifyToken, getMe, refreshToken, logoutAll, getLoginHistory };
}
