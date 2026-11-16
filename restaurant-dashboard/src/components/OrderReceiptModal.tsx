import React from 'react';
import { X, Printer } from 'lucide-react';
import { Order } from '../types';

interface OrderReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center no-print">
          <h3 className="font-extrabold text-base text-slate-900">Order Receipt</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Ticket Container */}
        <div className="border border-dashed border-slate-300 rounded-2xl p-5 bg-slate-50 font-mono text-xs space-y-3">
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <h2 className="font-extrabold text-sm text-slate-900 uppercase">Basaveshwara Dabha</h2>
            <p className="text-[10px] text-slate-500">Pure Vegetarian Kitchen & Tandoor</p>
            <p className="text-[10px] text-slate-500">Bengaluru, Karnataka • Tel: 9876543210</p>
          </div>

          <div className="border-b border-dashed border-slate-300 pb-2 space-y-0.5 text-[11px]">
            <p><strong>Order ID:</strong> {order.order_id}</p>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Customer:</strong> {order.customer_name} ({order.customer_phone})</p>
            <p><strong>Type:</strong> {order.fulfillment_type}</p>
            {order.delivery_address && (
              <p><strong>Address:</strong> {order.delivery_address.address_line}, {order.delivery_address.city}</p>
            )}
            {order.order_instructions && (
              <p className="text-brand-700"><strong>Note:</strong> {order.order_instructions}</p>
            )}
          </div>

          {/* Items */}
          <div className="border-b border-dashed border-slate-300 pb-2 space-y-1">
            <div className="flex justify-between font-bold text-[11px] pb-1">
              <span>Item Description</span>
              <span>Amt (₹)</span>
            </div>
            {order.items.map((it) => (
              <div key={it.item_id} className="flex justify-between text-[11px]">
                <span className="truncate max-w-[220px]">{it.name} x {it.quantity}</span>
                <span>{it.total}</span>
              </div>
            ))}
          </div>

          {/* Total Breakdown */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount:</span>
                <span>-₹{order.discount_amount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST (5%):</span>
              <span>₹{order.tax_amount}</span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>₹{order.delivery_fee}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Packaging:</span>
              <span>₹{order.packaging_fee}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm border-t border-dashed border-slate-400 pt-1 text-slate-900">
              <span>TOTAL:</span>
              <span>₹{order.total_amount}</span>
            </div>
          </div>

          <div className="text-center pt-2 text-[10px] text-slate-500">
            <p>Payment: {order.payment_method} ({order.payment_status})</p>
            <p>Thank you for dining with Basaveshwara Dabha!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
