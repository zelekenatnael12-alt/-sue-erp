import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api, User } from '../api/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; name: string; role?: string; region?: string; subRegion?: string; area?: string; accessCode?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem('sue_user');
    return u ? JSON.parse(u) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    localStorage.setItem('sue_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const register = useCallback(async (payload: { email: string; password: string; name: string; role?: string; region?: string; subRegion?: string; area?: string; accessCode?: string }) => {
    const data = await api.register(payload);
    localStorage.setItem('sue_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('sue_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
