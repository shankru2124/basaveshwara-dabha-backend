import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, Tag, ArrowRight, ArrowLeft, ShoppingBag, ShieldCheck, Bike, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { FulfillmentType } from '../types';

interface CartDrawerProps {
  onCheckout: () => void;
  onExploreMenu: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onExploreMenu }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    fulfillmentType,
    setFulfillmentType,
    appliedCoupon,
    setAppliedCoupon,
    calculation,
    isCalculating,
    totalItemCount
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (code: string) => {
    setCouponError('');
    setAppliedCoupon(code);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponInput('');
    setCouponError('');
  };

  const canProceed = calculation?.can_place_order && items.length > 0;

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md flex">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 -ml-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full sm:hidden transition"
                title="Back to menu"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-gray-900 text-base sm:text-lg">My Food Cart</h2>
                <p className="text-xs text-gray-500">{totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} selected</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-brand-50 flex items-center justify-center text-brand-500">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Your cart is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Good food is always cooking! Add delicious pure vegetarian items from our menu.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onExploreMenu();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-brand-500/20"
                >
                  Explore Delicious Menu
                </button>
              </div>
            ) : (
              <>
                {/* Fulfillment Type Selector (Delivery vs Pickup) */}
                <div className="bg-gray-50 p-1.5 rounded-2xl flex items-center gap-1 border border-gray-100">
                  <button
                    onClick={() => setFulfillmentType('DELIVERY')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition ${
                      fulfillmentType === 'DELIVERY'
                        ? 'bg-white text-brand-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    Delivery
                  </button>
                  <button
                    onClick={() => setFulfillmentType('PICKUP')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition ${
                      fulfillmentType === 'PICKUP'
                        ? 'bg-white text-brand-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    Self Pickup
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <span>Items ({items.length})</span>
                    <button
                      onClick={clearCart}
                      className="text-red-500 hover:text-red-700 transition lowercase"
                    >
                      clear all
                    </button>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border border-veg flex items-center justify-center rounded-sm bg-white shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-veg"></span>
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">₹{item.price} each</p>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-1.5 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:bg-white transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-gray-900 px-1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:bg-white transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="text-right min-w-[50px]">
                        <p className="font-extrabold text-sm text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupons Section */}
                <div className="p-3.5 bg-brand-50/60 rounded-2xl border border-brand-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-brand-900">
                      <Tag className="w-3.5 h-3.5 text-brand-600" />
                      Apply Discount Coupon
                    </span>
                    {appliedCoupon && (
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="p-2.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 font-semibold flex justify-between items-center">
                      <span>Coupon <strong>{appliedCoupon}</strong> Applied!</span>
                      <span className="text-green-700 font-extrabold">
                        -₹{calculation?.discount_amount || 0}
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon (e.g. WELCOME50)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold uppercase focus:outline-none focus:border-brand-500"
                      />
                      <button
                        onClick={() => handleApplyCoupon(couponInput)}
                        className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {/* Quick coupon tags */}
                  {!appliedCoupon && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['WELCOME50', 'DABHA20', 'FLAT100'].map((code) => (
                        <button
                          key={code}
                          onClick={() => handleApplyCoupon(code)}
                          className="px-2.5 py-1 bg-white border border-brand-200 hover:border-brand-500 text-brand-800 text-[11px] font-bold rounded-lg transition"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Calculation Summary */}
                {calculation && (
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2.5 text-xs text-gray-600">
                    <h4 className="font-bold text-gray-900 text-sm mb-2">Bill Summary</h4>
                    <div className="flex justify-between">
                      <span>Item Total</span>
                      <span className="font-semibold text-gray-900">₹{calculation.subtotal}</span>
                    </div>
                    {calculation.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Coupon Discount ({appliedCoupon})</span>
                        <span>-₹{calculation.discount_amount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Taxes & GST (5%)</span>
                      <span className="font-semibold text-gray-900">₹{calculation.tax_amount}</span>
                    </div>
                    {fulfillmentType === 'DELIVERY' && (
                      <div className="flex justify-between">
                        <span>Restaurant Delivery Fee</span>
                        <span className="font-semibold text-gray-900">
                          {calculation.delivery_fee === 0 ? (
                            <span className="text-green-600 font-bold uppercase text-[11px]">FREE</span>
                          ) : (
                            `₹${calculation.delivery_fee}`
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Packaging Charges</span>
                      <span className="font-semibold text-gray-900">₹{calculation.packaging_fee}</span>
                    </div>

                    <div className="border-t border-gray-100 pt-2.5 flex justify-between items-baseline text-sm font-extrabold text-gray-900">
                      <span>To Pay</span>
                      <span className="text-lg text-brand-600 font-extrabold">₹{calculation.total_amount}</span>
                    </div>
                  </div>
                )}

                {/* Validation Warnings */}
                {calculation && !calculation.is_restaurant_open && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                    Restaurant is currently closed and not accepting new orders.
                  </div>
                )}

                {calculation && calculation.subtotal < calculation.min_order_value && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                    Minimum order amount is ₹{calculation.min_order_value}. Add ₹{(calculation.min_order_value - calculation.subtotal).toFixed(0)} more to order!
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white sticky bottom-0 z-20 pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.08)] shrink-0">
              <button
                disabled={!canProceed || isCalculating}
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-between text-white font-extrabold text-sm transition shadow-lg ${
                  canProceed && !isCalculating
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-brand-500/30 active:scale-98'
                    : 'bg-gray-300 cursor-not-allowed shadow-none'
                }`}
              >
                <div className="text-left">
                  <p className="text-[11px] text-brand-100 uppercase tracking-wider font-semibold">
                    {fulfillmentType === 'DELIVERY' ? 'Home Delivery' : 'Pickup at Counter'}
                  </p>
                  <p className="font-black text-lg">
                    ₹{calculation?.total_amount || 0}
                  </p>
                </div>
                <div className="flex items-center gap-2 font-black uppercase tracking-wider text-xs bg-black/20 py-2 px-3.5 rounded-xl backdrop-blur-xs">
                  <span>Proceed to Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
