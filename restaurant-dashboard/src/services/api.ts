const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function getAdminToken(): string | null {
  return localStorage.getItem('bd_admin_token');
}

function getAuthHeader(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${BASE_URL}/auth/restaurant-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Invalid restaurant owner credentials');
    }
    return res.json();
  },

  async getProfile() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to verify session');
    return res.json();
  },

  // Orders
  async getOrders(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    const res = await fetch(`${BASE_URL}/restaurant/orders?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrderById(orderId: string) {
    const res = await fetch(`${BASE_URL}/restaurant/orders/${orderId}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async updateOrderStatus(orderId: string, payload: { status: string; prep_time_minutes?: number; rejection_reason?: string; note?: string }) {
    const res = await fetch(`${BASE_URL}/restaurant/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to update order status');
    }
    return res.json();
  },

  // Menu Items
  async getMenu() {
    const res = await fetch(`${BASE_URL}/restaurant/menu`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch menu');
    return res.json();
  },

  async createMenuItem(data: any) {
    const res = await fetch(`${BASE_URL}/restaurant/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create menu item');
    }
    return res.json();
  },

  async updateMenuItem(itemId: string, data: any) {
    const res = await fetch(`${BASE_URL}/restaurant/menu/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to update menu item');
    }
    return res.json();
  },

  async toggleItemAvailability(itemId: string, isAvailable: boolean) {
    const res = await fetch(`${BASE_URL}/restaurant/menu/${itemId}/availability`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ is_available: isAvailable })
    });
    if (!res.ok) throw new Error('Failed to toggle availability');
    return res.json();
  },

  async deleteMenuItem(itemId: string) {
    const res = await fetch(`${BASE_URL}/restaurant/menu/${itemId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to delete item');
    return res.json();
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${BASE_URL}/menu/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(data: any) {
    const res = await fetch(`${BASE_URL}/restaurant/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async updateCategory(catId: string, data: any) {
    const res = await fetch(`${BASE_URL}/restaurant/categories/${catId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },

  async deleteCategory(catId: string) {
    const res = await fetch(`${BASE_URL}/restaurant/categories/${catId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${BASE_URL}/restaurant/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(data: any) {
    const res = await fetch(`${BASE_URL}/restaurant/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Coupons
  async getCoupons() {
    const res = await fetch(`${BASE_URL}/coupons`);
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
  },

  async createCoupon(data: any) {
    const res = await fetch(`${BASE_URL}/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create coupon');
    return res.json();
  },

  async toggleCoupon(couponId: string) {
    const res = await fetch(`${BASE_URL}/coupons/${couponId}/toggle`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to toggle coupon');
    return res.json();
  },

  async deleteCoupon(couponId: string) {
    const res = await fetch(`${BASE_URL}/coupons/${couponId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to delete coupon');
    return res.json();
  },

  // Analytics
  async getAnalyticsDashboard() {
    const res = await fetch(`${BASE_URL}/analytics/dashboard`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  getExportCsvUrl() {
    return `${BASE_URL}/analytics/export-csv`;
  },

  // Customers
  async getCustomers() {
    const res = await fetch(`${BASE_URL}/restaurant/customers`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch customer list');
    return res.json();
  },

  // Security & Admin Credentials
  async changeCredentials(payload: { current_password: string; new_name?: string; new_email?: string; new_password?: string }) {
    const res = await fetch(`${BASE_URL}/auth/change-credentials`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to update credentials');
    }
    return res.json();
  },

  async getAdmins() {
    const res = await fetch(`${BASE_URL}/auth/admins`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch admin users');
    return res.json();
  },

  async createAdmin(payload: { name: string; email: string; phone: string; password: string; role?: string }) {
    const res = await fetch(`${BASE_URL}/auth/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create admin user');
    }
    return res.json();
  },

  async deleteAdmin(adminId: string) {
    const res = await fetch(`${BASE_URL}/auth/admins/${adminId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to delete admin user');
    }
    return res.json();
  },

  // Upload
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Upload failed with status ${res.status}`);
    }
    return res.json();
  }
};
