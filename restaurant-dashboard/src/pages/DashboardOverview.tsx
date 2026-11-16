import React from 'react';
import {
  DollarSign, ShoppingBag, Clock, CheckCircle2, XCircle,
  TrendingUp, ArrowRight, Flame, ChefHat, Eye
} from 'lucide-react';
import { AnalyticsDashboard, Order } from '../types';

interface DashboardOverviewProps {
  analytics: AnalyticsDashboard | null;
  recentOrders: Order[];
  onSelectTab: (tab: string) => void;
  onViewReceipt: (order: Order) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  analytics,
  recentOrders,
  onSelectTab,
  onViewReceipt
}) => {
  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Sales</span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              ₹{analytics?.today_sales?.toFixed(0) || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">{analytics?.today_orders || 0} orders placed today</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
            <p className="text-2xl font-black text-orange-600 mt-1">
              {analytics?.pending_orders || 0}
            </p>
            <p className="text-[11px] text-orange-500 font-semibold mt-0.5">Awaiting kitchen accept</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Kitchen Prep</span>
            <p className="text-2xl font-black text-amber-600 mt-1">
              {(analytics?.accepted_orders || 0) + (analytics?.preparing_orders || 0)}
            </p>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Cooking in progress</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Order Value</span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              ₹{analytics?.average_order_value?.toFixed(0) || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">{analytics?.completed_orders || 0} orders delivered</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Orders + Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Incoming & Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Recent Kitchen Orders</h3>
              <p className="text-xs text-slate-500 font-medium">Real-time live incoming and active orders</p>
            </div>
            <button
              onClick={() => onSelectTab('live_orders')}
              className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition"
            >
              Live Kitchen Screen <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No orders placed today yet. Incoming orders will pop up in real-time!
                    </td>
                  </tr>
                ) : (
                  recentOrders.slice(0, 7).map((o) => (
                    <tr key={o.order_id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">{o.order_id}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800">{o.customer_name}</p>
                        <p className="text-[10px] text-slate-400">{o.customer_phone}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="truncate max-w-[150px] block" title={o.items.map(i => `${i.name} (${i.quantity})`).join(', ')}>
                          {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">₹{o.total_amount}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            o.order_status === 'PLACED'
                              ? 'bg-red-100 text-red-800 animate-pulse'
                              : o.order_status === 'ACCEPTED'
                              ? 'bg-blue-100 text-blue-800'
                              : o.order_status === 'PREPARING'
                              ? 'bg-amber-100 text-amber-800'
                              : o.order_status === 'READY'
                              ? 'bg-purple-100 text-purple-800'
                              : o.order_status === 'DELIVERED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {o.order_status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onViewReceipt(o)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                          title="View Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Best Selling Dishes */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Top Selling Dishes</h3>
          </div>

          <div className="space-y-3">
            {analytics?.best_selling_dishes && analytics.best_selling_dishes.length > 0 ? (
              analytics.best_selling_dishes.map((dish, idx) => (
                <div key={dish.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center text-[10px]">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 truncate max-w-[160px]">{dish.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{dish.units_sold} sold</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">No sales data recorded yet.</p>
            )}
          </div>

          {/* Quick link to menu */}
          <div className="pt-2">
            <button
              onClick={() => onSelectTab('menu')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
            >
              Manage Food Menu & Prices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
