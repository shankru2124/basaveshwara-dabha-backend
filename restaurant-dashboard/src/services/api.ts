export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('bd_api_url');
    // Clear stale broken 404 URL if previously stored
    if (custom && custom.includes('basaveshwara-dabha-api.onrender.com')) {
      localStorage.removeItem('bd_api_url');
    } else if (custom) {
      return custom.replace(/\/+$/, '');
    }
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalOrLan = host === 'localhost' || host === '127.0.0.1' || /^192\.168\./.test(host) || /^10\./.test(host) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host);
    if (isLocalOrLan) {
      return `http://${host}:8000/api`;
    }
  }
  return 'https://basaveshwara-dabha-backend.onrender.com/api';
}

export function setCustomApiUrl(url: string): string {
  if (!url) throw new Error('API URL cannot be empty');
  let cleanUrl = url.trim().replace(/\/+$/, '');

  if (cleanUrl.includes('dashboard.render.com')) {
    throw new Error('That is your Render account dashboard link. Please copy your public Web Service URL (e.g. https://your-service.onrender.com) found right under your service name.');
  }

  if (cleanUrl.includes('github.com')) {
    throw new Error('That is your GitHub repository link. Please enter your Render Web Service URL (ending in .onrender.com).');
  }

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  if (!cleanUrl.endsWith('/api')) {
    cleanUrl = `${cleanUrl}/api`;
  }

  localStorage.setItem('bd_api_url', cleanUrl);
  return cleanUrl;
}

export function resetToLocalhost(): string {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const url = `http://${host === 'localhost' || host === '127.0.0.1' ? 'localhost' : host}:8000/api`;
  localStorage.setItem('bd_api_url', url);
  return url;
}

export function resetToCloud(): string {
  const url = 'https://basaveshwara-dabha-backend.onrender.com/api';
  localStorage.setItem('bd_api_url', url);
  return url;
}

export function getBackendOrigin(): string {
  const base = getApiBaseUrl();
  return base.replace(/\/api\/?$/, '');
}

export function getWsBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('bd_ws_url');
    if (custom && custom.includes('basaveshwara-dabha-api.onrender.com')) {
      localStorage.removeItem('bd_ws_url');
    } else if (custom) {
      return custom.replace(/\/+$/, '');
    }
  }
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalOrLan = host === 'localhost' || host === '127.0.0.1' || /^192\.168\./.test(host) || /^10\./.test(host) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host);
    if (isLocalOrLan) {
      return `ws://${host}:8000`;
    }
  }
  const origin = getBackendOrigin();
  if (origin.startsWith('https://')) return origin.replace('https://', 'wss://');
  if (origin.startsWith('http://')) return origin.replace('http://', 'ws://');
  return 'wss://basaveshwara-dabha-backend.onrender.com';
}

export async function pingBackendServer(candidateUrl?: string): Promise<{ success: boolean; message: string; status?: number }> {
  const target = candidateUrl ? candidateUrl.trim().replace(/\/+$/, '') : getBackendOrigin();
  const origin = target.endsWith('/api') ? target.replace(/\/api$/, '') : target;
  const fullTarget = (!origin.startsWith('http://') && !origin.startsWith('https://')) ? `https://${origin}` : origin;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000); // 45s for Render cold start
    const res = await fetch(`${fullTarget}/health`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      return { success: true, message: `Server is active and online (HTTP ${res.status})!`, status: res.status };
    } else {
      return { success: false, message: `Server reached but returned HTTP ${res.status}.`, status: res.status };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, message: 'Server connection timed out after 45s. The Render service is waking up or starting. Please wait a few seconds and try again.' };
    }
    return { success: false, message: `Unable to connect to ${fullTarget}. Check that your Web Service URL is correct and showing 'Live' in Render.` };
  }
}

export function resolveImageUrl(url?: string | null): string {
  if (!url) return '/logo.jpg';
  if (url === '/logo.jpg' || url === 'logo.jpg' || url.includes('basaveshwara_logo') || url.includes('logo.')) {
    return '/logo.jpg';
  }
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const origin = getBackendOrigin();
  if (url.startsWith('/')) {
    return `${origin}${url}`;
  }
  return `${origin}/uploads/${url}`;
}

const getBaseUrl = () => getApiBaseUrl();

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
    const currentBase = getBaseUrl();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(`${currentBase}/auth/restaurant-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) {
        let errDetail = 'Invalid restaurant owner credentials';
        try {
          const err = await res.json();
          errDetail = err.detail || errDetail;
        } catch (_) {}
        throw new Error(errDetail);
      }
      return await res.json();
    } catch (err: any) {
      if (err.message && !err.message.toLowerCase().includes('fetch') && !err.message.toLowerCase().includes('abort')) {
        throw err;
      }
      throw new Error(`Unable to reach backend at ${currentBase}. If this is a Render cloud server, it may take 30-45 seconds to wake up from sleep mode. Please click "Test Server Connection" below or switch to Localhost.`);
    }
  },

  async getProfile() {
    const res = await fetch(`${getBaseUrl()}/auth/me`, {
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
    const res = await fetch(`${getBaseUrl()}/restaurant/orders?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrderById(orderId: string) {
    const res = await fetch(`${getBaseUrl()}/restaurant/orders/${orderId}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async updateOrderStatus(orderId: string, payload: { status: string; prep_time_minutes?: number; rejection_reason?: string; note?: string }) {
    const res = await fetch(`${getBaseUrl()}/restaurant/orders/${orderId}/status`, {
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
    const res = await fetch(`${getBaseUrl()}/restaurant/menu`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch menu');
    return res.json();
  },

  async createMenuItem(data: any) {
    const res = await fetch(`${getBaseUrl()}/restaurant/menu`, {
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
    const res = await fetch(`${getBaseUrl()}/restaurant/menu/${itemId}`, {
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
    const res = await fetch(`${getBaseUrl()}/restaurant/menu/${itemId}/availability`, {
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
    const res = await fetch(`${getBaseUrl()}/restaurant/menu/${itemId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to delete item');
    return res.json();
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${getBaseUrl()}/menu/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(data: any) {
    const res = await fetch(`${getBaseUrl()}/restaurant/categories`, {
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
    const res = await fetch(`${getBaseUrl()}/restaurant/categories/${catId}`, {
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
    const res = await fetch(`${getBaseUrl()}/restaurant/categories/${catId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${getBaseUrl()}/restaurant/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(data: any) {
    const res = await fetch(`${getBaseUrl()}/restaurant/settings`, {
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
    const res = await fetch(`${getBaseUrl()}/coupons`);
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
  },

  async createCoupon(data: any) {
    const res = await fetch(`${getBaseUrl()}/coupons`, {
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
    const res = await fetch(`${getBaseUrl()}/coupons/${couponId}/toggle`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to toggle coupon');
    return res.json();
  },

  async deleteCoupon(couponId: string) {
    const res = await fetch(`${getBaseUrl()}/coupons/${couponId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to delete coupon');
    return res.json();
  },

  // Analytics
  async getAnalyticsDashboard() {
    const res = await fetch(`${getBaseUrl()}/analytics/dashboard`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  getExportCsvUrl() {
    return `${getBaseUrl()}/analytics/export-csv`;
  },

  // Customers
  async getCustomers() {
    const res = await fetch(`${getBaseUrl()}/restaurant/customers`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch customer list');
    return res.json();
  },

  // Security & Admin Credentials
  async changeCredentials(payload: { current_password: string; new_name?: string; new_email?: string; new_password?: string }) {
    const res = await fetch(`${getBaseUrl()}/auth/change-credentials`, {
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
    const res = await fetch(`${getBaseUrl()}/auth/admins`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch admin users');
    return res.json();
  },

  async createAdmin(payload: { name: string; email: string; phone: string; password: string; role?: string }) {
    const res = await fetch(`${getBaseUrl()}/auth/admins`, {
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
    const res = await fetch(`${getBaseUrl()}/auth/admins/${adminId}`, {
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
    const res = await fetch(`${getBaseUrl()}/upload`, {
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
