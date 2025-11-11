import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { getToken, setToken as saveToken, removeToken } from '@/utils/auth';
import { useAuth as useAuthHook } from '@/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (first_name: string, last_name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { login: loginApi, register: registerApi, verifyToken } = useAuthHook();

  useEffect(() => {
    const token = getToken();
    if (token) {
      verifyToken()
        .then((data) => setUser(data.user))
        .catch(() => removeToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginApi(email, password);
    saveToken(data.token);
    setUser(data.user);
  };

  const register = async (first_name: string, last_name: string, email: string, password: string, phone?: string) => {
    const data = await registerApi(first_name, last_name, email, password, phone);
    saveToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
