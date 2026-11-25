import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OrderReceiptModal } from './components/OrderReceiptModal';
import { DashboardOverview } from './pages/DashboardOverview';
import { LiveOrdersPage } from './pages/LiveOrdersPage';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { CategoryManagementPage } from './pages/CategoryManagementPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { CustomersPage } from './pages/CustomersPage';
import { CouponsPage } from './pages/CouponsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SecurityPage } from './pages/SecurityPage';
import { TablesQrPage } from './pages/TablesQrPage';

import { useAdminAuth } from './context/AdminAuthContext';
import { Order, MenuItem, Category, AnalyticsDashboard, RestaurantSettings, RestaurantTable, TableServiceRequest } from './types';
import { api } from './services/api';
import { restaurantWs } from './services/websocket';
import { startOrderAlarm, stopOrderAlarm, onAlarmStateChange, playTestSound } from './utils/audio';
import {
  DEFAULT_SETTINGS,
  DEFAULT_CATEGORIES,
  DEFAULT_MENU_ITEMS,
  DEFAULT_ORDERS,
  DEFAULT_ANALYTICS
} from './data/defaultData';
import { BellRing, VolumeX, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Global State pre-seeded with full defaults so editable options and controls are immediately visible
  const [orders, setOrders] = useState<Order[]>(DEFAULT_ORDERS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(DEFAULT_ANALYTICS);
  const [settings, setSettings] = useState<RestaurantSettings | null>(DEFAULT_SETTINGS);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [serviceRequests, setServiceRequests] = useState<TableServiceRequest[]>([]);

  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);

  // 20-30s Persistent Kitchen Alarm State
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(false);
  const [alarmOrderId, setAlarmOrderId] = useState<string | null>(null);

  useEffect(() => {
    const unsubAlarm = onAlarmStateChange((active, orderId) => {
      setIsAlarmActive(active);
      setAlarmOrderId(orderId);
    });
    return () => unsubAlarm();
  }, []);

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const results = await Promise.allSettled([
        api.getOrders({ limit: 100 }),
        api.getMenu(),
        api.getCategories(),
        api.getAnalyticsDashboard(),
        api.getSettings(),
        api.getTables(),
        api.getServiceRequests()
      ]);

      if (results[0].status === 'fulfilled' && results[0].value?.orders) {
        setOrders(results[0].value.orders);
      }
      if (results[1].status === 'fulfilled' && Array.isArray(results[1].value) && results[1].value.length > 0) {
        setMenuItems(results[1].value);
      }
      if (results[2].status === 'fulfilled' && Array.isArray(results[2].value) && results[2].value.length > 0) {
        setCategories(results[2].value);
      }
      if (results[3].status === 'fulfilled' && results[3].value) {
        setAnalytics(results[3].value);
      }
      if (results[4].status === 'fulfilled' && results[4].value) {
        setSettings(results[4].value);
      }
      if (results[5].status === 'fulfilled' && Array.isArray(results[5].value)) {
        setTables(results[5].value);
      }
      if (results[6].status === 'fulfilled' && Array.isArray(results[6].value)) {
        setServiceRequests(results[6].value);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
    restaurantWs.connect();

    const unsub = restaurantWs.subscribe((data) => {
      setIsWsConnected(restaurantWs.getIsConnected());

      if (data.event === 'new_order') {
        // Trigger 20-30 seconds persistent kitchen alarm
        startOrderAlarm(data.order?.order_id);

        // Browser notification if permitted
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            new Notification('🔔 New Paid Order Received!', {
              body: `Order #${data.order?.order_id || ''} (₹${data.order?.total_amount || ''}) is waiting for kitchen acceptance.`,
              icon: '/logo.jpg'
            });
          } catch (nErr) {}
        }

        // New incoming order from customer
        setOrders((prev) => [data.order, ...prev.filter(o => o.order_id !== data.order.order_id)]);
        // Also refresh analytics
        api.getAnalyticsDashboard().then(setAnalytics).catch(() => {});
      } else if (data.event === 'order_status_updated' || data.event === 'payment_confirmed') {
        // If any order is accepted, rejected, or completed, stop alarm!
        if (data.order && data.order.order_status !== 'PLACED') {
          stopOrderAlarm();
        }
        if (data.order) {
          setOrders((prev) =>
            prev.map((o) => (o.order_id === data.order.order_id ? data.order : o))
          );
        } else {
          api.getOrders({ limit: 100 }).then((res) => setOrders(res.orders || [])).catch(() => {});
        }
        api.getAnalyticsDashboard().then(setAnalytics).catch(() => {});
      } else if (data.event === 'restaurant_status_changed' && data.settings) {
        setSettings(data.settings);
      } else if (data.event === 'table_service_request' && data.request) {
        setServiceRequests((prev) => [data.request, ...prev.filter((r) => r.id !== data.request.id)]);
        playTestSound();
        api.getTables().then(setTables).catch(() => {});
      } else if (data.event === 'service_request_resolved' && data.request) {
        setServiceRequests((prev) =>
          prev.map((r) => (r.id === data.request.id ? data.request : r))
        );
        api.getTables().then(setTables).catch(() => {});
      } else if (data.event === 'table_updated') {
        api.getTables().then(setTables).catch(() => {});
      }
    });

    // Periodic check on WS connection state
    const checkInterval = setInterval(() => {
      setIsWsConnected(restaurantWs.getIsConnected());
    }, 3000);

    return () => {
      unsub();
      clearInterval(checkInterval);
    };
  }, []);

  const pendingOrdersCount = orders.filter((o) => o.order_status === 'PLACED').length;
  const pendingServiceRequests = serviceRequests.filter((r) => r.status === 'PENDING');
  const pendingServiceCount = pendingServiceRequests.length;

  const handleToggleAcceptingOrders = async () => {
    if (!settings) return;
    try {
      const newState = !settings.is_accepting_orders;
      const updated = await api.updateSettings({ is_accepting_orders: newState });
      setSettings(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to update store status');
    }
  };

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    overview: { title: 'Dashboard Overview', subtitle: 'Live business snapshot, incoming orders, and key metrics' },
    live_orders: { title: 'Live Kitchen Orders', subtitle: 'Real-time kitchen order processing and delivery handover' },
    tables_qr: { title: 'Smart QR Tables & Floor Control', subtitle: 'Table QR generator, printable tent cards, live occupancy, and waiter calls' },
    menu: { title: 'Food Menu Management', subtitle: 'Catalog pricing, descriptions, food photos, and stock availability' },
    categories: { title: 'Category Management', subtitle: 'Organize and structure the vegetarian menu sections' },
    orders_history: { title: 'Order History', subtitle: 'Comprehensive archive of fulfilled and cancelled orders' },
    customers: { title: 'Customer Directory', subtitle: 'Patron profiles, total orders, lifetime expenditure, and addresses' },
    coupons: { title: 'Coupons & Promos', subtitle: 'Discount campaigns and promotional offers' },
    analytics: { title: 'Reports & Analytics', subtitle: 'Revenue breakdowns, popular dishes, and financial metrics' },
    settings: { title: 'Display & Restaurant Settings', subtitle: 'Customer header editor, announcement banners, operating hours, delivery fees, and online ordering controls' },
    security: { title: 'Admin Security & Credentials', subtitle: 'Manage administrator passwords, usernames, and kitchen staff accounts' },
  };

  const headerInfo = pageTitles[currentTab] || { title: 'Dashboard', subtitle: '' };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-brand-500 selection:text-white">
      {/* Sidebar (Desktop permanent + Mobile slide-out drawer) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingOrderCount={pendingOrdersCount}
        pendingServiceCount={pendingServiceCount}
        isAcceptingOrders={settings?.is_accepting_orders ?? true}
        onToggleAcceptingOrders={handleToggleAcceptingOrders}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          isWsConnected={isWsConnected}
          onRefresh={loadAllData}
          isRefreshing={isRefreshing}
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          pendingOrderCount={pendingOrdersCount}
          pendingServiceCount={pendingServiceCount}
        />

        <main className="flex-1">
          {currentTab === 'overview' && (
            <DashboardOverview
              analytics={analytics}
              recentOrders={orders}
              onSelectTab={setCurrentTab}
              onViewReceipt={(o) => setViewingReceiptOrder(o)}
            />
          )}

          {currentTab === 'live_orders' && (
            <LiveOrdersPage
              orders={orders}
              onRefresh={loadAllData}
              onViewReceipt={(o) => setViewingReceiptOrder(o)}
            />
          )}

          {currentTab === 'tables_qr' && (
            <TablesQrPage
              tables={tables}
              serviceRequests={serviceRequests}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'menu' && (
            <MenuManagementPage
              menuItems={menuItems}
              categories={categories}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'categories' && (
            <CategoryManagementPage
              categories={categories}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'orders_history' && (
            <OrderHistoryPage
              onViewReceipt={(o) => setViewingReceiptOrder(o)}
            />
          )}

          {currentTab === 'customers' && <CustomersPage />}

          {currentTab === 'coupons' && <CouponsPage />}

          {currentTab === 'analytics' && <AnalyticsPage analytics={analytics} />}

          {currentTab === 'settings' && (
            <SettingsPage
              settings={settings}
              onRefresh={loadAllData}
            />
          )}

          {currentTab === 'security' && <SecurityPage />}
        </main>
      </div>

      {/* Floating 20-30s Kitchen Alarm Banner */}
      {isAlarmActive && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white rounded-3xl p-4 shadow-2xl shadow-red-600/40 border-2 border-white/30 flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <BellRing className="w-6 h-6 text-white animate-spin" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white text-red-700 font-black text-[10px] tracking-wider uppercase">
                  NEW ORDER
                </span>
                <h4 className="font-black text-sm text-white truncate">
                  {alarmOrderId ? `Order #${alarmOrderId}` : 'Incoming Order'}
                </h4>
              </div>
              <p className="text-[11px] text-orange-100 font-medium truncate mt-0.5">
                Kitchen Alarm Ringing (20-30s). Accepts automatically silence alarm.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                stopOrderAlarm();
                setCurrentTab('live_orders');
              }}
              className="px-3.5 py-2 bg-white hover:bg-orange-50 text-red-700 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              <span>Accept Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => stopOrderAlarm()}
              className="p-2 bg-black/20 hover:bg-black/30 text-white rounded-xl transition"
              title="Silence Alarm Sound"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Table Waiter Call / Bill Request Alert */}
      {pendingServiceCount > 0 && currentTab !== 'tables_qr' && (
        <div className="fixed bottom-5 right-5 z-40 max-w-sm w-11/12 bg-slate-900 text-white rounded-3xl p-4 shadow-2xl border-2 border-amber-400 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-black text-[10px] uppercase">
                TABLE ALERT ({pendingServiceCount})
              </span>
              <span className="font-bold text-xs truncate">
                {pendingServiceRequests[0].table_number} • {pendingServiceRequests[0].request_type.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate mt-0.5">
              {pendingServiceRequests[0].table_name} needs attention
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('tables_qr')}
            className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs rounded-xl shrink-0 transition"
          >
            View Tables
          </button>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <OrderReceiptModal
        order={viewingReceiptOrder}
        onClose={() => setViewingReceiptOrder(null)}
      />
    </div>
  );
};
