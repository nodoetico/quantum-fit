import { useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/api';
import { AuthContext } from './AuthContextValue';
import type { User, LoginInput } from '../types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoredUser = (() => {
      try {
        const stored = localStorage.getItem('user');
        if (stored && stored !== 'undefined' && stored !== 'null') {
          return JSON.parse(stored);
        }
      } catch {}
      return null;
    })();

    if (restoredUser) {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        setUser(restoredUser);
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (data: LoginInput) => {
    const response = await authService.login(data);

    localStorage.setItem('token', response.accessToken);
    localStorage.setItem('user', JSON.stringify(response.user));

    setToken(response.accessToken);
    setUser(response.user);
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
