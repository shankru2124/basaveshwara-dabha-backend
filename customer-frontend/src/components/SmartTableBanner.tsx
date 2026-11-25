import React, { useState } from 'react';
import {
  QrCode, BellRing, Receipt, Droplets, Utensils, X, CheckCircle2, ChevronDown,
  Sparkles, MessageSquare, Send, MapPin
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface SmartTableBannerProps {
  recentOrderId?: string;
  onTrackOrder?: (orderId: string) => void;
}

export const SmartTableBanner: React.FC<SmartTableBannerProps> = ({
  recentOrderId,
  onTrackOrder
}) => {
  const { activeTable, publicTables, selectTable, clearTable } = useCart();
  const { user } = useAuth();

  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [customSuggestion, setCustomSuggestion] = useState('');
  const [sendingType, setSendingType] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string>('');

  const triggerService = async (
    requestType: 'CALL_WAITER' | 'CLEAN_TABLE' | 'REQUEST_BILL' | 'WATER' | 'CUTLERY' | 'CUSTOM_SUGGESTION',
    note?: string
  ) => {
    if (!activeTable) return;
    setSendingType(requestType);
    try {
      const res = await api.sendTableServiceRequest(activeTable.table_number, {
        request_type: requestType,
        customer_name: user?.name || `Table ${activeTable.table_number} Guest`,
        order_id: recentOrderId || undefined,
        note
      });
      setToastMsg(res.message || 'Staff notified!');
      if (requestType === 'CUSTOM_SUGGESTION') {
        setCustomSuggestion('');
      }
      setIsServiceModalOpen(false);
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Could not reach restaurant staff right now.');
    } finally {
      setSendingType(null);
    }
  };

  const handleSendSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSuggestion.trim()) return;
    await triggerService('CUSTOM_SUGGESTION', customSuggestion.trim());
  };

  return (
    <>
      {activeTable ? (
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-900 text-white border-b border-emerald-700/60 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
            {/* Active Table Indicator */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-sm shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black tracking-tight text-white">
                    Dine-In • Table {activeTable.table_number}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                    {activeTable.section}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 hidden sm:block">
                  Basaveshwara Dabha Smart QR Menu • Zero delivery & packaging charges
                </p>
              </div>
            </div>

            {/* Instant Table Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {recentOrderId && onTrackOrder && (
                <button
                  type="button"
                  onClick={() => onTrackOrder(recentOrderId)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Track Order</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsServiceModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Help / Waiter / Suggestion</span>
              </button>

              <button
                type="button"
                disabled={sendingType === 'REQUEST_BILL'}
                onClick={() => triggerService('REQUEST_BILL', 'Guest requested final table bill')}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition active:scale-95"
              >
                <Receipt className="w-3.5 h-3.5 text-amber-300" />
                <span>{sendingType === 'REQUEST_BILL' ? 'Sending...' : 'Request Bill'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTablePickerOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-[11px] flex items-center gap-1 transition"
              >
                <span>Switch</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={clearTable}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
                title="Switch to Delivery / Pickup Mode"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/90 border-b border-amber-200/80 text-amber-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold flex items-center gap-1.5 truncate">
              <QrCode className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="truncate">Seated inside <strong>Basaveshwara Dabha</strong>? Switch to Smart QR Table Dine-In!</span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {recentOrderId && onTrackOrder && (
                <button
                  type="button"
                  onClick={() => onTrackOrder(recentOrderId)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition"
                >
                  Track Order
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsTablePickerOpen(true)}
                className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-[11px] rounded-lg transition"
              >
                Select Table QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Toast */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Call Waiter / Table Cleaning / Suggestion Box Modal */}
      {isServiceModalOpen && activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Table {activeTable.table_number} • Staff Help & Suggestions
                </h3>
                <p className="text-xs text-slate-500">
                  Tap a quick option or type your request — appears immediately on our staff screen!
                </p>
              </div>
              <button onClick={() => setIsServiceModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
              <button
                type="button"
                disabled={Boolean(sendingType)}
                onClick={() => triggerService('CLEAN_TABLE', 'Please clean our table')}
                className="p-3.5 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-950 flex flex-col items-center gap-1.5 transition"
              >
                <Sparkles className="w-5 h-5 text-red-600" />
                <span>Clean Table</span>
              </button>

              <button
                type="button"
                disabled={Boolean(sendingType)}
                onClick={() => triggerService('CALL_WAITER', 'Guest requested waiter assistance')}
                className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 flex flex-col items-center gap-1.5 transition"
              >
                <BellRing className="w-5 h-5 text-amber-600" />
                <span>Call Waiter</span>
              </button>

              <button
                type="button"
                disabled={Boolean(sendingType)}
                onClick={() => triggerService('WATER', 'Please bring drinking water')}
                className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 flex flex-col items-center gap-1.5 transition"
              >
                <Droplets className="w-5 h-5 text-blue-600" />
                <span>Drinking Water</span>
              </button>

              <button
                type="button"
                disabled={Boolean(sendingType)}
                onClick={() => triggerService('CUTLERY', 'Need extra spoons / plates / tissues')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 flex flex-col items-center gap-1.5 transition"
              >
                <Utensils className="w-5 h-5 text-slate-700" />
                <span>Plates & Cutlery</span>
              </button>
            </div>

            {/* Customer Suggestion / Custom Help Box */}
            <form onSubmit={handleSendSuggestion} className="pt-2 border-t border-slate-100 space-y-2.5">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                Customer Suggestion / Custom Help Box
              </label>
              <textarea
                rows={3}
                placeholder="Write any request or suggestion (e.g., Please clean table before dessert, bring extra sambar, pack parcel...)"
                value={customSuggestion}
                onChange={(e) => setCustomSuggestion(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!customSuggestion.trim() || Boolean(sendingType)}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingType === 'CUSTOM_SUGGESTION' ? 'Sending...' : `Send Request for Table ${activeTable.table_number}`}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table Picker Modal */}
      {isTablePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-slate-900">Select Dining Table • Basaveshwara Dabha</h3>
                <p className="text-xs text-slate-500">Choose your table number or switch back to Delivery / Takeaway</p>
              </div>
              <button onClick={() => setIsTablePickerOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto py-1">
              {publicTables.map((t) => {
                const isSelected = activeTable?.table_number === t.table_number;
                return (
                  <button
                    key={t.table_number}
                    type="button"
                    onClick={() => {
                      selectTable(t.table_number);
                      setIsTablePickerOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
                        : 'bg-slate-50 hover:bg-brand-50/50 border-slate-200 hover:border-brand-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900">{t.table_number}</span>
                      <span className="text-[10px] font-bold text-slate-500">{t.capacity} Seats</span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700 truncate mt-1">{t.table_name}</p>
                    <p className="text-[10px] text-slate-400">{t.section}</p>
                  </button>
                );
              })}
            </div>

            {activeTable && (
              <button
                type="button"
                onClick={() => {
                  clearTable();
                  setIsTablePickerOpen(false);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
              >
                Exit Dine-In (Switch to Delivery / Self Pickup)
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
