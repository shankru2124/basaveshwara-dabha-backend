import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, ProductVariant, OrderType, Offer } from '../types';
import { defaultSettings, initialOffers } from '../data/menuData';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, special_instructions?: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discountAmount: number;
  totalAmount: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  // Offers
  offers: Offer[];
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  appliedOffer: Offer | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('basaveshwara_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Offers State
  const [offers, setOffers] = useState<Offer[]>(() => {
    try {
      const saved = localStorage.getItem('basaveshwara_offers');
      return saved ? JSON.parse(saved) : initialOffers;
    } catch {
      return initialOffers;
    }
  });

  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('basaveshwara_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('basaveshwara_offers', JSON.stringify(offers));
    } catch (e) {
      console.warn('Could not save offers to localStorage', e);
    }
  }, [offers]);

  const addToCart = (product: Product, variant?: ProductVariant, special_instructions?: string) => {
    const selectedVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
    const cartItemId = `${product.id}-${selectedVariant?.id || 'standard'}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          selected_variant: selectedVariant,
          quantity: 1,
          special_instructions,
        },
      ];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedOffer(null);
  };

  // Financial Calculations
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.selected_variant ? item.selected_variant.price : item.product.base_price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const freeDeliveryThreshold = defaultSettings.free_delivery_above;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  // Delivery Fee Calculation (check if FREEDELIVERY offer applied or subtotal threshold met)
  const isFreeDeliveryOffer = appliedOffer?.code === 'FREEDELIVERY';
  const deliveryFee = orderType === 'pickup' || subtotal === 0 || subtotal >= freeDeliveryThreshold || isFreeDeliveryOffer
    ? 0
    : defaultSettings.delivery_fee_base;

  // Discount Calculation
  let discountAmount = 0;
  if (appliedOffer && subtotal >= appliedOffer.min_order_amount) {
    if (appliedOffer.discount_type === 'flat') {
      discountAmount = isFreeDeliveryOffer ? defaultSettings.delivery_fee_base : appliedOffer.discount_value;
    } else if (appliedOffer.discount_type === 'percentage') {
      const calculated = Math.round((subtotal * appliedOffer.discount_value) / 100);
      discountAmount = appliedOffer.max_discount_amount
        ? Math.min(calculated, appliedOffer.max_discount_amount)
        : calculated;
    }
  }

  const tax = Math.round(Math.max(0, subtotal - discountAmount) * (defaultSettings.tax_percentage / 100));
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee + tax);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Apply Promo Code
  const applyPromoCode = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const offer = offers.find((o) => o.code.toUpperCase() === trimmed && o.is_active);

    if (!offer) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }

    if (subtotal < offer.min_order_amount) {
      return {
        success: false,
        message: `Minimum order of ₹${offer.min_order_amount} required for this offer.`,
      };
    }

    setAppliedOffer(offer);
    return { success: true, message: `Coupon ${offer.code} applied successfully!` };
  };

  const removePromoCode = () => {
    setAppliedOffer(null);
  };

  const value = {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    orderType,
    setOrderType,
    subtotal,
    deliveryFee,
    tax,
    discountAmount,
    totalAmount,
    itemCount,
    isCartOpen,
    setIsCartOpen,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    offers,
    setOffers,
    appliedOffer,
    applyPromoCode,
    removePromoCode,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
