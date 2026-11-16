import React from 'react';
import { Home, UtensilsCrossed, ShoppingBag, Clock, User as UserIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  onNavigate,
  onOpenAuth
}) => {
  const { totalItemCount, setIsCartOpen, isCartOpen } = useCart();
  const { isAuthenticated } = useAuth();

  // Hide mobile bottom bar when Cart is open so it never covers or obstructs the checkout button
  if (isCartOpen) return null;

  const handleProfileClick = () => {
    if (isAuthenticated) {
      onNavigate('profile');
    } else {
      onOpenAuth();
    }
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      onClick: () => onNavigate('home')
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: UtensilsCrossed,
      onClick: () => onNavigate('menu')
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingBag,
      badge: totalItemCount > 0 ? totalItemCount : null,
      onClick: () => setIsCartOpen(true)
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Clock,
      onClick: () => onNavigate('orders')
    },
    {
      id: 'profile',
      label: isAuthenticated ? 'Profile' : 'Login',
      icon: UserIcon,
      onClick: handleProfileClick
    }
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-2 pt-2 pb-safe"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-brand-600 font-extrabold'
                  : 'text-gray-500 hover:text-gray-900 font-semibold'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-brand-50 text-brand-600 scale-110 shadow-sm' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Badge for Cart count */}
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-gradient-to-r from-red-500 to-brand-600 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black shadow-md border-2 border-white animate-in zoom-in-50">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'text-brand-600 font-bold' : 'text-gray-600'
                }`}
              >
                {item.label}
              </span>

              {/* Active Dot Indicator */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-0.5 animate-in fade-in zoom-in-75 duration-200" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
