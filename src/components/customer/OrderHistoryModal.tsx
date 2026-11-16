import React from 'react';
import { useOrders } from '../../context/OrderContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatPrice, formatDateTime } from '../../utils/formatters';
import { X, Clock, ShoppingBag, ArrowRight } from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (orderId: string) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const { orders } = useOrders();
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFAF5] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-amber-900/20 my-8">
        {/* Header */}
        <div className="bg-[#2A1810] text-[#FDFAF5] px-6 py-4 flex items-center justify-between border-b border-[#4E2E1B]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="font-extrabold text-base text-amber-300">{t.orderHistory}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#E9DFCE] hover:text-white hover:bg-[#3D2314] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-500">No order history found yet.</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                      {ord.order_number}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {formatDateTime(ord.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 font-semibold mt-1">
                    {ord.items.map((it) => `${it.product_name_en} x${it.quantity}`).join(', ')}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-stone-900">
                      {formatPrice(ord.total_amount)}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      {t.statuses[ord.status] || ord.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectOrder(ord.id);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs"
                >
                  <span>{t.trackOrder}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
