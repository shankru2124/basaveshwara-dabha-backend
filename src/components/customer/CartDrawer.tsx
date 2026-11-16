import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatPrice } from '../../utils/formatters';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Bike, Store, Sparkles, Tag, Check, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onProceedToCheckout }) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    tax,
    discountAmount,
    totalAmount,
    orderType,
    setOrderType,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    appliedOffer,
    applyPromoCode,
    removePromoCode,
    offers,
  } = useCart();
  const { language, t } = useLanguage();
  const [instructions, setInstructions] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  if (!isOpen) return null;

  const handleApplyPromo = (codeToApply?: string) => {
    const code = codeToApply || promoInput;
    if (!code.trim()) return;

    const res = applyPromoCode(code);
    setPromoFeedback({ success: res.success, msg: res.message });
    if (res.success) {
      setPromoInput('');
    }
    setTimeout(() => setPromoFeedback(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FDFAF5] shadow-2xl flex flex-col border-l border-amber-900/20">
          {/* Header */}
          <div className="bg-[#2A1810] text-[#FDFAF5] px-5 py-4 flex items-center justify-between border-b border-[#4E2E1B]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="font-extrabold text-base text-amber-300">
                  {t.cartTitle}
                </h2>
                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <span>● 100% PURE VEG</span> • {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#E9DFCE] hover:text-white hover:bg-[#3D2314] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-bold text-stone-800 text-lg">{t.emptyCart}</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  {t.emptyCartSub}
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all"
                >
                  {t.viewMenu}
                </button>
              </div>
            ) : (
              <>
                {/* Order Mode Toggle (Delivery vs Pickup) */}
                <div className="bg-stone-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                  <button
                    onClick={() => setOrderType('delivery')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                      orderType === 'delivery'
                        ? 'bg-[#2A1810] text-amber-400 shadow-sm'
                        : 'text-stone-700 hover:text-stone-950'
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span>{t.homeDelivery}</span>
                  </button>
                  <button
                    onClick={() => setOrderType('pickup')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                      orderType === 'pickup'
                        ? 'bg-[#2A1810] text-amber-400 shadow-sm'
                        : 'text-stone-700 hover:text-stone-950'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>{t.restaurantPickup}</span>
                  </button>
                </div>

                {/* Free Delivery Bar (If Delivery Mode) */}
                {orderType === 'delivery' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-amber-900">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        {amountNeededForFreeDelivery > 0
                          ? `Add ${formatPrice(amountNeededForFreeDelivery)} more for FREE Delivery!`
                          : 'You unlocked FREE direct delivery! 🎉'}
                      </span>
                      <span>₹{freeDeliveryThreshold}</span>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Item List */}
                <div className="space-y-3 divide-y divide-stone-200">
                  {items.map((item) => {
                    const unitPrice = item.selected_variant
                      ? item.selected_variant.price
                      : item.product.base_price;
                    const itemTotal = unitPrice * item.quantity;

                    return (
                      <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-1">
                            <div className="veg-indicator">
                              <div className="veg-indicator-dot" />
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-stone-900 leading-snug">
                              {language === 'kn' ? item.product.name_kn : item.product.name_en}
                            </p>
                            {item.selected_variant && (
                              <p className="text-[11px] text-amber-800 font-medium">
                                {language === 'kn' ? item.selected_variant.name_kn : item.selected_variant.name_en}
                              </p>
                            )}
                            <p className="text-xs text-stone-500 font-semibold mt-0.5">
                              {formatPrice(unitPrice)} x {item.quantity} = {formatPrice(itemTotal)}
                            </p>
                          </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg p-1 shadow-xs">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-xs px-1 min-w-[16px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-stone-400 hover:text-red-600 rounded ml-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Code & Offers Section */}
                <div className="bg-white rounded-xl p-3.5 border border-stone-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.promoCode}</span>
                  </div>

                  {appliedOffer ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs">
                      <div>
                        <span className="font-black text-emerald-900 font-mono">
                          {appliedOffer.code}
                        </span>
                        <p className="text-[11px] text-emerald-700">
                          {language === 'kn' ? appliedOffer.title_kn : appliedOffer.title_en}
                        </p>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="text-xs font-bold text-red-600 hover:text-red-800"
                      >
                        {t.removePromo}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="e.g. ROTTI50, PUREVEG15"
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 uppercase font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        onClick={() => handleApplyPromo()}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
                      >
                        {t.applyPromo}
                      </button>
                    </div>
                  )}

                  {promoFeedback && (
                    <div
                      className={`text-[11px] font-semibold flex items-center gap-1 ${
                        promoFeedback.success ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {promoFeedback.success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{promoFeedback.msg}</span>
                    </div>
                  )}

                  {/* Quick Click Available Coupons */}
                  {!appliedOffer && offers.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {offers.filter((o) => o.is_active).map((off) => (
                        <button
                          key={off.id}
                          onClick={() => handleApplyPromo(off.code)}
                          className="text-[10px] font-mono font-bold bg-amber-100/70 hover:bg-amber-200 text-amber-900 px-2 py-0.5 rounded border border-amber-300"
                        >
                          +{off.code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Special Instructions Note */}
                <div className="pt-1">
                  <label className="text-xs font-semibold text-stone-600 block mb-1">
                    {t.specialInstructions}
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Less oil in Yennegai, extra Shenga Chutney..."
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Bill Breakdown */}
                <div className="bg-white rounded-xl p-4 border border-stone-200 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>{t.subtotal}</span>
                    <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>{t.discount} ({appliedOffer?.code})</span>
                      </span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-600">
                    <span>{t.deliveryFee}</span>
                    <span className="font-semibold text-stone-900">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-700 font-bold">{t.freeDelivery}</span>
                      ) : (
                        formatPrice(deliveryFee)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>{t.taxes}</span>
                    <span className="font-semibold text-stone-900">{formatPrice(tax)}</span>
                  </div>

                  <div className="border-t border-stone-200 pt-2 flex justify-between font-black text-sm text-stone-950">
                    <span>{t.toPay}</span>
                    <span className="text-amber-800 text-base">{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Action */}
          {items.length > 0 && (
            <div className="bg-[#2A1810] p-4 border-t border-[#4E2E1B] space-y-2">
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-lg flex items-center justify-between transition-all transform hover:-translate-y-0.5"
              >
                <span>{t.proceedToCheckout}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold">{formatPrice(totalAmount)}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
