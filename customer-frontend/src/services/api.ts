const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('bd_customer_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Menu & Categories
  async getCategories() {
    const res = await fetch(`${BASE_URL}/menu/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getMenuItems(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    const res = await fetch(`${BASE_URL}/menu/items?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch menu items');
    return res.json();
  },

  async getFeatured() {
    const res = await fetch(`${BASE_URL}/menu/featured`);
    if (!res.ok) throw new Error('Failed to fetch featured items');
    return res.json();
  },

  async getSettings() {
    const res = await fetch(`${BASE_URL}/restaurant/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async getCoupons() {
    const res = await fetch(`${BASE_URL}/coupons`);
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
  },

  // Cart & Pricing
  async calculateCart(payload: { items: { item_id: string; quantity: number }[]; fulfillment_type: string; coupon_code?: string }) {
    const res = await fetch(`${BASE_URL}/cart/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to calculate cart');
    }
    return res.json();
  },

  // Orders
  async createOrder(payload: any) {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to place order');
    }
    return res.json();
  },

  async verifyPayment(payload: { order_id: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    const res = await fetch(`${BASE_URL}/orders/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Payment verification failed');
    }
    return res.json();
  },

  async confirmUpiPayment(payload: { order_id: string; utr_number?: string; upi_app?: string }) {
    const res = await fetch(`${BASE_URL}/orders/confirm-upi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'UPI payment confirmation failed');
    }
    return res.json();
  },

  async trackOrder(orderId: string) {
    const res = await fetch(`${BASE_URL}/orders/track/${orderId}`);
    if (!res.ok) throw new Error('Failed to track order');
    return res.json();
  },

  async getMyOrders() {
    const res = await fetch(`${BASE_URL}/orders/my-orders`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async cancelOrder(orderId: string) {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to cancel order');
    }
    return res.json();
  },

  // Auth
  async register(data: any) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async login(data: any) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async getProfile() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(data: any) {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Profile update failed');
    }
    return res.json();
  },

  async addAddress(address: any) {
    const res = await fetch(`${BASE_URL}/auth/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(address)
    });
    if (!res.ok) throw new Error('Failed to add address');
    return res.json();
  }
};
