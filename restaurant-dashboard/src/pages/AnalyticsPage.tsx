import React from 'react';
import { BarChart3, TrendingUp, Download, PieChart, DollarSign, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { AnalyticsDashboard } from '../types';
import { api } from '../services/api';

interface AnalyticsPageProps {
  analytics: AnalyticsDashboard | null;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ analytics }) => {
  const maxSale = Math.max(
    ...(analytics?.recent_sales_chart?.map((d) => d.sales) || [100]),
    100
  );

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Financial & Sales Analytics</h2>
          <p className="text-xs text-slate-500 font-medium">Daily trends, payment channels, order fulfillment metrics and dish demand</p>
        </div>
        <a
          href={api.getExportCsvUrl()}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition"
        >
          <Download className="w-4 h-4" />
          Export All Orders (CSV)
        </a>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Lifetime Sales</span>
          <p className="text-3xl font-black text-slate-900 mt-1">₹{analytics?.total_sales || 0}</p>
          <p className="text-xs text-emerald-600 font-bold mt-1">From {analytics?.total_orders || 0} orders placed</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Today's Revenue</span>
          <p className="text-3xl font-black text-brand-600 mt-1">₹{analytics?.today_sales || 0}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">{analytics?.today_orders || 0} customer orders</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Delivered Orders</span>
          <p className="text-3xl font-black text-emerald-600 mt-1">{analytics?.completed_orders || 0}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">100% kitchen fulfillment</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cancelled / Declined</span>
          <p className="text-3xl font-black text-red-600 mt-1">{analytics?.cancelled_orders || 0}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Refunds processed</p>
        </div>
      </div>

      {/* Sales Trend Bar Chart */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">7-Day Sales Performance</h3>
            <p className="text-xs text-slate-500 font-medium">Daily order revenue trajectory</p>
          </div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-xl">
            Live Database Data
          </span>
        </div>

        <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 border-b border-slate-100">
          {analytics?.recent_sales_chart?.map((d) => {
            const heightPct = Math.max(10, Math.round((d.sales / maxSale) * 100));
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <span className="text-[11px] font-extrabold text-slate-700 opacity-0 group-hover:opacity-100 transition">
                  ₹{d.sales}
                </span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full max-w-[48px] bg-gradient-to-t from-brand-600 to-amber-500 rounded-xl group-hover:brightness-110 transition-all duration-300 shadow-sm"
                ></div>
                <span className="text-[11px] font-bold text-slate-400 truncate max-w-[60px]">
                  {d.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Methods & Dish Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Methods */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Payment Methods Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(analytics?.payment_method_stats || {}).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl text-xs">
                <span className="font-bold text-slate-800">{method}</span>
                <span className="font-black text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200">
                  {count} orders
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Best & Least Selling */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Dish Popularity Ranking</h3>
          <div className="space-y-2.5">
            {analytics?.best_selling_dishes?.map((b, i) => (
              <div key={b.name} className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-2xl text-xs">
                <span className="font-bold text-emerald-950">🏆 #{i + 1} {b.name}</span>
                <span className="font-black text-emerald-700">{b.units_sold} plates sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
