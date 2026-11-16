import React from 'react';
import { useOrders } from '../../context/OrderContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateTime } from '../../utils/formatters';
import { ChefHat, Clock, AlertTriangle, CheckCircle, Flame, Sparkles } from 'lucide-react';

export const KitchenDisplaySystem: React.FC = () => {
  const { orders, updateOrderStatus } = useOrders();
  const { language, t } = useLanguage();

  // Kitchen shows orders that are 'accepted' or 'preparing' or 'ready'
  const kitchenOrders = orders.filter((o) => ['accepted', 'preparing', 'ready'].includes(o.status));

  // Sort: preparing & accepted first, then ready
  kitchenOrders.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-[#2A1810] text-[#FDFAF5] p-6 rounded-3xl shadow-warm-lg border border-[#4E2E1B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-400 font-bold text-xs uppercase tracking-wider">
              Dabha Kitchen KDS
            </span>
            <span className="text-xs text-[#E9DFCE]/70">Live Master Chef Display</span>
          </div>
          <h1 className="text-2xl font-black text-amber-300 mt-1">
            {t.kitchen.title}
          </h1>
          <p className="text-xs text-amber-200/80">
            {t.kitchen.sub}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#1C0F0A] px-4 py-2 rounded-2xl border border-[#4E2E1B]">
          <ChefHat className="w-6 h-6 text-amber-400" />
          <div>
            <span className="text-xs text-stone-400 block font-semibold">Active In Kitchen</span>
            <span className="text-lg font-black text-amber-400 font-mono">
              {kitchenOrders.length} {kitchenOrders.length === 1 ? 'Ticket' : 'Tickets'}
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Cards Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 shadow-warm space-y-3">
          <ChefHat className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-extrabold text-stone-800 text-lg">All caught up!</h3>
          <p className="text-xs text-stone-500">
            No pending cooking tickets right now. When customers place orders, they will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kitchenOrders.map((order) => {
            const minutesElapsed = Math.floor(
              (Date.now() - new Date(order.created_at).getTime()) / 60000
            );
            const isDelayed = minutesElapsed >= 20 && order.status !== 'ready';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border-2 overflow-hidden shadow-warm transition-all flex flex-col justify-between ${
                  isDelayed
                    ? 'border-red-500 ring-2 ring-red-400/30'
                    : order.status === 'preparing'
                    ? 'border-amber-500'
                    : order.status === 'ready'
                    ? 'border-emerald-500 opacity-90'
                    : 'border-stone-300'
                }`}
              >
                {/* Ticket Header */}
                <div>
                  <div
                    className={`p-4 flex items-center justify-between text-white font-bold ${
                      isDelayed
                        ? 'bg-red-700'
                        : order.status === 'preparing'
                        ? 'bg-amber-600'
                        : order.status === 'ready'
                        ? 'bg-emerald-700'
                        : 'bg-[#2A1810]'
                    }`}
                  >
                    <div>
                      <span className="text-lg font-black tracking-wider font-mono">
                        {order.order_number}
                      </span>
                      <span className="block text-[11px] opacity-90">
                        {order.order_type === 'delivery' ? 'Home Delivery' : 'Direct Pickup'}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-mono font-extrabold">{minutesElapsed} mins</span>
                      </div>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-black/30 mt-1 inline-block">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Delayed Warning */}
                  {isDelayed && (
                    <div className="bg-red-100 text-red-900 px-4 py-1.5 text-xs font-black flex items-center gap-1.5 border-b border-red-200 animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-red-700" />
                      <span>{t.kitchen.delayedWarning}</span>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="p-4 space-y-3">
                    <div className="divide-y divide-stone-100">
                      {order.items.map((it) => (
                        <div key={it.id} className="py-2 first:pt-0 flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-[#2A1810] text-amber-300 font-black text-xs flex items-center justify-center flex-shrink-0">
                            {it.quantity}
                          </span>
                          <div>
                            <p className="font-bold text-stone-900 text-sm leading-snug">
                              {language === 'kn' ? it.product_name_kn : it.product_name_en}
                            </p>
                            {it.variant_name_en && (
                              <p className="text-xs font-semibold text-amber-800">
                                {language === 'kn' ? it.variant_name_kn : it.variant_name_en}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chef Special Notes */}
                    {order.special_instructions && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300/80 text-xs text-amber-950 font-medium">
                        <span className="font-extrabold text-amber-900 block text-[10px] uppercase tracking-wider">
                          ⚠️ {t.kitchen.specialChefNotes}:
                        </span>
                        <span>{order.special_instructions}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-2">
                  {order.status === 'accepted' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing', 'Kitchen chef started cooking')}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Flame className="w-4 h-4" />
                      <span>{t.kitchen.startPreparing}</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready', 'Kitchen chef packed and marked dish ready')}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{t.kitchen.markReady}</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <div className="w-full py-2 px-3 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs text-center border border-emerald-300">
                      ✓ Ready for Packaging / Rider Pickup
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
