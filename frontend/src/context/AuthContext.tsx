import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi, LoginParams, RegisterParams } from '../api/auth';
import { getToken, setToken, clearToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isEngineer: boolean;
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (getToken()) {
        const currentUser = await authApi.getMe();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      clearToken();
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (params: LoginParams) => {
    const res = await authApi.login(params);
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
  };

  const register = async (params: RegisterParams) => {
    const res = await authApi.register(params);
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const isAdmin = user?.role === 'ADMIN';
  const isEngineer = user?.role === 'ENGINEER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isEngineer,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
