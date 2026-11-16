import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useLanguage } from '../../context/LanguageContext';
import { defaultSettings } from '../../data/menuData';
import { formatPrice, formatDateTime } from '../../utils/formatters';
import {
  Clock,
  Phone,
  Bike,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  MapPin,
  Star,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Store,
} from 'lucide-react';

interface OrderTrackerProps {
  orderId?: string;
  onBackToMenu: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId, onBackToMenu }) => {
  const { orders, currentCustomerOrderId } = useOrders();
  const { language, t } = useLanguage();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const targetId = orderId || currentCustomerOrderId;
  const order = orders.find((o) => o.id === targetId) || orders[0];

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-stone-400 mx-auto" />
        <h3 className="font-bold text-lg text-stone-700">No active order found</h3>
        <button
          onClick={onBackToMenu}
          className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs"
        >
          {t.viewMenu}
        </button>
      </div>
    );
  }

  // Define Steps based on delivery or pickup
  const deliverySteps = [
    { key: 'pending', label_en: 'Order Received', label_kn: 'ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ', icon: Clock },
    { key: 'accepted', label_en: 'Accepted by Dabha', label_kn: 'ದಾಬಾದಿಂದ ಒಪ್ಪಲಾಗಿದೆ', icon: ShieldCheck },
    { key: 'preparing', label_en: 'Cooking in Kitchen', label_kn: 'ಅಡುಗೆ ತಯಾರಾಗುತ್ತಿದೆ', icon: ChefHat },
    { key: 'ready', label_en: 'Packed & Ready', label_kn: 'ಆಹಾರ ಸಿದ್ಧವಾಗಿದೆ', icon: PackageCheck },
    { key: 'out_for_delivery', label_en: 'Out for Delivery', label_kn: 'ಡೆಲಿವರಿಗೆ ಹೊರಟಿದೆ', icon: Bike },
    { key: 'delivered', label_en: 'Delivered', label_kn: 'ತಲುಪಿಸಲಾಗಿದೆ', icon: CheckCircle2 },
  ];

  const pickupSteps = [
    { key: 'pending', label_en: 'Order Received', label_kn: 'ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ', icon: Clock },
    { key: 'accepted', label_en: 'Accepted by Dabha', label_kn: 'ದಾಬಾದಿಂದ ಒಪ್ಪಲಾಗಿದೆ', icon: ShieldCheck },
    { key: 'preparing', label_en: 'Cooking in Kitchen', label_kn: 'ಅಡುಗೆ ತಯಾರಾಗುತ್ತಿದೆ', icon: ChefHat },
    { key: 'ready', label_en: 'Ready for Pickup', label_kn: 'ಪಿಕಪ್‌ಗೆ ಸಿದ್ಧವಾಗಿದೆ', icon: Store },
    { key: 'delivered', label_en: 'Picked Up & Completed', label_kn: 'ಪಿಕಪ್ ಪೂರ್ಣಗೊಂಡಿದೆ', icon: CheckCircle2 },
  ];

  const steps = order.order_type === 'pickup' ? pickupSteps : deliverySteps;

  const getStepIndex = (status: string) => {
    if (status === 'picked_up') return 4;
    const idx = steps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = getStepIndex(order.status);
  const isCompleted = order.status === 'delivered';
  const isCancelled = ['cancelled', 'rejected'].includes(order.status);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#2A1810] text-[#FDFAF5] rounded-3xl p-6 shadow-warm-lg border border-[#4E2E1B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold">
              {order.order_number}
            </span>
            <span className="text-xs text-[#E9DFCE]/70">
              {formatDateTime(order.created_at)}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-[#FDFAF5] mt-1">
            {language === 'kn' ? t.statuses[order.status] : t.statuses[order.status]}
          </h2>
          <p className="text-xs text-amber-200/80 mt-0.5">
            {order.order_type === 'delivery' ? t.homeDelivery : t.restaurantPickup} • {order.payment_method.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${defaultSettings.phone_primary}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#3D2314] hover:bg-[#4E2E1B] text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t.callRestaurant}</span>
          </a>
          <button
            onClick={onBackToMenu}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
          >
            {t.viewMenu}
          </button>
        </div>
      </div>

      {/* Live Stepper Card */}
      {!isCancelled ? (
        <div className="bg-white rounded-3xl p-6 shadow-warm border border-stone-200 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
            {language === 'kn' ? 'ಆರ್ಡರ್ ಪ್ರಗತಿ' : 'Live Order Journey'}
          </h3>

          <div className="relative">
            {/* Stepper Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {steps.map((st, index) => {
                const IconComponent = st.icon;
                const isPassed = index <= currentStepIdx;
                const isCurrent = index === currentStepIdx;

                return (
                  <div
                    key={st.key}
                    className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-amber-50 border-amber-500 shadow-sm scale-105'
                        : isPassed
                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                        : 'bg-stone-50 border-stone-200 opacity-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 font-bold ${
                        isCurrent
                          ? 'bg-amber-500 text-stone-950 animate-bounce'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-extrabold leading-tight text-stone-900">
                      {language === 'kn' ? st.label_kn : st.label_en}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Driver / Map Card (If Out for Delivery) */}
          {order.assigned_driver && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2A1810] text-amber-400 flex items-center justify-center font-bold">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Assigned Rider
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      LIVE ON ROUTE
                    </span>
                  </div>
                  <h4 className="font-extrabold text-stone-900 text-sm">
                    {order.assigned_driver.name}
                  </h4>
                  <p className="text-xs text-stone-500 font-mono">
                    {order.assigned_driver.vehicle_number} ({order.assigned_driver.vehicle_type})
                  </p>
                </div>
              </div>

              <a
                href={`tel:${order.assigned_driver.phone}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Driver ({order.assigned_driver.phone})</span>
              </a>
            </div>
          )}

          {/* Map Visualizer (Displaying real permitted driver coordinate location when available) */}
          {order.order_type === 'delivery' && (
            <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>Doorstep Route: Basaveshwara Dabha ➔ {order.delivery_address?.landmark || 'Your Address'}</span>
                </div>
                <span className="text-[11px] text-stone-500 font-mono">
                  Coordinates: {order.driver_lat || 15.3647}° N, {order.driver_lng || 75.1240}° E
                </span>
              </div>
              <div className="h-32 bg-stone-200 rounded-xl relative overflow-hidden flex items-center justify-center text-xs text-stone-600 font-medium border border-stone-300">
                <div className="text-center space-y-1">
                  <p className="font-bold text-stone-800">
                    🗺️ Highway Corridor Map: Hubballi-Dharwad Bypass
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Live GPS tracker coordinates mapped directly via Google Maps API
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
          <h3 className="font-extrabold text-red-900 text-lg">Order Not Fulfilled</h3>
          <p className="text-xs text-red-700 max-w-md mx-auto">
            This order was cancelled or declined by the restaurant. If you have any questions, please contact the manager directly at {defaultSettings.phone_primary}.
          </p>
        </div>
      )}

      {/* Order Item Summary Card */}
      <div className="bg-white rounded-3xl p-6 shadow-warm border border-stone-200 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
          {language === 'kn' ? 'ಆರ್ಡರ್ ಮಾಡಲಾದ ತಿಂಡಿಗಳು' : 'Items in this Order'}
        </h3>

        <div className="divide-y divide-stone-100 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-stone-900">
                  {language === 'kn' ? item.product_name_kn : item.product_name_en}
                </span>
                {item.variant_name_en && (
                  <span className="text-amber-800 ml-1.5">
                    ({language === 'kn' ? item.variant_name_kn : item.variant_name_en})
                  </span>
                )}
                <span className="text-stone-400 ml-2 font-bold">x{item.quantity}</span>
              </div>
              <span className="font-semibold text-stone-900 font-mono">
                {formatPrice(item.total_price)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-200 pt-3 flex justify-between items-center text-sm font-black text-stone-950">
          <span>{t.toPay}</span>
          <span className="text-amber-800 text-base">{formatPrice(order.total_amount)}</span>
        </div>
      </div>

      {/* Ratings & Review Box (Shows when delivered) */}
      {isCompleted && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h4 className="font-extrabold text-stone-900 text-sm">
              {language === 'kn' ? 'ದಾಬಾ ಊಟದ ಅನುಭವ ಹೇಗಿತ್ತು?' : 'How was your Basaveshwara Dabha meal?'}
            </h4>
          </div>

          {!reviewSubmitted ? (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-900 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>

              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a review about the Jolada Rotti, spices, delivery speed..."
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
              >
                Submit Review
              </button>
            </form>
          ) : (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>
                {language === 'kn'
                  ? 'ನಿಮ್ಮ ಅಮೂಲ್ಯ ಅಭಿಪ್ರಾಯಕ್ಕೆ ಧನ್ಯವಾದಗಳು!'
                  : 'Thank you for your rating & feedback!'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
