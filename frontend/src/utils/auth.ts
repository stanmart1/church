export const getToken = () => localStorage.getItem('token');

export const setToken = (token: string) => localStorage.setItem('token', token);

export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const setRefreshToken = (token: string) => localStorage.setItem('refreshToken', token);

export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

export const isAuthenticated = () => !!getToken();
