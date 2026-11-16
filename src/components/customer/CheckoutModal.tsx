import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { PaymentMethod } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { X, ShieldCheck, MapPin, Phone, User, CreditCard, Banknote, Sparkles, CheckCircle2 } from 'lucide-react';
import { triggerConfetti } from '../../utils/confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { items, clearCart, subtotal, deliveryFee, tax, discountAmount, totalAmount, orderType, appliedOffer } = useCart();
  const { placeOrder } = useOrders();
  const { customerProfile, updateCustomerProfile } = useAuth();
  const { language, t } = useLanguage();

  const [fullName, setFullName] = useState(customerProfile.name);
  const [phone, setPhone] = useState(customerProfile.phone);
  const [addressLine1, setAddressLine1] = useState(customerProfile.defaultAddress.address_line1);
  const [landmark, setLandmark] = useState(customerProfile.defaultAddress.landmark || '');
  const [pincode, setPincode] = useState(customerProfile.defaultAddress.pincode);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    if (orderType === 'delivery') {
      if (!addressLine1.trim()) {
        setErrorMsg('Please enter your complete doorstep delivery address.');
        return;
      }
      if (!pincode.trim() || pincode.trim().length < 6) {
        setErrorMsg('Please enter a valid 6-digit PIN code.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Save profile updates
      updateCustomerProfile({
        name: fullName,
        phone: phone,
        defaultAddress: {
          ...customerProfile.defaultAddress,
          full_name: fullName,
          phone: phone,
          address_line1: addressLine1,
          landmark: landmark,
          pincode: pincode,
        },
      });

      // Prepare order items
      const orderItems = items.map((item) => {
        const unitPrice = item.selected_variant ? item.selected_variant.price : item.product.base_price;
        return {
          product_id: item.product.id,
          product_name_en: item.product.name_en,
          product_name_kn: item.product.name_kn,
          variant_name_en: item.selected_variant?.name_en,
          variant_name_kn: item.selected_variant?.name_kn,
          quantity: item.quantity,
          unit_price: unitPrice,
          total_price: unitPrice * item.quantity,
          special_instructions: item.special_instructions,
        };
      });

      const newOrder = placeOrder({
        customer_name: fullName,
        customer_phone: phone,
        order_type: orderType,
        delivery_address:
          orderType === 'delivery'
            ? {
                label: 'Home',
                full_name: fullName,
                phone: phone,
                address_line1: addressLine1,
                landmark: landmark,
                city: 'Hubballi',
                pincode: pincode,
                lat: 15.3647,
                lng: 75.1240,
              }
            : undefined,
        payment_method: paymentMethod,
        items: orderItems,
        subtotal,
        discount_amount: discountAmount,
        applied_coupon_code: appliedOffer?.code,
        tax,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
      });

      // Celebration Confetti
      triggerConfetti();

      clearCart();
      setIsSubmitting(false);
      onClose();
      onOrderSuccess(newOrder.id);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFAF5] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-900/20 my-8">
        {/* Header */}
        <div className="bg-[#2A1810] text-[#FDFAF5] px-6 py-4 flex items-center justify-between border-b border-[#4E2E1B]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="font-extrabold text-lg text-amber-300">
              {language === 'kn' ? 'ಆರ್ಡರ್ ಚೆಕ್‌ಔಟ್' : 'Confirm Your Dabha Feast'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#E9DFCE] hover:text-white hover:bg-[#3D2314] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Delivery vs Pickup Notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-950 block">
                {orderType === 'delivery' ? t.homeDelivery : t.restaurantPickup}
              </span>
              <span className="text-amber-800/80 text-[11px]">
                {orderType === 'delivery' ? 'Delivered straight to your doorstep' : 'Collect directly from Dabha counter'}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-[#2A1810] text-amber-400 font-extrabold text-xs">
              {formatPrice(totalAmount)}
            </span>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {language === 'kn' ? 'ಗ್ರಾಹಕರ ವಿವರಗಳು' : 'Contact Information'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t.fullName} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t.phoneNumber} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 00000"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address (Only if Delivery) */}
          {orderType === 'delivery' && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {t.deliveryAddress}
              </h3>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t.addressLine1} *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <textarea
                    required
                    rows={2}
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="House/Apartment #, Building, Street Name..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {t.landmark}
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Nearby temple, school, bank..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {t.pincode} *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="580020"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t.paymentMethod}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold text-left transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-xs'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${paymentMethod === 'cod' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <p>{t.cashOnDelivery}</p>
                  <span className="text-[10px] text-stone-500 font-normal">Pay upon receiving food</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold text-left transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-xs'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${paymentMethod === 'razorpay' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p>Razorpay Online</p>
                  <span className="text-[10px] text-stone-500 font-normal">UPI, GPay, Cards, NetBanking</span>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <CheckCircle2 className="w-5 h-5 text-stone-950" />
              <span>
                {isSubmitting ? 'Confirming Order...' : `${t.placeOrder} • ${formatPrice(totalAmount)}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
