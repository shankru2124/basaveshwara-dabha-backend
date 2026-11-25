import React, { useEffect, useState } from 'react';
import {
  CheckCircle2, Clock, MapPin, Phone, AlertTriangle, XCircle,
  ChefHat, Bike, Store, ArrowLeft, RefreshCw, Sparkles, Check, QrCode,
  BellRing, Droplets, Receipt, MessageSquare, Send
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { customerWs } from '../services/websocket';
import { playOrderChime } from '../utils/audio';

interface OrderTrackingPageProps {
  orderId: string;
  onBack: () => void;
}

const STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Placed', desc: 'Received by Basaveshwara Dabha' },
  { key: 'ACCEPTED', label: 'Restaurant Accepted', desc: 'Order confirmed by kitchen manager' },
  { key: 'PREPARING', label: 'Preparing Food', desc: 'Chef cooking fresh with pure desi ghee' },
  { key: 'READY', label: 'Ready for Handover', desc: 'Packed hot in insulated packaging' },
  { key: 'SERVED', label: 'Served • Awaiting Bill', desc: 'Enjoy your meal! Bill will complete after payment' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Restaurant staff en route to your location' },
  { key: 'DELIVERED', label: 'Bill Paid • Completed', desc: 'Thank you for dining with Basaveshwara Dabha!' }
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId, onBack }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [isSendingHelp, setIsSendingHelp] = useState(false);
  const [helpFeedback, setHelpFeedback] = useState('');

  const handleTableHelpRequest = async (
    requestType: 'CALL_WAITER' | 'CLEAN_TABLE' | 'REQUEST_BILL' | 'WATER' | 'CUSTOM_SUGGESTION',
    note: string
  ) => {
    if (!order) return;
    const tNum = order.table_number || 'COUNTER';
    setIsSendingHelp(true);
    setHelpFeedback('');
    try {
      const res = await api.sendTableServiceRequest(tNum, {
        request_type: requestType,
        customer_name: order.customer_name,
        order_id: order.order_id,
        note
      });
      setHelpFeedback(res.message || 'Sent to staff!');
      if (requestType === 'CUSTOM_SUGGESTION') setSuggestionText('');
      setTimeout(() => setHelpFeedback(''), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to send request to staff.');
    } finally {
      setIsSendingHelp(false);
    }
  };

  const fetchOrder = async () => {
    try {
      const data = await api.trackOrder(orderId);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Could not load order details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Real-time synchronization
  useEffect(() => {
    const unsub = customerWs.subscribe((data) => {
      if (
        (data.event === 'order_status_updated' || data.event === 'payment_confirmed') &&
        (data.order_id === orderId || data.order?.order_id === orderId)
      ) {
        if (data.order) {
          setOrder(data.order);
        } else {
          fetchOrder();
        }
        playOrderChime();
      }
    });
    return () => unsub();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setIsCancelling(true);
    try {
      await api.cancelOrder(orderId);
      await fetchOrder();
    } catch (err: any) {
      alert(err.message || 'Could not cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Connecting to kitchen telemetry...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
        <p className="text-xs text-gray-500">{error || 'Please verify your Order ID.'}</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Determine current step index
  const isCancelled = order.order_status === 'CANCELLED';
  const isRejected = order.order_status === 'REJECTED';
  const isPickupOrDineIn = order.fulfillment_type === 'PICKUP' || order.fulfillment_type === 'DINE_IN';

  const filteredSteps = isPickupOrDineIn
    ? STATUS_STEPS.filter((s) => s.key !== 'OUT_FOR_DELIVERY').map((s) =>
        order.fulfillment_type === 'DINE_IN' && s.key === 'READY'
          ? { ...s, label: 'Ready to Serve', desc: `Plated fresh for ${order.table_number || 'your table'}` }
          : order.fulfillment_type === 'DINE_IN' && s.key === 'SERVED'
          ? { ...s, label: 'Served at Table', desc: `Served to ${order.table_number || 'your table'} • Pay bill when finished` }
          : s
      )
    : STATUS_STEPS.filter((s) => s.key !== 'SERVED');

  const currentStepIndex = filteredSteps.findIndex((s) => s.key === order.order_status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </button>
        <button
          onClick={fetchOrder}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 bg-brand-50 px-3 py-1.5 rounded-xl transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Live Sync
        </button>
      </div>

      {/* Hero Tracking Banner */}
      <div className="bg-gradient-to-br from-brand-600 via-orange-600 to-amber-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              {order.fulfillment_type === 'DINE_IN'
                ? `🍽️ Dine-In • ${order.table_number || 'Table Order'}`
                : 'Live Real-Time Tracker'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Order #{order.order_id}
            </h1>
            <p className="text-xs text-orange-100 mt-1 font-medium">
              Placed at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center sm:text-right">
            <span className="text-[11px] uppercase tracking-wider text-orange-200 font-bold block">
              Estimated Preparation
            </span>
            <span className="text-2xl font-black text-white">
              ~{order.estimated_prep_time_minutes || 25} mins
            </span>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="font-extrabold text-base text-gray-900 flex items-center justify-between">
          <span>Kitchen & Delivery Progress</span>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            {order.order_status.replace(/_/g, ' ')}
          </span>
        </h3>

        {/* Rejection / Cancellation alerts */}
        {isCancelled && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-1">
            <h4 className="font-bold flex items-center gap-1.5 text-sm">
              <XCircle className="w-4 h-4 text-red-600" />
              Order Has Been Cancelled
            </h4>
            <p>
              This order was cancelled. {order.payment_status === 'REFUNDED' ? 'Online payment refund initiated to your account.' : ''}
            </p>
          </div>
        )}

        {isRejected && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-1">
            <h4 className="font-bold flex items-center gap-1.5 text-sm">
              <XCircle className="w-4 h-4 text-red-600" />
              Order Declined by Kitchen
            </h4>
            <p>
              Reason: {order.rejection_reason || 'Kitchen closed or items ran out.'}
              {order.payment_status === 'REFUNDED' ? ' Online refund has been initiated.' : ''}
            </p>
          </div>
        )}

        {/* Stepper */}
        {!isCancelled && !isRejected && (
          <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
            {filteredSteps.map((step, idx) => {
              const isPast = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step.key} className="relative flex items-start gap-4">
                  {/* Step Dot / Icon */}
                  <div
                    className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      isPast
                        ? 'bg-veg text-white shadow-sm ring-4 ring-green-100'
                        : isCurrent
                        ? 'bg-brand-600 text-white shadow-md ring-4 ring-brand-100 animate-pulse'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>

                  <div>
                    <h4
                      className={`text-sm font-extrabold ${
                        isCurrent
                          ? 'text-brand-600 text-base'
                          : isPast
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {step.key === 'PLACED' && order.payment_status === 'COMPLETED'
                        ? `Payment Confirmed (₹${order.total_amount}) • Sent to restaurant kitchen for acceptance`
                        : step.key === 'PLACED' && order.payment_status === 'PENDING' && order.payment_method !== 'COD'
                        ? 'Payment Pending • Please complete UPI payment to send order to kitchen'
                        : step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancellation button if still in PLACED */}
        {order.order_status === 'PLACED' && !isCancelled && !isRejected && (
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="px-4 py-2 border border-red-300 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl transition"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>

      {/* Order Itemized Summary */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-gray-900">Items Ordered</h3>

        <div className="divide-y divide-gray-100">
          {order.items.map((it) => (
            <div key={it.item_id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 border border-veg rounded-sm flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-veg"></span>
                </span>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">{it.name}</h5>
                  <p className="text-gray-500 font-medium">₹{it.price} x {it.quantity}</p>
                </div>
              </div>
              <span className="font-extrabold text-sm text-gray-900">₹{it.total}</span>
            </div>
          ))}
        </div>

        {/* Bill summary */}
        <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-900">₹{order.subtotal}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Coupon Discount ({order.coupon_code})</span>
              <span>-₹{order.discount_amount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Taxes & GST (5%)</span>
            <span className="font-semibold text-gray-900">₹{order.tax_amount}</span>
          </div>
          {order.fulfillment_type === 'DELIVERY' && (
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-900">
                {order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Packaging Charges</span>
            <span className="font-semibold text-gray-900">₹{order.packaging_fee}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-sm text-gray-900">
            <span>Total Payable</span>
            <span className="text-base text-brand-600">₹{order.total_amount}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">Payment:</span>
                <span className="font-semibold text-gray-600">{order.payment_method}</span>
                {order.payment_status === 'COMPLETED' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    PAID / CONFIRMED
                  </span>
                ) : order.payment_status === 'REFUNDED' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-800">
                    REFUNDED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800">
                    PENDING
                  </span>
                )}
              </div>
              {order.upi_utr_number && (
                <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                  UTR / Ref: <strong className="text-gray-800">{order.upi_utr_number}</strong> {order.upi_app && `(${order.upi_app})`}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Delivery Destination */}
        {order.fulfillment_type === 'DELIVERY' && order.delivery_address && (
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1 text-xs">
            <span className="font-bold text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              Delivery Address:
            </span>
            <p className="text-gray-600">{order.delivery_address.address_line}</p>
            {order.delivery_address.landmark && (
              <p className="text-gray-500">Landmark: {order.delivery_address.landmark}</p>
            )}
            <p className="text-gray-500">{order.delivery_address.city} - {order.delivery_address.pincode}</p>
          </div>
        )}
      </div>

      {/* Customer Help & Suggestion Box (Links directly to Accepted Order on Kitchen Screen) */}
      {!isCancelled && !isRejected && (
        <div className="bg-white rounded-3xl border border-amber-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-600" />
                Need Help or Table Request?
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Send table cleaning, waiter call, water, or any custom suggestion — pops up right on our staff order screen{order.table_number ? ` with Table ${order.table_number}` : ''}.
              </p>
            </div>
            {order.table_number && (
              <span className="px-3 py-1 rounded-full bg-slate-900 text-amber-300 font-black text-xs">
                TABLE {order.table_number}
              </span>
            )}
          </div>

          {helpFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{helpFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
            <button
              type="button"
              disabled={isSendingHelp}
              onClick={() => handleTableHelpRequest('CLEAN_TABLE', 'Please clean our table')}
              className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              Clean Table
            </button>
            <button
              type="button"
              disabled={isSendingHelp}
              onClick={() => handleTableHelpRequest('CALL_WAITER', 'Guest requested waiter at table')}
              className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 flex items-center justify-center gap-1.5 transition"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-600" />
              Call Waiter
            </button>
            <button
              type="button"
              disabled={isSendingHelp}
              onClick={() => handleTableHelpRequest('WATER', 'Please bring drinking water')}
              className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 flex items-center justify-center gap-1.5 transition"
            >
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              Water
            </button>
            <button
              type="button"
              disabled={isSendingHelp}
              onClick={() => handleTableHelpRequest('REQUEST_BILL', 'Guest requested final bill')}
              className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 flex items-center justify-center gap-1.5 transition"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              Request Bill
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!suggestionText.trim()) return;
              handleTableHelpRequest('CUSTOM_SUGGESTION', suggestionText.trim());
            }}
            className="space-y-2.5 pt-1"
          >
            <textarea
              rows={2}
              placeholder="Write your suggestion or help request (e.g., Please clean table, need extra plates, reduce spice...)"
              value={suggestionText}
              onChange={(e) => setSuggestionText(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:border-brand-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!suggestionText.trim() || isSendingHelp}
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingHelp ? 'Sending...' : 'Send Suggestion / Help Request'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
