import React, { useState, useEffect } from 'react';
import { ShoppingBag, User as UserIcon, Search, Clock, Phone, ChevronDown, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { RestaurantSettings } from '../types';
import { resolveImageUrl } from '../services/api';

interface NavbarProps {
  settings: RestaurantSettings | null;
  onOpenAuth: () => void;
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ settings, onOpenAuth, onNavigate, currentPage }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string>('/logo.jpg');
  const [logoImgError, setLogoImgError] = useState(false);

  useEffect(() => {
    if (settings?.logo_url) {
      setLogoSrc(resolveImageUrl(settings.logo_url));
    } else {
      setLogoSrc('/logo.jpg');
    }
  }, [settings?.logo_url]);

  const isOpen = settings?.is_accepting_orders ?? true;

  const topAnnouncement = settings?.header_top_announcement || '100% Pure Vegetarian Kitchen • Authentic Desi Ghee Flavours';
  const noticeText = settings?.header_notice;
  const showAnnouncement = settings?.header_show_announcement ?? true;
  const showPhone = settings?.header_show_phone ?? true;
  const showTimings = settings?.header_show_timings ?? true;
  const brandName = settings?.restaurant_name || 'Basaveshwara Dabha';
  const brandTagline = settings?.header_tagline || settings?.tagline || 'Authentic Pure Vegetarian Flavours';
  const badgeText = settings?.header_badge_text || 'Pure Veg';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      {/* Top micro bar for restaurant announcement (Customizable from Admin) */}
      {showAnnouncement && (
        <div className="bg-gradient-to-r from-amber-50 via-brand-50 to-orange-50 border-b border-brand-100/60 py-1.5 px-4 text-xs font-medium text-brand-950">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-bold text-veg-dark">
                <span className="w-2 h-2 rounded-full bg-veg animate-pulse"></span>
                {topAnnouncement}
              </span>
              {noticeText && (
                <>
                  <span className="hidden md:inline text-brand-300">•</span>
                  <span className="hidden md:inline text-brand-700 font-semibold">{noticeText}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {showTimings && (
                <span className="hidden sm:flex items-center gap-1 text-gray-600 font-medium text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-brand-600" />
                  {settings?.opening_time || '08:00 AM'} - {settings?.closing_time || '11:00 PM'}
                </span>
              )}
              {showPhone && (
                <a
                  href={`tel:${settings?.phone || '9876543210'}`}
                  className="flex items-center gap-1 text-gray-700 hover:text-brand-600 transition font-semibold text-[11px]"
                >
                  <Phone className="w-3 h-3 text-brand-600" />
                  <span>{settings?.phone || '+91 98765 43210'}</span>
                </a>
              )}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-2.5">
        {/* Brand & Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0"
        >
          {/* Logo container with fallback */}
          <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-brand-600 to-amber-500 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300 border border-brand-200/50 flex items-center justify-center shrink-0">
            {!logoImgError ? (
              <img
                src={logoSrc}
                alt={brandName}
                onError={() => {
                  if (logoSrc !== '/logo.jpg') {
                    setLogoSrc('/logo.jpg');
                  } else {
                    setLogoImgError(true);
                  }
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-black text-xl text-white tracking-tight">BD</span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-base sm:text-2xl text-gray-900 tracking-tight group-hover:text-brand-600 transition truncate">
                {brandName}
              </span>
              <span className="w-4 h-4 border border-veg flex items-center justify-center rounded-sm bg-white p-0.5 shrink-0" title={badgeText}>
                <span className="w-2 h-2 rounded-full bg-veg"></span>
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium hidden sm:block truncate">
              {brandTagline}
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-gray-700">
          <button
            onClick={() => onNavigate('home')}
            className={`transition ${currentPage === 'home' ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('menu')}
            className={`transition ${currentPage === 'menu' ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}
          >
            Explore Menu
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className={`transition ${currentPage === 'orders' ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}
          >
            My Orders
          </button>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick Search CTA */}
          <button
            onClick={() => onNavigate('menu')}
            className="p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 rounded-full transition"
            title="Search dishes"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* User Account (Desktop / Tablet - on Mobile it is in the fixed Bottom Bar) */}
          <div className="hidden sm:block">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 text-sm font-semibold text-gray-800 bg-white transition shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('orders');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Order History
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('profile');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4" />
                      Manage Profile & Addresses
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:text-brand-600 hover:bg-brand-50 border border-gray-200 hover:border-brand-200 transition"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Cart Button (Desktop / Tablet - on Mobile it is in the fixed Bottom Bar) */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="hidden sm:flex relative items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 hover:shadow-lg transition active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            {totalItemCount > 0 && (
              <span className="bg-white text-brand-600 text-xs px-2 py-0.5 rounded-full font-extrabold shadow-sm">
                {totalItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
