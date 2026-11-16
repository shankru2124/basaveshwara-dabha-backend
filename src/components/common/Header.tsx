import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { defaultSettings } from '../../data/menuData';
import { ShoppingBag, Globe, Bell, Leaf, ArrowLeft, Shield } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenHistory: () => void;
  activeTab: 'menu' | 'track';
  setActiveTab: (tab: 'menu' | 'track') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenHistory, activeTab, setActiveTab }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { itemCount, totalAmount } = useCart();
  const { role, setRole } = useAuth();
  const { activeOrders, currentCustomerOrderId } = useOrders();

  const activeCustomerOrder = activeOrders.find(
    (o) => o.id === currentCustomerOrderId && !['delivered', 'cancelled', 'rejected'].includes(o.status)
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-amber-200/80">
      {/* Top Mini Banner: 100% Pure Veg & Free Delivery Notice */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 text-white px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-extrabold text-[11px] border border-emerald-500 shadow-xs">
            <span className="veg-indicator !w-3 !h-3">
              <span className="veg-indicator-dot !w-1 !h-1"></span>
            </span>
            <span>{t.pureVegBadge}</span>
          </span>

          <span className="font-semibold text-emerald-100 hidden sm:inline text-xs font-kannada">
            {t.topAnnouncement}
          </span>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-emerald-50 font-bold text-xs border border-white/20 transition-all hover:scale-105"
            title="Switch Language / ಭಾಷೆ ಬದಲಾಯಿಸಿ"
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'kn' ? 'English' : 'ಕನ್ನಡ'}</span>
          </button>
        </div>
      </div>

      {/* Staff Mode Return Bar (Only visible when staff is logged in) */}
      {role !== 'customer' && (
        <div className="bg-[#2A1810] text-amber-300 px-4 py-2 text-xs flex items-center justify-between border-b border-[#4E2E1B]">
          <div className="flex items-center gap-2 font-bold">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>
              Staff Mode Active: <strong className="uppercase text-white">{role}</strong>
            </span>
          </div>

          <button
            onClick={() => setRole('customer')}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backToStore}</span>
          </button>
        </div>
      )}

      {/* Main Customer Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab('menu')}
        >
          {/* Logo image uploaded by user */}
          <div className="h-12 md:h-14 w-auto rounded-xl overflow-hidden border border-amber-300 shadow-sm bg-white p-0.5 flex-shrink-0 group-hover:shadow-md transition-shadow">
            <img
              src="/logo.png"
              alt="Basaveshwara Dabha Logo"
              className="h-full w-auto object-contain"
            />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-amber-900 font-kannada leading-tight group-hover:text-amber-700 transition-colors">
                ಬಸವೇಶ್ವರ ದಾಬಾ
              </h1>
              <span className="text-[11px] md:text-xs font-bold text-stone-500 uppercase tracking-wider hidden sm:inline">
                Basaveshwara Dabha
              </span>
            </div>

            <p className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 font-kannada">
              <Leaf className="w-3 h-3 text-emerald-600" />
              <span>{t.pureVegSub}</span>
            </p>
          </div>
        </div>

        {/* Customer Controls (Cart, Live Order, History) */}
        {role === 'customer' && (
          <div className="flex items-center gap-2 md:gap-3">
            {/* Live Order Indicator (If active) */}
            {activeCustomerOrder && (
              <button
                onClick={() => setActiveTab('track')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  activeTab === 'track'
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                <span className="hidden sm:inline font-kannada">{t.trackOrder}</span>
                <span className="font-mono">{activeCustomerOrder.order_number}</span>
              </button>
            )}

            {/* Menu vs Track Switch */}
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-colors font-kannada ${
                activeTab === 'menu'
                  ? 'bg-amber-100 text-amber-950 border border-amber-300'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              {t.viewMenu}
            </button>

            {/* Past Orders History Button */}
            <button
              onClick={onOpenHistory}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors relative"
              title={t.orderHistory}
            >
              <Bell className="w-5 h-5 text-amber-900" />
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-stone-950" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-5 h-5 bg-emerald-700 text-white rounded-full text-[10px] flex items-center justify-center font-extrabold border-2 border-white shadow-xs">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-start text-left leading-none">
                <span className="text-[10px] uppercase font-bold text-stone-900/80 font-kannada">
                  {itemCount} {language === 'kn' ? 'ಖಾದ್ಯಗಳು' : 'items'}
                </span>
                <span className="text-sm font-black text-stone-950 font-mono">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
