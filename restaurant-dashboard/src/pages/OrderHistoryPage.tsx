import React, { useState, useEffect } from 'react';
import { Search, Filter, Printer, RefreshCw, Calendar, Eye, Download } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';

interface OrderHistoryPageProps {
  onViewReceipt: (order: Order) => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onViewReceipt }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.getOrders({
        search: search || undefined,
        status_filter: statusFilter === 'ALL' ? undefined : statusFilter,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit: 100
      });
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load orders history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Order History & Archives</h2>
          <p className="text-xs text-slate-500 font-medium">Search, filter, inspect and print historical customer receipts</p>
        </div>
        <div className="flex gap-2">
          <a
            href={api.getExportCsvUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
          <button
            onClick={fetchOrders}
            className="p-2.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search Order ID, Customer name or Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-semibold"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLACED">Placed (Pending)</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="SERVED">Served (Awaiting Bill)</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Bill Paid / Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition"
        >
          Search Orders
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.order_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <p className="font-extrabold text-slate-900">{o.order_id}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(o.created_at).toLocaleString()}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{o.customer_name}</p>
                      <p className="text-[10px] text-slate-400">{o.customer_phone}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold uppercase text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {o.fulfillment_type}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="truncate max-w-xs block" title={o.items.map(i => `${i.name} (${i.quantity})`).join(', ')}>
                        {o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-black text-slate-900 text-sm">
                      ₹{o.total_amount}
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-[11px] font-bold text-slate-800">{o.payment_method}</p>
                      <p className={`text-[10px] font-semibold ${
                        o.payment_status === 'COMPLETED' ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {o.payment_status}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        o.order_status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : o.order_status === 'CANCELLED' || o.order_status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.order_status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onViewReceipt(o)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Ticket</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
