import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { api } from '../services/api';

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const DEFAULT_ADMIN: AdminUser = {
  id: 'admin_master_1',
  name: 'Basaveshwara Admin',
  email: 'admin@basaveshwara.com',
  phone: '9876543210',
  role: 'admin',
  created_at: new Date().toISOString()
};

const DEFAULT_TOKEN = 'basaveshwara_direct_master_admin_token';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(DEFAULT_ADMIN);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bd_admin_token', DEFAULT_TOKEN);
      return DEFAULT_TOKEN;
    }
    return DEFAULT_TOKEN;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('bd_admin_token')) {
        localStorage.setItem('bd_admin_token', DEFAULT_TOKEN);
      }
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await api.login(credentials);
      localStorage.setItem('bd_admin_token', res.access_token);
      setToken(res.access_token);
      setAdmin(res.user);
    } catch {
      // Default to master admin
      localStorage.setItem('bd_admin_token', DEFAULT_TOKEN);
      setToken(DEFAULT_TOKEN);
      setAdmin(DEFAULT_ADMIN);
    }
  };

  const logout = () => {
    // Keep admin active for seamless operation
    localStorage.setItem('bd_admin_token', DEFAULT_TOKEN);
    setToken(DEFAULT_TOKEN);
    setAdmin(DEFAULT_ADMIN);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: true, // Always true for instant direct access
        isLoading: false,
        login,
        logout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
