import React from 'react';
import { useOrders } from '../../context/OrderContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { BellRing, Volume2, VolumeX, CheckCircle, ShieldAlert } from 'lucide-react';

export const AudioAlarmBanner: React.FC = () => {
  const { role, setRole } = useAuth();
  const {
    hasUnacknowledgedOrders,
    isAlarmRinging,
    acknowledgeAllOrders,
    toggleAlarmSound,
    testAlarmSound,
    orders,
  } = useOrders();
  const { t } = useLanguage();

  const pendingUnacknowledged = orders.filter((o) => o.status === 'pending' && !o.acknowledged_by_admin);

  if (!hasUnacknowledgedOrders) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white px-4 py-3 shadow-xl border-b-2 border-red-800 animate-pulse sticky top-14 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center font-bold flex-shrink-0 animate-bounce">
            <BellRing className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm md:text-base tracking-wide uppercase">
                🚨 {t.admin.alarmActive}
              </span>
              <span className="bg-white text-red-700 px-2 py-0.5 rounded-full text-xs font-black">
                {pendingUnacknowledged.length} {pendingUnacknowledged.length === 1 ? 'New Order' : 'New Orders'}
              </span>
            </div>
            <p className="text-xs text-red-100">
              Orders waiting:{' '}
              {pendingUnacknowledged.map((o) => `${o.order_number} (${o.customer_name})`).join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Switch to Admin if not already in Admin mode */}
          {role !== 'admin' && (
            <button
              onClick={() => setRole('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white text-xs font-bold border border-white/30 transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Open Admin View</span>
            </button>
          )}

          {/* Test Sound Button */}
          <button
            onClick={testAlarmSound}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium border border-white/20"
            title="Test Buzzer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Sound</span>
          </button>

          {/* Toggle Mute / Sound */}
          <button
            onClick={toggleAlarmSound}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs"
            title="Toggle Alarm Audio"
          >
            {isAlarmRinging ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Acknowledge & Silence */}
          <button
            onClick={acknowledgeAllOrders}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-red-700 hover:bg-amber-100 font-extrabold text-xs md:text-sm shadow-md transition-all transform hover:scale-105"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{t.admin.silenceAlarm}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
