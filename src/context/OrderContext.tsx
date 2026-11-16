import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Order, OrderStatus, DeliveryPartner, DeliveryAddress, PaymentMethod } from '../types';
import { sampleDeliveryPartners, defaultSettings } from '../data/menuData';
import { soundAlert } from '../utils/soundAlert';

interface OrderContextType {
  orders: Order[];
  activeOrders: Order[];
  currentCustomerOrderId: string | null;
  setCurrentCustomerOrderId: (id: string | null) => void;
  placeOrder: (params: {
    customer_name: string;
    customer_phone: string;
    order_type: 'delivery' | 'pickup';
    delivery_address?: DeliveryAddress;
    payment_method: PaymentMethod;
    special_instructions?: string;
    items: Array<{
      product_id: string;
      product_name_en: string;
      product_name_kn: string;
      variant_name_en?: string;
      variant_name_kn?: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      special_instructions?: string;
    }>;
    subtotal: number;
    discount_amount?: number;
    applied_coupon_code?: string;
    tax: number;
    delivery_fee: number;
    total_amount: number;
  }) => Order;
  acknowledgeOrder: (orderId: string) => void;
  acknowledgeAllOrders: () => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, notes?: string) => void;
  assignDeliveryPartner: (orderId: string, driverId: string) => void;
  deliveryPartners: DeliveryPartner[];
  hasUnacknowledgedOrders: boolean;
  isAlarmRinging: boolean;
  toggleAlarmSound: () => void;
  testAlarmSound: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Initial sample orders for realistic testing
const initialSampleOrders: Order[] = [
  {
    id: 'ord-101',
    order_number: '#BD-1041',
    customer_id: 'cust-1',
    customer_name: 'Anand Kulkarni',
    customer_phone: '+91 98451 22334',
    order_type: 'delivery',
    status: 'pending',
    subtotal: 390,
    tax: 20,
    delivery_fee: 30,
    total_amount: 440,
    payment_method: 'cod',
    payment_status: 'pending',
    special_instructions: 'Please pack hot Jolada Rottis separately in foil. Extra spicy gravy.',
    delivery_address: {
      label: 'Home',
      full_name: 'Anand Kulkarni',
      phone: '+91 98451 22334',
      address_line1: 'Flat 402, Basaveshwara Towers, Vidyanagar',
      landmark: 'Near KIMS Hospital Gate',
      city: 'Hubballi',
      pincode: '580021',
      lat: 15.3647,
      lng: 75.1240
    },
    items: [
      {
        id: 'item-1',
        order_id: 'ord-101',
        product_id: 'prod-1',
        product_name_en: 'Special Basaveshwara Jolada Rotti Oota',
        product_name_kn: 'ಸ್ಪೆಷಲ್ ಬಸವೇಶ್ವರ ಜೋಳದ ರೊಟ್ಟಿ ಊಟ',
        variant_name_en: 'Standard Oota (2 Rottis)',
        variant_name_kn: 'ಸಾಧಾರಣ ಊಟ (೨ ರೊಟ್ಟಿ)',
        quantity: 1,
        unit_price: 180,
        total_price: 180
      },
      {
        id: 'item-2',
        order_id: 'ord-101',
        product_id: 'prod-4',
        product_name_en: 'North Karnataka Badanekayi Yennegai',
        product_name_kn: 'ಉತ್ತರ ಕರ್ನಾಟಕ ಬದನೆಕಾಯಿ ಎಣ್ಣೆಗಾಯಿ',
        variant_name_en: 'Regular Bowl',
        variant_name_kn: 'ಸಾಮಾನ್ಯ ಬೌಲ್',
        quantity: 1,
        unit_price: 130,
        total_price: 130
      },
      {
        id: 'item-3',
        order_id: 'ord-101',
        product_id: 'prod-7',
        product_name_en: 'Crispy Soft Jolada Rotti (Set of 2)',
        product_name_kn: 'ಬಿಸಿಬಿಸಿ ಜೋಳದ ರೊಟ್ಟಿ (೨ ರೊಟ್ಟಿ)',
        variant_name_en: 'Pack of 2 Rottis',
        variant_name_kn: '೨ ರೊಟ್ಟಿ ಪ್ಯಾಕ್',
        quantity: 2,
        unit_price: 40,
        total_price: 80
      }
    ],
    created_at: new Date(Date.now() - 3 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60000).toISOString(),
    acknowledged_by_admin: false,
    history: [
      {
        id: 'hist-1',
        order_id: 'ord-101',
        old_status: null,
        new_status: 'pending',
        notes: 'Order received from customer app',
        created_at: new Date(Date.now() - 3 * 60000).toISOString()
      }
    ]
  },
  {
    id: 'ord-102',
    order_number: '#BD-1040',
    customer_id: 'cust-2',
    customer_name: 'Pooja Patil',
    customer_phone: '+91 97412 88990',
    order_type: 'delivery',
    status: 'preparing',
    subtotal: 520,
    tax: 26,
    delivery_fee: 0,
    total_amount: 546,
    payment_method: 'razorpay',
    payment_status: 'paid',
    special_instructions: 'Mild spice for kids.',
    delivery_address: {
      label: 'Home',
      full_name: 'Pooja Patil',
      phone: '+91 97412 88990',
      address_line1: 'House 88, Shirur Park Road',
      landmark: 'Behind BVB Engineering College',
      city: 'Hubballi',
      pincode: '580031',
      lat: 15.3680,
      lng: 75.1310
    },
    items: [
      {
        id: 'item-4',
        order_id: 'ord-102',
        product_id: 'prod-2',
        product_name_en: 'Dabha Claypot Chicken Dum Biryani',
        product_name_kn: 'ದಾಬಾ ಮಡಕೆ ಚಿಕನ್ ದಮ್ ಬಿರಿಯಾನಿ',
        variant_name_en: 'Full Portion',
        variant_name_kn: 'ಫುಲ್ ಪ್ಲೇಟ್',
        quantity: 2,
        unit_price: 260,
        total_price: 520
      }
    ],
    created_at: new Date(Date.now() - 14 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60000).toISOString(),
    acknowledged_by_admin: true,
    assigned_driver: sampleDeliveryPartners[0],
    driver_lat: 15.3650,
    driver_lng: 75.1260,
    history: [
      {
        id: 'hist-2',
        order_id: 'ord-102',
        old_status: null,
        new_status: 'pending',
        notes: 'Order received',
        created_at: new Date(Date.now() - 14 * 60000).toISOString()
      },
      {
        id: 'hist-3',
        order_id: 'ord-102',
        old_status: 'pending',
        new_status: 'accepted',
        notes: 'Admin accepted order',
        created_at: new Date(Date.now() - 12 * 60000).toISOString()
      },
      {
        id: 'hist-4',
        order_id: 'ord-102',
        old_status: 'accepted',
        new_status: 'preparing',
        notes: 'Chef started cooking',
        created_at: new Date(Date.now() - 10 * 60000).toISOString()
      }
    ]
  },
  {
    id: 'ord-103',
    order_number: '#BD-1039',
    customer_id: 'cust-3',
    customer_name: 'Mallikarjun Hiremath',
    customer_phone: '+91 94488 55441',
    order_type: 'pickup',
    status: 'ready',
    subtotal: 210,
    tax: 11,
    delivery_fee: 0,
    total_amount: 221,
    payment_method: 'cod',
    payment_status: 'pending',
    special_instructions: 'Direct counter pickup at 9:00 PM.',
    items: [
      {
        id: 'item-5',
        order_id: 'ord-103',
        product_id: 'prod-5',
        product_name_en: 'Paneer Butter Masala (Dabha Style)',
        product_name_kn: 'ದಾಬಾ ಸ್ಟೈಲ್ ಪನೀರ್ ಬಟರ್ ಮಸಾಲಾ',
        variant_name_en: 'Full',
        variant_name_kn: 'ಪೂರ್ತಿ',
        quantity: 1,
        unit_price: 210,
        total_price: 210
      }
    ],
    created_at: new Date(Date.now() - 28 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
    acknowledged_by_admin: true,
    history: []
  }
];

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('basaveshwara_orders');
      return saved ? JSON.parse(saved) : initialSampleOrders;
    } catch {
      return initialSampleOrders;
    }
  });

  const [deliveryPartners] = useState<DeliveryPartner[]>(sampleDeliveryPartners);
  const [currentCustomerOrderId, setCurrentCustomerOrderId] = useState<string | null>(() => {
    return localStorage.getItem('basaveshwara_current_order') || 'ord-101';
  });
  const [alarmSoundEnabled, setAlarmSoundEnabled] = useState(defaultSettings.alarm_sound_enabled);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('basaveshwara_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Could not save orders to localStorage', e);
    }
  }, [orders]);

  useEffect(() => {
    if (currentCustomerOrderId) {
      localStorage.setItem('basaveshwara_current_order', currentCustomerOrderId);
    }
  }, [currentCustomerOrderId]);

  // Check unacknowledged incoming orders
  const unacknowledgedOrders = orders.filter((o) => o.status === 'pending' && !o.acknowledged_by_admin);
  const hasUnacknowledgedOrders = unacknowledgedOrders.length > 0;

  // Manage Sound Alarm Loop
  useEffect(() => {
    if (hasUnacknowledgedOrders && alarmSoundEnabled) {
      setIsAlarmRinging(true);
      soundAlert.startRepeatingAlarm(8);
    } else {
      setIsAlarmRinging(false);
      soundAlert.stopAlarm();
    }

    return () => {
      soundAlert.stopAlarm();
    };
  }, [hasUnacknowledgedOrders, alarmSoundEnabled]);

  const toggleAlarmSound = () => {
    setAlarmSoundEnabled((prev) => {
      const next = !prev;
      if (!next) soundAlert.stopAlarm();
      return next;
    });
  };

  const testAlarmSound = () => {
    soundAlert.playTone(880, 660, 0.4);
    setTimeout(() => soundAlert.playTone(987, 784, 0.4), 250);
  };

  const acknowledgeOrder = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, acknowledged_by_admin: true } : o))
    );
  }, []);

  const acknowledgeAllOrders = useCallback(() => {
    setOrders((prev) => prev.map((o) => ({ ...o, acknowledged_by_admin: true })));
    soundAlert.stopAlarm();
    setIsAlarmRinging(false);
  }, []);

  const placeOrder = useCallback((params: {
    customer_name: string;
    customer_phone: string;
    order_type: 'delivery' | 'pickup';
    delivery_address?: DeliveryAddress;
    payment_method: PaymentMethod;
    special_instructions?: string;
    items: Array<{
      product_id: string;
      product_name_en: string;
      product_name_kn: string;
      variant_name_en?: string;
      variant_name_kn?: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      special_instructions?: string;
    }>;
    subtotal: number;
    discount_amount?: number;
    applied_coupon_code?: string;
    tax: number;
    delivery_fee: number;
    total_amount: number;
  }): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `ord-${Date.now()}`;
    const newOrderNumber = `#BD-${randomSuffix}`;

    const newOrder: Order = {
      id: newOrderId,
      order_number: newOrderNumber,
      customer_id: `cust-${Date.now()}`,
      customer_name: params.customer_name,
      customer_phone: params.customer_phone,
      order_type: params.order_type,
      status: 'pending',
      subtotal: params.subtotal,
      discount_amount: params.discount_amount || 0,
      applied_coupon_code: params.applied_coupon_code,
      tax: params.tax,
      delivery_fee: params.delivery_fee,
      total_amount: params.total_amount,
      payment_method: params.payment_method,
      payment_status: params.payment_method === 'razorpay' ? 'paid' : 'pending',
      delivery_address: params.delivery_address,
      special_instructions: params.special_instructions,
      items: params.items.map((it, idx) => ({
        id: `item-${newOrderId}-${idx}`,
        order_id: newOrderId,
        ...it,
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      acknowledged_by_admin: false,
      history: [
        {
          id: `hist-${Date.now()}`,
          order_id: newOrderId,
          old_status: null,
          new_status: 'pending',
          notes: 'Customer placed order via Basaveshwara Dabha App',
          created_at: new Date().toISOString(),
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCurrentCustomerOrderId(newOrderId);

    // Audio chime trigger
    if (alarmSoundEnabled) {
      soundAlert.startRepeatingAlarm(8);
      setIsAlarmRinging(true);
    }

    return newOrder;
  }, [alarmSoundEnabled]);

  const updateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus, notes?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const newHistoryItem = {
          id: `hist-${Date.now()}`,
          order_id: order.id,
          old_status: order.status,
          new_status: newStatus,
          notes: notes || `Order updated to ${newStatus}`,
          created_at: new Date().toISOString(),
        };

        return {
          ...order,
          status: newStatus,
          updated_at: new Date().toISOString(),
          history: [...(order.history || []), newHistoryItem],
          acknowledged_by_admin: true, // auto-acknowledge when admin changes status
        };
      })
    );
  }, []);

  const assignDeliveryPartner = useCallback((orderId: string, driverId: string) => {
    const partner = deliveryPartners.find((d) => d.id === driverId);
    if (!partner) return;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          assigned_driver: partner,
          driver_lat: partner.current_lat,
          driver_lng: partner.current_lng,
          status: order.status === 'ready' ? 'picked_up' : order.status,
          updated_at: new Date().toISOString(),
        };
      })
    );
  }, [deliveryPartners]);

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled', 'rejected'].includes(o.status));

  const value = {
    orders,
    activeOrders,
    currentCustomerOrderId,
    setCurrentCustomerOrderId,
    placeOrder,
    acknowledgeOrder,
    acknowledgeAllOrders,
    updateOrderStatus,
    assignDeliveryPartner,
    deliveryPartners,
    hasUnacknowledgedOrders,
    isAlarmRinging,
    toggleAlarmSound,
    testAlarmSound,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
