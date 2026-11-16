import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, DeliveryAddress } from '../types';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  customerProfile: {
    name: string;
    phone: string;
    defaultAddress: DeliveryAddress;
  };
  updateCustomerProfile: (profile: Partial<AuthContextType['customerProfile']>) => void;
}

const defaultCustomer = {
  name: 'Shankar Gowda',
  phone: '+91 98450 77123',
  defaultAddress: {
    label: 'Home',
    full_name: 'Shankar Gowda',
    phone: '+91 98450 77123',
    address_line1: 'Near Siddharoodha Math, Old Hubli',
    landmark: 'Opposite State Bank ATM',
    city: 'Hubballi',
    pincode: '580024',
    lat: 15.3520,
    lng: 75.1380,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('basaveshwara_active_role');
    return (saved as UserRole) || 'customer';
  });

  const [customerProfile, setCustomerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('basaveshwara_profile');
      return saved ? JSON.parse(saved) : defaultCustomer;
    } catch {
      return defaultCustomer;
    }
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('basaveshwara_active_role', newRole);
  };

  const updateCustomerProfile = (updates: Partial<AuthContextType['customerProfile']>) => {
    setCustomerProfile((prev: typeof defaultCustomer) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('basaveshwara_profile', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ role, setRole, customerProfile, updateCustomerProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
