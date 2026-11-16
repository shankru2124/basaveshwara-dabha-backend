import React, { useState, useEffect } from 'react';
import { Home, UtensilsCrossed, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { InstallAppButton } from './components/InstallAppButton';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { Category, MenuItem, RestaurantSettings } from './types';
import { api } from './services/api';
import { customerWs } from './services/websocket';
import { useCart } from './context/CartContext';

export const App: React.FC = () => {
  const { totalItemCount, setIsCartOpen } = useCart();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [todaySpecials, setTodaySpecials] = useState<MenuItem[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  const loadInitialData = async () => {
    try {
      const [cats, feat, sets] = await Promise.all([
        api.getCategories(),
        api.getFeatured(),
        api.getSettings()
      ]);
      setCategories(cats);
      setTodaySpecials(feat.today_specials || []);
      setPopularItems(feat.popular_items || []);
      setSettings(sets);
    } catch (err) {
      console.error('Failed to load initial customer app data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
    customerWs.connect();

    const unsub = customerWs.subscribe((data) => {
      if (data.event === 'restaurant_status_changed' && data.settings) {
        setSettings(data.settings);
      } else if (data.event === 'menu_updated' || data.event === 'food_availability_changed') {
        loadInitialData();
      }
    });

    return () => unsub();
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'track' && params?.orderId) {
      setActiveTrackingOrderId(params.orderId);
    }
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Banner Alert if Restaurant is Closed */}
      {settings && !settings.is_accepting_orders && (
        <div className="bg-red-600 text-white text-xs font-bold text-center py-2 px-4 shadow-md">
          ⚠️ Basaveshwara Dabha is currently closed and not accepting online orders.{' '}
          {settings.closed_reason || `We will reopen at ${settings.opening_time}.`}
        </div>
      )}

      {/* PWA Install Banner (Only shown in mobile/desktop browser, hidden inside installed app) */}
      <InstallAppButton variant="banner" />

      {/* Main Navbar */}
      <Navbar
        settings={settings}
        currentPage={currentPage}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16 md:pb-0">
        {currentPage === 'home' && (
          <HomePage
            categories={categories}
            todaySpecials={todaySpecials}
            popularItems={popularItems}
            settings={settings}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              handleNavigate('menu');
            }}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'menu' && (
          <MenuPage
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onBack={() => handleNavigate('menu')}
            onOrderSuccess={(orderId) => {
              setActiveTrackingOrderId(orderId);
              handleNavigate('track', { orderId });
            }}
          />
        )}

        {currentPage === 'track' && (
          <OrderTrackingPage
            orderId={activeTrackingOrderId}
            onBack={() => handleNavigate('home')}
          />
        )}

        {currentPage === 'orders' && (
          <OrderHistoryPage
            onTrackOrder={(orderId) => {
              setActiveTrackingOrderId(orderId);
              handleNavigate('track', { orderId });
            }}
            onExploreMenu={() => handleNavigate('menu')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentPage === 'profile' && <ProfilePage />}
      </main>

      {/* Footer */}
      <Footer settings={settings} />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onCheckout={() => handleNavigate('checkout')}
        onExploreMenu={() => handleNavigate('menu')}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar (Swiggy / Zomato style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 px-6 shadow-xl flex items-center justify-around">
        <button
          onClick={() => handleNavigate('home')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition ${
            currentPage === 'home' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleNavigate('menu')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition ${
            currentPage === 'menu' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span>Menu</span>
        </button>

        <button
          onClick={() => handleNavigate('orders')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold transition ${
            currentPage === 'orders' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Orders</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-gray-900 transition"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart</span>
          {totalItemCount > 0 && (
            <span className="absolute -top-1 right-2 bg-brand-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-extrabold shadow-sm">
              {totalItemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
