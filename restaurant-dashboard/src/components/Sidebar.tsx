import React from 'react';
import {
  LayoutDashboard, BellRing, UtensilsCrossed, Layers, History,
  Users, Tag, BarChart3, Settings, LogOut, Volume2, ShieldCheck,
  Power
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { playTestSound, requestNotificationPermission } from '../utils/audio';
import { InstallAdminAppButton } from './InstallAdminAppButton';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  pendingOrderCount: number;
  isAcceptingOrders: boolean;
  onToggleAcceptingOrders: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingOrderCount,
  isAcceptingOrders,
  onToggleAcceptingOrders
}) => {
  const { admin, logout } = useAdminAuth();

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    {
      id: 'live_orders',
      label: 'Live Kitchen Orders',
      icon: BellRing,
      badge: pendingOrderCount > 0 ? pendingOrderCount : undefined,
      badgeColor: 'bg-red-500'
    },
    { id: 'menu', label: 'Food Menu', icon: UtensilsCrossed },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'orders_history', label: 'Order History', icon: History },
    { id: 'customers', label: 'Customer Directory', icon: Users },
    { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
    { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Restaurant Settings', icon: Settings },
    { id: 'security', label: 'Admin Security', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/80 shadow-md shrink-0 flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="Basaveshwara Dabha"
              onError={(e) => {
                // If image fails, replace with text
                (e.target as HTMLElement).style.display = 'none';
              }}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-tight">
              Basaveshwara
            </h1>
            <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
              Admin Dashboard
            </p>
          </div>
        </div>

        {/* Live Accepting Orders Toggle Card */}
        <div className="p-4 mx-3 my-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Store Status</p>
              <p className={`text-[11px] font-semibold ${isAcceptingOrders ? 'text-green-400' : 'text-red-400'}`}>
                {isAcceptingOrders ? 'Accepting Orders' : 'Store Paused'}
              </p>
            </div>
            <button
              onClick={onToggleAcceptingOrders}
              className={`p-2 rounded-xl text-white transition ${
                isAcceptingOrders ? 'bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/30' : 'bg-red-600 hover:bg-red-700'
              }`}
              title="Toggle Online Ordering"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`${item.badgeColor} text-white font-black text-[10px] px-2 py-0.5 rounded-full animate-bounce`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer controls & Profile */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {/* PWA Install Button for Sidebar (Only in browser, hidden when inside installed app) */}
        <InstallAdminAppButton variant="sidebar" />

        {/* Sound Test / Notification Permissions */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <button
            onClick={() => {
              playTestSound();
              requestNotificationPermission();
            }}
            className="flex items-center gap-1.5 hover:text-white transition font-semibold"
            title="Test Kitchen Audio Ringtone"
          >
            <Volume2 className="w-3.5 h-3.5 text-brand-400" />
            <span>Test Sound Alert</span>
          </button>
        </div>

        {/* User profile info & logout */}
        <div className="bg-slate-800/80 p-3 rounded-2xl flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold text-white truncate">{admin?.name || 'Administrator'}</p>
            <p className="text-[10px] text-slate-400 truncate">{admin?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
