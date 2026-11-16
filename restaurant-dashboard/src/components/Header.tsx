import React from 'react';
import { Wifi, WifiOff, RefreshCw, Menu, LayoutDashboard, BellRing, UtensilsCrossed, Settings, Layers, History } from 'lucide-react';
import { InstallAdminAppButton } from './InstallAdminAppButton';

interface HeaderProps {
  title: string;
  subtitle: string;
  isWsConnected: boolean;
  onRefresh: () => void;
  isRefreshing?: boolean;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onToggleMobileSidebar: () => void;
  pendingOrderCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  isWsConnected,
  onRefresh,
  isRefreshing,
  currentTab,
  onSelectTab,
  onToggleMobileSidebar,
  pendingOrderCount
}) => {
  const quickNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live_orders', label: 'Live Orders', icon: BellRing, badge: pendingOrderCount > 0 ? pendingOrderCount : undefined },
    { id: 'menu', label: 'Food Menu', icon: UtensilsCrossed },
    { id: 'settings', label: 'Restaurant Settings', icon: Settings },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'orders_history', label: 'Order History', icon: History },
  ];

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      {/* Top Bar */}
      <div className="px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl md:hidden transition border border-slate-200"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">{title}</h2>
            <p className="text-xs text-slate-500 font-medium hidden sm:block truncate">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* PWA Install Button */}
          <InstallAdminAppButton />

          {/* Real-time status badge */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold ${
            isWsConnected
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-emerald-50/80 border border-emerald-200 text-emerald-700'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Real-Time Active</span>
          </div>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Navigation Scrollable Tabs Bar */}
      <div className="px-4 sm:px-8 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {quickNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
