import React, { useState, useEffect } from 'react';
import {
  MapPin, Phone, User as UserIcon, CreditCard, Banknote,
  ShieldCheck, AlertCircle, ArrowLeft, Bike, Store, CheckCircle, Navigation, QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { PaymentMethod, FulfillmentType } from '../types';
import { api } from '../services/api';
import { UpiPaymentModal } from '../components/UpiPaymentModal';

interface CheckoutPageProps {
  onOrderSuccess: (orderId: string) => void;
  onBack: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderSuccess, onBack }) => {
  const { user } = useAuth();
  const { items, calculation, fulfillmentType, setFulfillmentType, appliedCoupon, clearCart } = useCart();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Address
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560001');
  const [orderInstructions, setOrderInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('RAZORPAY_UPI');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [upiModalData, setUpiModalData] = useState<{
    orderId: string;
    totalAmount: number;
    upiDetails: any;
  } | null>(null);

  // Sync user info if logged in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerPhone) setCustomerPhone(user.phone);
      if (!customerEmail) setCustomerEmail(user.email);
      if (user.addresses && user.addresses.length > 0 && !addressLine) {
        const primary = user.addresses[0];
        setAddressLine(primary.address_line);
        setLandmark(primary.landmark || '');
        setCity(primary.city || 'Bengaluru');
        setPincode(primary.pincode || '560001');
      }
    }
  }, [user]);

  // Quick Address Locator Simulation
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setAddressLine(`Near GPS Coordinates (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}), Indiranagar 100ft Road`);
          setLandmark('Opposite Metro Station');
          setCity('Bengaluru');
        },
        () => {
          setAddressLine('#108, 1st Cross, Near Basaveshwara Circle, Indiranagar');
          setLandmark('Near BDA Complex');
          setCity('Bengaluru');
        }
      );
    } else {
      setAddressLine('#108, 1st Cross, Near Basaveshwara Circle, Indiranagar');
      setLandmark('Near BDA Complex');
      setCity('Bengaluru');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items to order.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide your name and contact number.');
      return;
    }

    if (fulfillmentType === 'DELIVERY' && !addressLine.trim()) {
      setErrorMessage('Please provide a delivery address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || undefined,
        fulfillment_type: fulfillmentType,
        delivery_address:
          fulfillmentType === 'DELIVERY'
            ? {
                title: 'Home',
                address_line: addressLine,
                landmark: landmark || undefined,
                city,
                pincode
              }
            : undefined,
        order_instructions: orderInstructions || undefined,
        coupon_code: appliedCoupon || undefined,
        payment_method: paymentMethod,
        items: items.map((i) => ({ item_id: i.id, quantity: i.quantity }))
      };

      // 1. Create order on backend
      const res = await api.createOrder(orderPayload);
      const createdOrder = res.order;
      const orderId = createdOrder.order_id;

      // 2. If Direct Restaurant Merchant Stand QR
      if (paymentMethod === 'DIRECT_QR') {
        setIsSubmitting(false);
        setUpiModalData({
          orderId,
          totalAmount: createdOrder.total_amount,
          upiDetails: res.upi
        });
        return;
      }

      // 3. If automated online payment (UPI / GPay / PhonePe / Paytm / Cards via Gateway)
      if (
        paymentMethod === 'RAZORPAY_UPI' ||
        paymentMethod === 'RAZORPAY_CARD' ||
        paymentMethod === 'RAZORPAY_NETBANKING'
      ) {
        const razorpayOrderId = res.razorpay_order_id;
        const keyId = res.key_id;

        // Open Razorpay Standard Automated Checkout
        if (typeof window.Razorpay !== 'undefined') {
          const options = {
            key: keyId,
            amount: Math.round(createdOrder.total_amount * 100),
            currency: 'INR',
            name: 'Basaveshwara Dabha',
            description: `Order #${orderId}`,
            image: '/logo.jpg',
            order_id: razorpayOrderId,
            prefill: {
              name: customerName,
              email: customerEmail || 'customer@basaveshwara.com',
              contact: customerPhone
            },
            theme: {
              color: '#ea580c'
            },
            handler: async (response: any) => {
              setIsSubmitting(true);
              try {
                // Verify signature on backend (HMAC SHA256 anti-scam protection)
                await api.verifyPayment({
                  order_id: orderId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                });
                clearCart();
                onOrderSuccess(orderId);
              } catch (verifyErr: any) {
                setErrorMessage(verifyErr.message || 'Payment verification failed.');
                setIsSubmitting(false);
              }
            },
            modal: {
              ondismiss: () => {
                setIsSubmitting(false);
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        } else {
          // Fallback simulation for offline/test environments without Razorpay script
          await api.verifyPayment({
            order_id: orderId,
            razorpay_order_id: razorpayOrderId || `order_mock_${orderId}`,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: `sig_mock_${Date.now()}`
          });
          clearCart();
          onOrderSuccess(orderId);
          return;
        }
      }

      // COD Order placed successfully
      clearCart();
      onOrderSuccess(orderId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please check availability.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-600 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menu
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="md:col-span-2 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Fulfillment Type */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-gray-900">1. Order Type</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentType('DELIVERY')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
                  fulfillmentType === 'DELIVERY'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`p-2 rounded-xl ${fulfillmentType === 'DELIVERY' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Restaurant Delivery</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Dispatched directly by Dabha staff</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('PICKUP')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition ${
                  fulfillmentType === 'PICKUP'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`p-2 rounded-xl ${fulfillmentType === 'PICKUP' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Self Pickup</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Collect hot at the counter</p>
                </div>
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-gray-900">2. Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address (for Receipt)</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address (only if delivery) */}
          {fulfillmentType === 'DELIVERY' && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-gray-900">3. Delivery Address</h3>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Auto-Detect GPS
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Complete House / Flat / Street Address *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Flat 302, Sai Residency, 4th Main Road"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Landmark</label>
                    <input
                      type="text"
                      placeholder="e.g. Opposite BDA Complex"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Pincode</label>
                    <input
                      type="text"
                      placeholder="560001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Cooking / Delivery Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Please make paneer mildly spiced, do not ring doorbell"
                    value={orderInstructions}
                    onChange={(e) => setOrderInstructions(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-gray-900">4. Payment Method</h3>
            <div className="space-y-2.5">
              {/* 1. Automated Gateway UPI (Swiggy / Zomato style auto-redirect) */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'RAZORPAY_UPI'
                    ? 'border-brand-500 bg-brand-50/40 text-brand-900 shadow-sm ring-1 ring-brand-400'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="RAZORPAY_UPI"
                    checked={paymentMethod === 'RAZORPAY_UPI'}
                    onChange={() => setPaymentMethod('RAZORPAY_UPI')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm">UPI / Google Pay / PhonePe / Paytm / QR / Cards</h4>
                      <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-extrabold rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Auto-Redirecting
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Bank confirms payment automatically like Swiggy & Zomato • Instant redirect to tracking
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">GPay</span>
                  <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">PhonePe</span>
                  <span className="text-[10px] font-black text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">Paytm</span>
                </div>
              </label>

              {/* 2. Direct Counter Stand QR */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'DIRECT_QR'
                    ? 'border-brand-500 bg-brand-50/40 text-brand-900 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="DIRECT_QR"
                    checked={paymentMethod === 'DIRECT_QR'}
                    onChange={() => setPaymentMethod('DIRECT_QR')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm">Restaurant Counter Stand QR</h4>
                      <span className="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-800 font-bold rounded-full">
                        Manual Stand QR
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Scan restaurant's physical desk QR code (verified by restaurant kitchen manager)
                    </p>
                  </div>
                </div>
                <QrCode className="w-5 h-5 text-amber-600 shrink-0" />
              </label>

              {/* 3. Cash on Delivery */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-brand-500 bg-brand-50/40 text-brand-900 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <h4 className="font-bold text-sm">Cash on Delivery (COD)</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Pay cash when food is delivered</p>
                  </div>
                </div>
                <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Order Summary & Place Order CTA */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-gray-900">Order Summary</h3>

            {/* Selected items */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 max-w-[180px]">
                    <span className="w-2.5 h-2.5 border border-veg rounded-sm flex items-center justify-center shrink-0">
                      <span className="w-1 h-1 rounded-full bg-veg"></span>
                    </span>
                    <span className="font-semibold text-gray-800 truncate">{i.name}</span>
                    <span className="text-gray-400 font-bold">x{i.quantity}</span>
                  </div>
                  <span className="font-extrabold text-gray-900">₹{(i.price * i.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            {calculation && (
              <div className="border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{calculation.subtotal}</span>
                </div>
                {calculation.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount ({appliedCoupon})</span>
                    <span>-₹{calculation.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes (5% GST)</span>
                  <span className="font-semibold text-gray-900">₹{calculation.tax_amount}</span>
                </div>
                {fulfillmentType === 'DELIVERY' && (
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="font-semibold text-gray-900">
                      {calculation.delivery_fee === 0 ? 'FREE' : `₹${calculation.delivery_fee}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Packaging Fee</span>
                  <span className="font-semibold text-gray-900">₹{calculation.packaging_fee}</span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline font-black text-base text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-xl text-brand-600 font-black">₹{calculation.total_amount}</span>
                </div>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || items.length === 0}
              className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-brand-500/25 transition active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing Order...' : `Place Order • ₹${calculation?.total_amount || 0}`}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-veg" />
              100% Safe & Secure Ordering Guarantee
            </div>
          </div>
        </div>
      </div>

      {/* Real UPI Payment Modal */}
      {upiModalData && (
        <UpiPaymentModal
          isOpen={!!upiModalData}
          orderId={upiModalData.orderId}
          totalAmount={upiModalData.totalAmount}
          upiDetails={upiModalData.upiDetails}
          onSuccess={(orderId) => {
            setUpiModalData(null);
            clearCart();
            onOrderSuccess(orderId);
          }}
          onClose={() => {
            setUpiModalData(null);
          }}
        />
      )}
    </div>
  );
};
