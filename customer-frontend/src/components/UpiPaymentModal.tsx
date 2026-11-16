import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, Copy, Check, ExternalLink, ShieldCheck,
  AlertCircle, X, Smartphone, QrCode, Clock, Loader2, ArrowRight, RefreshCw, Zap
} from 'lucide-react';
import { api } from '../services/api';

interface UpiPaymentModalProps {
  isOpen: boolean;
  orderId: string;
  totalAmount: number;
  upiDetails?: {
    upi_id: string;
    payee_name: string;
    upi_intent_uri: string;
    qr_image_url?: string;
  };
  onSuccess: (orderId: string) => void;
  onClose: () => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  orderId,
  totalAmount,
  upiDetails,
  onSuccess,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedApp, setSelectedApp] = useState('Google Pay');
  const [utrNumber, setUtrNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [showQrStandalone, setShowQrStandalone] = useState(false);
  const [hasLaunchedApp, setHasLaunchedApp] = useState(false);
  const [returnedFromApp, setReturnedFromApp] = useState(false);

  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const upiId = upiDetails?.upi_id || 'basaveshwaradabha@okaxis';
  const payeeName = upiDetails?.payee_name || 'Basaveshwara Dabha';
  const rawIntent = upiDetails?.upi_intent_uri ||
    `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&tn=Order%20${orderId}&cu=INR`;

  // App specific deep-link schemes
  const gpayUri = `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&tn=Order%20${orderId}&cu=INR`;
  const phonepeUri = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&tn=Order%20${orderId}&cu=INR`;
  const paytmUri = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&tn=Order%20${orderId}&cu=INR`;

  // QR Code Image URL (either custom uploaded QR or dynamic amount QR)
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(rawIntent)}`;
  const qrImageToShow = upiDetails?.qr_image_url ? upiDetails.qr_image_url : dynamicQrUrl;

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Window Focus / Visibility change listener: detects when user returns from UPI app
  useEffect(() => {
    if (!isOpen) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && hasLaunchedApp) {
        setReturnedFromApp(true);
      }
    };

    const handleWindowFocus = () => {
      if (hasLaunchedApp) {
        setReturnedFromApp(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isOpen, hasLaunchedApp]);

  // Background status poller to auto-complete order if payment is confirmed
  useEffect(() => {
    if (!isOpen || !orderId) return;

    const poller = setInterval(async () => {
      try {
        const orderData = await api.trackOrder(orderId);
        if (orderData && orderData.payment_status === 'COMPLETED') {
          clearInterval(poller);
          onSuccess(orderId);
        }
      } catch (e) {
        // Silent catch for background poller
      }
    }, 3000);

    return () => clearInterval(poller);
  }, [isOpen, orderId, onSuccess]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const launchUpiApp = (uri: string, appName: string) => {
    setSelectedApp(appName);
    setHasLaunchedApp(true);
    setError('');

    // Launch UPI intent
    window.location.href = uri;

    // After brief delay, prompt return confirmation
    setTimeout(() => {
      setReturnedFromApp(true);
    }, 2000);
  };

  const handleConfirmPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      await api.confirmUpiPayment({
        order_id: orderId,
        utr_number: utrNumber.trim() || undefined,
        upi_app: selectedApp
      });

      // Play chime audio if possible
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch (err) {}

      setIsVerifying(false);
      onSuccess(orderId);
    } catch (err: any) {
      setError(err.message || 'Payment confirmation failed. Please verify with restaurant or try again.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 my-4 sm:my-8 transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-brand-600 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
            title="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-orange-100">
              Live Real-Time UPI Gateway
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Pay ₹{totalAmount.toFixed(2)}
            </h2>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-bold">
              Order #{orderId}
            </span>
          </div>

          <p className="text-xs text-orange-100 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Time remaining to pay: <strong className="font-mono text-white">{formatTimer(timeLeft)}</strong></span>
          </p>
        </div>

        {/* Returned from UPI App Banner if user switched back to browser */}
        {returnedFromApp && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-black text-emerald-900">
                  Did you complete payment in {selectedApp}?
                </h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Click below to confirm your payment and immediately redirect to live order tracking.
                </p>
                <button
                  type="button"
                  onClick={() => handleConfirmPayment()}
                  disabled={isVerifying}
                  className="mt-2.5 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying & Sending to Kitchen...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Yes, Payment Done! Track My Order
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Direct Mobile App Payment Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-brand-600" />
                Pay on this Phone (Direct UPI Apps)
              </span>
              <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                Instant 1-Click
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Tap any app to open it with ₹{totalAmount.toFixed(2)} automatically filled:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Google Pay */}
              <button
                type="button"
                onClick={() => launchUpiApp(gpayUri, 'Google Pay')}
                className="flex items-center gap-2.5 p-3 rounded-2xl border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 bg-white shadow-sm transition group active:scale-95 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-blue-600">G</span>
                  <span className="text-xs font-black text-red-500">P</span>
                  <span className="text-xs font-black text-amber-500">a</span>
                  <span className="text-xs font-black text-green-600">y</span>
                </div>
                <div>
                  <span className="font-extrabold text-xs text-gray-900 group-hover:text-emerald-700 block">
                    Google Pay
                  </span>
                  <span className="text-[10px] text-gray-400">Open App</span>
                </div>
              </button>

              {/* PhonePe */}
              <button
                type="button"
                onClick={() => launchUpiApp(phonepeUri, 'PhonePe')}
                className="flex items-center gap-2.5 p-3 rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50/50 bg-white shadow-sm transition group active:scale-95 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#5f259f] text-white shadow flex items-center justify-center shrink-0 font-black text-xs">
                  पे
                </div>
                <div>
                  <span className="font-extrabold text-xs text-gray-900 group-hover:text-purple-700 block">
                    PhonePe
                  </span>
                  <span className="text-[10px] text-gray-400">Open App</span>
                </div>
              </button>

              {/* Paytm */}
              <button
                type="button"
                onClick={() => launchUpiApp(paytmUri, 'Paytm')}
                className="flex items-center gap-2.5 p-3 rounded-2xl border-2 border-gray-200 hover:border-sky-500 hover:bg-sky-50/50 bg-white shadow-sm transition group active:scale-95 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#002e6e] text-[#00b9f5] shadow flex items-center justify-center shrink-0 font-black text-[10px]">
                  Paytm
                </div>
                <div>
                  <span className="font-extrabold text-xs text-gray-900 group-hover:text-sky-700 block">
                    Paytm UPI
                  </span>
                  <span className="text-[10px] text-gray-400">Open App</span>
                </div>
              </button>

              {/* Any Other UPI App */}
              <button
                type="button"
                onClick={() => launchUpiApp(rawIntent, 'Other UPI App')}
                className="flex items-center gap-2.5 p-3 rounded-2xl border-2 border-brand-200 bg-brand-50/60 hover:bg-brand-100 hover:border-brand-500 shadow-sm transition group active:scale-95 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white shadow flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-brand-900 block">
                    Any UPI App
                  </span>
                  <span className="text-[10px] text-brand-600 font-semibold">BHIM / CRED / All</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: QR Code Section (Scan with another phone / Desktop) */}
          <div className="bg-gradient-to-b from-amber-50/70 to-orange-50/40 rounded-3xl p-4 sm:p-5 border border-amber-200/70 text-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-orange-600" />
                Scan QR Code to Pay
              </span>
              <span className="text-[10px] bg-white border border-amber-300 text-amber-900 font-bold px-2 py-0.5 rounded-full shadow-sm">
                GPay • PhonePe • Paytm
              </span>
            </div>

            <div className="p-3 bg-white rounded-2xl shadow-md border border-amber-200 inline-block relative mt-1">
              <img
                src={qrImageToShow}
                alt="Restaurant UPI QR Code"
                className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg mx-auto"
              />
              <div className="mt-2 text-center">
                <span className="inline-block bg-orange-100 text-orange-950 text-xs font-black px-3 py-1 rounded-full">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-gray-700">
              <span className="text-gray-500">Payee:</span>
              <span className="text-orange-900 font-black">{payeeName}</span>
            </div>
          </div>

          {/* Section 3: Copy UPI ID */}
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block">
              Direct UPI ID / VPA
            </span>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="font-mono text-xs sm:text-sm font-bold text-gray-900 select-all truncate">
                {upiId}
              </span>
              <button
                type="button"
                onClick={handleCopyUpiId}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy UPI ID
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 4: Confirm Payment & Redirect Button */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                12-digit UTR / UPI Reference No. (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 432109876543 (from payment receipt)"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                maxLength={24}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-xs"
              />
            </div>

            <button
              type="button"
              onClick={() => handleConfirmPayment()}
              disabled={isVerifying}
              className="w-full py-4 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-70 text-white font-black rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 text-sm transition transform active:scale-98"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Payment & Alerting Kitchen...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  I Have Paid ₹{totalAmount.toFixed(2)} - View Live Tracking
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Security Guarantee */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Verified Pure Veg Restaurant Kitchen • Instant Order Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};
