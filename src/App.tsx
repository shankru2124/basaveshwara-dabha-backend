import React, { useState, useMemo, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CartProvider, useCart } from './context/CartContext';
import { OrderProvider, useOrders } from './context/OrderContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider, useProducts } from './context/ProductContext';
import { initialCategories } from './data/menuData';

// Components
import { Header } from './components/common/Header';
import { AudioAlarmBanner } from './components/common/AudioAlarmBanner';
import { Footer } from './components/common/Footer';
import { HeroBanner } from './components/customer/HeroBanner';
import { CategoryFilter } from './components/customer/CategoryFilter';
import { ProductCard } from './components/customer/ProductCard';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderTracker } from './components/customer/OrderTracker';
import { OrderHistoryModal } from './components/customer/OrderHistoryModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { KitchenDisplaySystem } from './components/kitchen/KitchenDisplaySystem';
import { DeliveryDashboard } from './components/delivery/DeliveryDashboard';

const MainAppContent: React.FC = () => {
  const { role, setRole } = useAuth();
  const { language } = useLanguage();
  const { isCartOpen, setIsCartOpen } = useCart();
  const { currentCustomerOrderId, setCurrentCustomerOrderId } = useOrders();
  const { products } = useProducts();

  // Navigation state for Customer view: 'menu' | 'track'
  const [activeTab, setActiveTab] = useState<'menu' | 'track'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Check URL portal query param (?portal=admin, ?portal=kitchen, ?portal=delivery)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const portal = params.get('portal');
    if (portal === 'admin' || portal === 'kitchen' || portal === 'delivery') {
      setRole(portal);
    }
  }, [setRole]);

  // Filter products (100% Pure Veg)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (product.category_id !== selectedCategory) {
          return false;
        }
      }

      // Search query (English or Kannada)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesEn = product.name_en.toLowerCase().includes(q) || product.description_en.toLowerCase().includes(q);
        const matchesKn = product.name_kn.toLowerCase().includes(q) || product.description_kn.toLowerCase().includes(q);
        if (!matchesEn && !matchesKn) return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleOrderSuccess = (newOrderId: string) => {
    setCurrentCustomerOrderId(newOrderId);
    setActiveTab('track');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Header - In customer view, NO admin switcher is displayed */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Repeating Audio Alarm Banner - ONLY visible to staff (Admin/Kitchen/Delivery) */}
      {role !== 'customer' && <AudioAlarmBanner />}

      {/* Main Body per Role */}
      <main className="flex-1">
        {/* CUSTOMER PORTAL - ONLY section regular customers see */}
        {role === 'customer' && (
          <div className="max-w-7xl mx-auto px-4">
            {activeTab === 'menu' ? (
              <>
                <HeroBanner />

                <CategoryFilter
                  categories={initialCategories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />

                {/* Products Grid */}
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 font-kannada">
                      <span className="veg-indicator">
                        <span className="veg-indicator-dot" />
                      </span>
                      <h2 className="text-xl font-black text-amber-950 tracking-tight">
                        ೧೦೦% ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ ಮೆನು
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 font-kannada">
                      {filteredProducts.length} ತಿಂಡಿಗಳು ಲಭ್ಯ
                    </span>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-amber-200">
                      <p className="text-stone-600 text-sm font-bold font-kannada">
                        ಯಾವುದೇ ತಿಂಡಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಹುಡುಕಾಟವನ್ನು ಬದಲಾಯಿಸಿ.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          setSearchQuery('');
                        }}
                        className="mt-3 px-5 py-2 bg-amber-500 text-stone-950 font-black rounded-xl text-xs font-kannada shadow-sm"
                      >
                        ಎಲ್ಲಾ ತಿಂಡಿಗಳನ್ನು ತೋರಿಸಿ
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <OrderTracker
                orderId={currentCustomerOrderId || undefined}
                onBackToMenu={() => setActiveTab('menu')}
              />
            )}
          </div>
        )}

        {/* ADMIN DASHBOARD - Strictly staff authenticated */}
        {role === 'admin' && <AdminDashboard />}

        {/* KITCHEN DISPLAY SYSTEM - Strictly staff authenticated */}
        {role === 'kitchen' && <KitchenDisplaySystem />}

        {/* DELIVERY DASHBOARD - Strictly staff authenticated */}
        {role === 'delivery' && <DeliveryDashboard />}
      </main>

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Past Orders History Modal */}
      <OrderHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectOrder={(selectedId) => {
          setCurrentCustomerOrderId(selectedId);
          setActiveTab('track');
        }}
      />

      {/* Footer with discreet, protected Staff Login */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ProductProvider>
        <CartProvider>
          <OrderProvider>
            <AuthProvider>
              <MainAppContent />
            </AuthProvider>
          </OrderProvider>
        </CartProvider>
      </ProductProvider>
    </LanguageProvider>
  );
}
