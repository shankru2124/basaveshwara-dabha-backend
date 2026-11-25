import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem, FulfillmentType, RestaurantTable } from '../types';
import { api } from '../services/api';
import { customerWs } from '../services/websocket';
import { playSuccessDing } from '../utils/audio';

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  fulfillmentType: FulfillmentType;
  setFulfillmentType: (type: FulfillmentType) => void;
  appliedCoupon: string;
  setAppliedCoupon: (code: string) => void;
  calculation: any;
  isCalculating: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  refreshCalculation: () => Promise<void>;
  totalItemCount: number;
  activeTable: RestaurantTable | null;
  publicTables: RestaurantTable[];
  selectTable: (tableNumber: string) => Promise<void>;
  clearTable: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bd_customer_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('DELIVERY');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [calculation, setCalculation] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activeTable, setActiveTable] = useState<RestaurantTable | null>(null);
  const [publicTables, setPublicTables] = useState<RestaurantTable[]>([]);

  const selectTable = async (tableNumber: string) => {
    const clean = tableNumber.trim().toUpperCase();
    if (!clean) return;
    localStorage.setItem('bd_active_table_number', clean);
    setFulfillmentType('DINE_IN');
    try {
      const tbl = await api.getTableByNumber(clean);
      setActiveTable(tbl);
    } catch {
      // Fallback lightweight table object if backend is temporarily unreachable
      setActiveTable({
        id: clean,
        table_number: clean,
        table_name: `Table ${clean}`,
        capacity: 4,
        section: 'Main Hall',
        status: 'OCCUPIED',
        is_active: true
      });
    }
  };

  const clearTable = () => {
    localStorage.removeItem('bd_active_table_number');
    setActiveTable(null);
    setFulfillmentType('DELIVERY');
    if (typeof window !== 'undefined' && window.location.search.includes('table=')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('table');
      url.searchParams.delete('qr');
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Detect Smart QR URL (?table=T-01 or ?qr=T-01) and load public table list on mount
  useEffect(() => {
    api.getPublicTables().then(setPublicTables).catch(() => {});

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qrTable = params.get('table') || params.get('qr');
      const savedTable = localStorage.getItem('bd_active_table_number');
      const target = qrTable || savedTable;
      if (target) {
        selectTable(target);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('bd_customer_cart', JSON.stringify(items));
  }, [items]);

  // Recalculate whenever items, fulfillmentType, or appliedCoupon change
  const refreshCalculation = async () => {
    if (items.length === 0) {
      setCalculation(null);
      return;
    }
    setIsCalculating(true);
    try {
      const result = await api.calculateCart({
        items: items.map((i) => ({ item_id: i.id, quantity: i.quantity })),
        fulfillment_type: fulfillmentType,
        coupon_code: appliedCoupon || undefined
      });
      setCalculation(result);

      // If any item was flagged as unavailable, update local prices/state if needed
      if (result.unavailable_items && result.unavailable_items.length > 0) {
        console.warn('Some items are no longer available:', result.unavailable_items);
      }
    } catch (err) {
      console.error('Failed to calculate cart:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    refreshCalculation();
  }, [items, fulfillmentType, appliedCoupon]);

  // Real-time synchronization: listen for menu or availability changes
  useEffect(() => {
    const unsubscribe = customerWs.subscribe((data) => {
      if (data.event === 'food_availability_changed' || data.event === 'menu_updated') {
        // If an item in cart was updated, re-calculate and notify
        refreshCalculation();
      }
    });
    return () => unsubscribe();
  }, [items]);

  const addItem = (item: MenuItem, quantity: number = 1) => {
    if (!item.is_available) {
      alert(`Sorry, ${item.name} is currently sold out!`);
      return;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity,
          image_url: item.image_url,
          category: item.category
        }
      ];
    });
    playSuccessDing();
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon('');
    setCalculation(null);
  };

  const totalItemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        fulfillmentType,
        setFulfillmentType,
        appliedCoupon,
        setAppliedCoupon,
        calculation,
        isCalculating,
        isCartOpen,
        setIsCartOpen,
        refreshCalculation,
        totalItemCount,
        activeTable,
        publicTables,
        selectTable,
        clearTable
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
