import React from 'react';
import { Wifi, WifiOff, Bell, Clock, RefreshCw } from 'lucide-react';
import { InstallAdminAppButton } from './InstallAdminAppButton';

interface HeaderProps {
  title: string;
  subtitle: string;
  isWsConnected: boolean;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  isWsConnected,
  onRefresh,
  isRefreshing
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
        {/* PWA Install Button (Only visible on browser; auto-hidden when inside installed app) */}
        <InstallAdminAppButton />

        {/* Real-time status badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
          isWsConnected
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {isWsConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Sync Active</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <WifiOff className="w-3.5 h-3.5 text-red-600" />
              <span>Reconnecting...</span>
            </>
          )}
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
        </button>
      </div>
    </header>
  );
};
