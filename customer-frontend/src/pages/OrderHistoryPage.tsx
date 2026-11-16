import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, ChevronRight, Clock, MapPin, RefreshCw, AlertCircle,
  Search, CheckCircle2, RotateCcw, Printer, Phone, Calendar, ArrowRight, Sparkles
} from 'lucide-react';
import { Order, MenuItem } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface OrderHistoryPageProps {
  onTrackOrder: (orderId: string) => void;
  onExploreMenu: () => void;
  onOpenAuth: () => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({
  onTrackOrder,
  onExploreMenu,
  onOpenAuth
}) => {
  const { user, isAuthenticated } = useAuth();
  const { addItem, setIsCartOpen } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Could not load past orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  const handleReorder = async (order: Order) => {
    setReorderingId(order.order_id);
    try {
      // Fetch fresh menu to get current item availability and pricing
      const allMenu: MenuItem[] = await api.getMenuItems();
      let addedCount = 0;

      order.items.forEach((orderedItem) => {
        const found = allMenu.find((m) => m.id === orderedItem.item_id || m.name.toLowerCase() === orderedItem.name.toLowerCase());
        if (found && found.is_available) {
          addItem(found, orderedItem.quantity || 1);
          addedCount++;
        }
      });

      if (addedCount > 0) {
        setIsCartOpen(true);
      } else {
        alert('Some items from this previous order are currently unavailable on today\'s menu.');
      }
    } catch (e) {
      console.error('Reorder error:', e);
    } finally {
      setReorderingId(null);
    }
  };

  const isOrderActive = (status: string) => {
    return ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(status);
  };

  const filteredOrders = orders.filter((o) => {
    // Search query
    const matchesSearch =
      o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((it) => it.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter === 'ACTIVE') {
      return isOrderActive(o.order_status);
    }
    if (statusFilter === 'COMPLETED') {
      return o.order_status === 'DELIVERED' || o.order_status === 'CANCELLED';
    }
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-5 animate-in fade-in duration-200">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-50 to-orange-100 mx-auto flex items-center justify-center text-brand-600 shadow-sm border border-brand-200">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sign In to View Your Orders</h2>
        <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
          Access your complete Basaveshwara Dabha order history, live order statuses, and reorder your favourite pure veg dishes in one click!
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-700 hover:to-amber-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-brand-500/25 transition transform active:scale-98"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-28 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-gray-500">Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">My Orders</h1>
            <span className="bg-brand-50 text-brand-700 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-brand-200">
              {orders.length} Total
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Review past orders, track live food preparation, and reorder anytime
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 hover:text-brand-600 bg-white border border-gray-200 hover:border-brand-200 rounded-xl shadow-sm transition"
          title="Refresh orders"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl self-start">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'ALL'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'ACTIVE'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live / Active ({orders.filter((o) => isOrderActive(o.order_status)).length})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === 'COMPLETED'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Delivered / Past
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID or dish name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-brand-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-gray-900 text-lg">No matching orders found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? `No orders matching "${searchQuery}". Try searching with a different keyword.`
              : "You don't have any orders in this category yet. Treat yourself to our delicious pure veg thalis, dosas, and biriyanis!"}
          </p>
          <button
            onClick={onExploreMenu}
            className="px-6 py-3 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-700 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition"
          >
            Explore Today's Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => {
            const active = isOrderActive(o.order_status);

            return (
              <div
                key={o.order_id}
                className={`bg-white rounded-3xl border transition shadow-sm hover:shadow-md overflow-hidden ${
                  active ? 'border-brand-200 ring-1 ring-brand-100' : 'border-gray-100'
                }`}
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-sm text-gray-900 tracking-tight">
                        Order #{o.order_id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        o.fulfillment_type === 'DELIVERY'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {o.fulfillment_type}
                      </span>
                      {o.payment_method && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                          {o.payment_method.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>
                        {new Date(o.created_at).toLocaleDateString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        o.order_status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : o.order_status === 'CANCELLED' || o.order_status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                      }`}
                    >
                      {active && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                      <span>{o.order_status.replace(/_/g, ' ')}</span>
                    </span>
                  </div>
                </div>

                {/* Items & Details */}
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="space-y-2">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {/* Veg dot icon */}
                          <span className="w-3.5 h-3.5 border border-veg flex items-center justify-center rounded-sm p-0.5 shrink-0 bg-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-veg"></span>
                          </span>
                          <span className="font-bold text-gray-800">
                            {it.name}
                          </span>
                          <span className="text-gray-400 font-semibold">
                            × {it.quantity}
                          </span>
                        </div>
                        <span className="font-extrabold text-gray-900">
                          ₹{it.total}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery address if delivery */}
                  {o.delivery_address && (
                    <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                      <span>
                        Delivering to: <strong className="text-gray-700">{o.delivery_address.address_line}</strong>
                        {o.delivery_address.landmark ? `, Near ${o.delivery_address.landmark}` : ''}
                      </span>
                    </div>
                  )}

                  {/* Summary Bar */}
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">Paid Amount: </span>
                      <span className="font-black text-sm text-gray-900">₹{o.total_amount}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.payment_status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {o.payment_status === 'COMPLETED' ? '✓ Paid' : 'Payment Pending'}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {/* Reorder Button */}
                      <button
                        type="button"
                        onClick={() => handleReorder(o)}
                        disabled={reorderingId === o.order_id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-bold text-xs transition"
                        title="Add these dishes back to cart"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${reorderingId === o.order_id ? 'animate-spin' : ''}`} />
                        <span>Reorder</span>
                      </button>

                      {/* Track / View Receipt */}
                      <button
                        type="button"
                        onClick={() => onTrackOrder(o.order_id)}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-extrabold text-xs transition shadow-sm ${
                          active
                            ? 'bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-700 hover:to-amber-700 text-white shadow-brand-500/25'
                            : 'bg-brand-50 hover:bg-brand-100 text-brand-700'
                        }`}
                      >
                        <span>{active ? 'Track Live Kitchen' : 'View Receipt'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
