import React, { useState } from 'react';
import {
  QrCode, BellRing, Receipt, Droplets, Utensils, X, CheckCircle2, ChevronDown
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const SmartTableBanner: React.FC = () => {
  const { activeTable, publicTables, selectTable, clearTable } = useCart();
  const { user } = useAuth();

  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [sendingType, setSendingType] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string>('');

  const triggerService = async (
    requestType: 'CALL_WAITER' | 'REQUEST_BILL' | 'WATER' | 'CUTLERY',
    note?: string
  ) => {
    if (!activeTable) return;
    setSendingType(requestType);
    try {
      const res = await api.sendTableServiceRequest(activeTable.table_number, {
        request_type: requestType,
        customer_name: user?.name || `Table ${activeTable.table_number} Guest`,
        note
      });
      setToastMsg(res.message || 'Staff notified!');
      setIsServiceModalOpen(false);
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Could not reach restaurant staff right now.');
    } finally {
      setSendingType(null);
    }
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
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Call Waiter</span>
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
            <button
              type="button"
              onClick={() => setIsTablePickerOpen(true)}
              className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-[11px] rounded-lg shrink-0 transition"
            >
              Select Table QR
            </button>
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

      {/* Call Waiter / Quick Service Options Modal */}
      {isServiceModalOpen && activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-slate-900">Table {activeTable.table_number} Service</h3>
                <p className="text-xs text-slate-500">Tap an option to alert Basaveshwara Dabha staff</p>
              </div>
              <button onClick={() => setIsServiceModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              <button
                type="button"
                disabled={Boolean(sendingType)}
                onClick={() => triggerService('CALL_WAITER', 'Guest requested waiter assistance')}
                className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 flex flex-col items-center gap-2 transition"
              >
                <BellRing className="w-6 h-6 text-amber-600" />
                <span>Call Waiter</span>
              </button>

              <button
                type="button"
                disabled={Boolean(sendingType)}
                onClick={() => triggerService('WATER', 'Please bring drinking water')}
                className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 flex flex-col items-center gap-2 transition"
              >
                <Droplets className="w-6 h-6 text-blue-600" />
                <span>Drinking Water</span>
              </button>

              <button
                type="button"
                disabled={Boolean(sendingType)}
                onClick={() => triggerService('CUTLERY', 'Need extra spoons / plates / tissues')}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 flex flex-col items-center gap-2 transition"
              >
                <Utensils className="w-6 h-6 text-slate-700" />
                <span>Plates & Cutlery</span>
              </button>

              <button
                type="button"
                disabled={Boolean(sendingType)}
                onClick={() => triggerService('REQUEST_BILL', 'Ready to settle bill')}
                className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 flex flex-col items-center gap-2 transition"
              >
                <Receipt className="w-6 h-6 text-emerald-600" />
                <span>Request Bill</span>
              </button>
            </div>
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
