import React, { useState } from 'react';
import {
  Bell, Check, X, Clock, ChefHat, Bike, Store, Printer,
  AlertCircle, Phone, MapPin, ChevronRight, CheckCircle2, User
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { stopOrderAlarm } from '../utils/audio';

interface LiveOrdersPageProps {
  orders: Order[];
  onRefresh: () => void;
  onViewReceipt: (order: Order) => void;
}

export const LiveOrdersPage: React.FC<LiveOrdersPageProps> = ({
  orders,
  onRefresh,
  onViewReceipt
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'PLACED' | 'PREPARING' | 'READY' | 'COMPLETED'>('ALL');

  // Accept Modal State
  const [acceptingOrder, setAcceptingOrder] = useState<Order | null>(null);
  const [selectedPrepTime, setSelectedPrepTime] = useState<number>(20);

  // Reject Modal State
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Kitchen at maximum capacity');

  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Filter orders based on active kitchen status
  const activeOrders = orders.filter((o) => {
    if (filterTab === 'PLACED') return o.order_status === 'PLACED';
    if (filterTab === 'PREPARING') return o.order_status === 'ACCEPTED' || o.order_status === 'PREPARING';
    if (filterTab === 'READY') return o.order_status === 'READY' || o.order_status === 'OUT_FOR_DELIVERY';
    if (filterTab === 'COMPLETED') return o.order_status === 'DELIVERED' || o.order_status === 'CANCELLED';
    // 'ALL' shows non-delivered or today's
    return o.order_status !== 'DELIVERED' && o.order_status !== 'CANCELLED' && o.order_status !== 'REJECTED';
  });

  const handleAcceptSubmit = async () => {
    if (!acceptingOrder) return;
    stopOrderAlarm();
    setIsUpdating(true);
    try {
      await api.updateOrderStatus(acceptingOrder.order_id, {
        status: 'ACCEPTED',
        prep_time_minutes: selectedPrepTime,
        note: `Order accepted by kitchen. Estimated preparation: ${selectedPrepTime} minutes.`
      });
      setAcceptingOrder(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to accept order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingOrder) return;
    stopOrderAlarm();
    setIsUpdating(true);
    try {
      await api.updateOrderStatus(rejectingOrder.order_id, {
        status: 'REJECTED',
        rejection_reason: rejectionReason,
        note: `Declined by restaurant: ${rejectionReason}`
      });
      setRejectingOrder(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to decline order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdvanceStatus = async (order: Order, nextStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await api.updateOrderStatus(order.order_id, {
        status: nextStatus,
        note: `Order advanced to ${nextStatus}`
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          onClick={() => setFilterTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
            filterTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          All Active Orders ({orders.filter(o => o.order_status !== 'DELIVERED' && o.order_status !== 'CANCELLED' && o.order_status !== 'REJECTED').length})
        </button>
        <button
          onClick={() => setFilterTab('PLACED')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
            filterTab === 'PLACED'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-red-700 bg-red-50 hover:bg-red-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          New Incoming ({orders.filter(o => o.order_status === 'PLACED').length})
        </button>
        <button
          onClick={() => setFilterTab('PREPARING')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
            filterTab === 'PREPARING'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Cooking in Kitchen ({orders.filter(o => o.order_status === 'ACCEPTED' || o.order_status === 'PREPARING').length})
        </button>
        <button
          onClick={() => setFilterTab('READY')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
            filterTab === 'READY'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Ready / Dispatched ({orders.filter(o => o.order_status === 'READY' || o.order_status === 'OUT_FOR_DELIVERY').length})
        </button>
        <button
          onClick={() => setFilterTab('COMPLETED')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
            filterTab === 'COMPLETED'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Completed / Cancelled
        </button>
      </div>

      {/* Orders Grid */}
      {activeOrders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">No Active Orders In This Tab</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When customer places an order, it will instantly arrive here with an audible chime and real-time alerts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOrders.map((o) => {
            const isNew = o.order_status === 'PLACED';

            return (
              <div
                key={o.order_id}
                className={`bg-white rounded-3xl border shadow-sm flex flex-col justify-between overflow-hidden transition ${
                  isNew ? 'border-red-400 ring-4 ring-red-100 order-alert-ring' : 'border-slate-200/80 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className={`p-4 flex items-center justify-between border-b ${
                    isNew ? 'bg-red-50/80 border-red-200 text-red-900' : 'bg-slate-50 border-slate-100 text-slate-900'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base">{o.order_id}</span>
                        {isNew && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        o.fulfillment_type === 'DELIVERY' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.fulfillment_type}
                      </span>
                      <button
                        onClick={() => onViewReceipt(o)}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                        title="Print Ticket"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="p-4 border-b border-slate-100 bg-white space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {o.customer_name}
                      </span>
                      <a href={`tel:${o.customer_phone}`} className="font-bold text-brand-600 flex items-center gap-1 hover:underline">
                        <Phone className="w-3 h-3" />
                        {o.customer_phone}
                      </a>
                    </div>
                    {o.fulfillment_type === 'DELIVERY' && o.delivery_address && (
                      <p className="text-slate-500 flex items-start gap-1 text-[11px] pt-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span>{o.delivery_address.address_line}, {o.delivery_address.city}</span>
                      </p>
                    )}
                    {o.order_instructions && (
                      <div className="p-2 bg-amber-50 rounded-xl text-amber-900 text-[11px] font-medium mt-1">
                        <strong>Note:</strong> {o.order_instructions}
                      </div>
                    )}
                  </div>

                  {/* Items Ordered List */}
                  <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                    {o.items.map((it) => (
                      <div key={it.item_id} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 border border-veg rounded-sm flex items-center justify-center shrink-0">
                            <span className="w-1 h-1 rounded-full bg-veg"></span>
                          </span>
                          <span className="font-bold text-slate-800">{it.name}</span>
                          <span className="font-extrabold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                            x{it.quantity}
                          </span>
                        </div>
                        <span className="font-extrabold text-slate-900">₹{it.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Status Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Payment: {o.payment_method}</span>
                    <span className="font-black text-base text-slate-900">Total: ₹{o.total_amount}</span>
                  </div>

                  {/* Status Progression Controls */}
                  {isNew ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          stopOrderAlarm();
                          setAcceptingOrder(o);
                        }}
                        className="py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Accept Order
                      </button>
                      <button
                        onClick={() => {
                          stopOrderAlarm();
                          setRejectingOrder(o);
                        }}
                        className="py-2.5 bg-white hover:bg-red-50 text-red-600 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-red-200 transition flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  ) : o.order_status === 'ACCEPTED' ? (
                    <button
                      onClick={() => handleAdvanceStatus(o, 'PREPARING' as OrderStatus)}
                      disabled={isUpdating}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <ChefHat className="w-4 h-4" />
                      Start Food Preparation
                    </button>
                  ) : o.order_status === 'PREPARING' ? (
                    <button
                      onClick={() => handleAdvanceStatus(o, 'READY' as OrderStatus)}
                      disabled={isUpdating}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Food Ready for Pickup / Delivery
                    </button>
                  ) : o.order_status === 'READY' ? (
                    o.fulfillment_type === 'DELIVERY' ? (
                      <button
                        onClick={() => handleAdvanceStatus(o, 'OUT_FOR_DELIVERY' as OrderStatus)}
                        disabled={isUpdating}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
                      >
                        <Bike className="w-4 h-4" />
                        Dispatch for Delivery
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAdvanceStatus(o, 'DELIVERED' as OrderStatus)}
                        disabled={isUpdating}
                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Customer Handover Complete
                      </button>
                    )
                  ) : o.order_status === 'OUT_FOR_DELIVERY' ? (
                    <button
                      onClick={() => handleAdvanceStatus(o, 'DELIVERED' as OrderStatus)}
                      disabled={isUpdating}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Mark as Delivered / Completed
                    </button>
                  ) : (
                    <div className="text-center py-1 text-xs font-bold text-slate-500">
                      Order {o.order_status}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accept Order Prep Time Modal */}
      {acceptingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">Accept Order #{acceptingOrder.order_id}</h3>
            <p className="text-xs text-slate-500">
              Select estimated kitchen preparation time to notify customer:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {[15, 20, 30, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSelectedPrepTime(mins)}
                  className={`p-3 rounded-xl border text-center font-extrabold text-sm transition ${
                    selectedPrepTime === mins
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAcceptingOrder(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAcceptSubmit}
                disabled={isUpdating}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Confirm Acceptance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-red-600">Decline Order #{rejectingOrder.order_id}</h3>
            <p className="text-xs text-slate-500">
              Please choose or enter a reason for declining this order:
            </p>

            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-500"
            >
              <option value="Kitchen at maximum capacity">Kitchen at maximum capacity</option>
              <option value="Selected dish ingredients out of stock">Selected dish ingredients out of stock</option>
              <option value="Restaurant closing for break">Restaurant closing for break</option>
              <option value="Delivery address out of service area">Delivery address out of service area</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={isUpdating}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
