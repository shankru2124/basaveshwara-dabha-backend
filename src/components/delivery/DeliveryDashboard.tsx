import React, { useState, useEffect } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useLanguage } from '../../context/LanguageContext';
import { defaultSettings } from '../../data/menuData';
import { formatPrice } from '../../utils/formatters';
import {
  Bike,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  PackageCheck,
  ShieldAlert,
  Compass,
} from 'lucide-react';

export const DeliveryDashboard: React.FC = () => {
  const { orders, updateOrderStatus, deliveryPartners } = useOrders();
  const { language, t } = useLanguage();

  const [currentRider] = useState(deliveryPartners[0]); // Simulated logged-in rider Manjunath Gowda
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState('');

  // Assigned orders for this delivery driver or all delivery orders ready for pickup
  const assignedOrders = orders.filter(
    (o) =>
      o.order_type === 'delivery' &&
      (['ready', 'picked_up', 'out_for_delivery'].includes(o.status) ||
        (o.assigned_driver && o.assigned_driver.id === currentRider.id))
  );

  // Request actual Geolocation permissions (never fabricate fake GPS)
  const toggleGps = () => {
    if (!gpsEnabled) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setGpsCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setGpsEnabled(true);
            setGpsError('');
          },
          (err) => {
            setGpsError(`GPS Permission denied: ${err.message}. Accurate tracking requires device location.`);
            setGpsEnabled(false);
          },
          { enableHighAccuracy: true }
        );
      } else {
        setGpsError('Geolocation is not supported by your browser.');
      }
    } else {
      setGpsEnabled(false);
      setGpsCoords(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-[#2A1810] text-[#FDFAF5] p-6 rounded-3xl shadow-warm-lg border border-[#4E2E1B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Delivery Partner Interface
            </span>
            <h1 className="text-xl font-extrabold text-[#FDFAF5]">
              {currentRider.name}
            </h1>
            <p className="text-xs text-[#E9DFCE]/70 font-mono">
              Vehicle: {currentRider.vehicle_number} ({currentRider.vehicle_type})
            </p>
          </div>
        </div>

        {/* Live GPS Toggle */}
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={toggleGps}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              gpsEnabled
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-stone-200 hover:bg-stone-300 text-stone-900'
            }`}
          >
            <Compass className={`w-4 h-4 ${gpsEnabled ? 'animate-spin' : ''}`} />
            <span>{gpsEnabled ? 'Live GPS Active' : 'Enable Real GPS'}</span>
          </button>
          {gpsCoords && (
            <span className="text-[10px] text-amber-300 font-mono">
              {gpsCoords.lat.toFixed(4)}° N, {gpsCoords.lng.toFixed(4)}° E
            </span>
          )}
        </div>
      </div>

      {gpsError && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-700 flex-shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-stone-900">
          {t.delivery.title} ({assignedOrders.length})
        </h2>

        {assignedOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-warm space-y-2">
            <Bike className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-bold text-stone-800 text-base">{t.delivery.noAssignedOrders}</h3>
            <p className="text-xs text-stone-500">
              Orders assigned by the Dabha dispatcher will show up here immediately.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedOrders.map((order) => {
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 border border-stone-200 shadow-warm space-y-4"
                >
                  {/* Top Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                        {order.order_number}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-bold uppercase">
                        {order.status}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-stone-500 block">Collect Amount:</span>
                      <span className="font-black font-mono text-base text-stone-900">
                        {order.payment_method === 'cod' ? (
                          <span className="text-amber-800">CASH: {formatPrice(order.total_amount)}</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">PAID ONLINE</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Pickup Address */}
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                      <span className="font-bold uppercase tracking-wider text-stone-400 text-[10px] block mb-1">
                        1. Pickup From
                      </span>
                      <p className="font-extrabold text-stone-900">
                        {defaultSettings.name_en} ({defaultSettings.name_kn})
                      </p>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        {defaultSettings.address_display_en}
                      </p>
                    </div>

                    {/* Dropoff Address */}
                    <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80">
                      <span className="font-bold uppercase tracking-wider text-amber-700 text-[10px] block mb-1">
                        2. Deliver To
                      </span>
                      <p className="font-extrabold text-stone-900">{order.customer_name}</p>
                      <p className="text-stone-600 text-[11px] mt-0.5">
                        {order.delivery_address?.address_line1}, Landmark: {order.delivery_address?.landmark || 'N/A'}, PIN: {order.delivery_address?.pincode}
                      </p>

                      <div className="flex items-center gap-3 mt-3">
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-300 font-bold text-stone-800 hover:bg-stone-50"
                        >
                          <Phone className="w-3.5 h-3.5 text-stone-600" />
                          <span>{order.customer_phone}</span>
                        </a>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${order.delivery_address?.address_line1 || ''} Hubballi Karnataka`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Directions</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-stone-600">
                    <span className="font-bold">Items: </span>
                    {order.items.map((it) => `${it.product_name_en} x${it.quantity}`).join(', ')}
                  </div>

                  {/* Driver Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'picked_up', 'Driver picked up parcel')}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>{t.delivery.markPickedUp}</span>
                      </button>
                    )}

                    {['picked_up', 'out_for_delivery'].includes(order.status) && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered', 'Driver delivered parcel to customer')}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t.delivery.markDelivered}</span>
                      </button>
                    )}

                    {order.status === 'delivered' && (
                      <div className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs">
                        ✓ Delivery Fulfilled Successfully
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
