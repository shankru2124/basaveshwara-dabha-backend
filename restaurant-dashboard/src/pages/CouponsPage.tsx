import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Power } from 'lucide-react';
import { Coupon } from '../types';
import { api } from '../services/api';

export const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [maxDiscount, setMaxDiscount] = useState<number>(100);
  const [minOrder, setMinOrder] = useState<number>(199);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      const data = await api.getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggle = async (couponId: string) => {
    try {
      await api.toggleCoupon(couponId);
      fetchCoupons();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle coupon');
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      await api.deleteCoupon(couponId);
      fetchCoupons();
    } catch (err: any) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountValue <= 0) return;
    setIsSubmitting(true);
    try {
      await api.createCoupon({
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        max_discount_amount: discountType === 'percentage' ? Number(maxDiscount) : undefined,
        min_order_amount: Number(minOrder),
        is_active: true
      });
      setIsModalOpen(false);
      setCode('');
      fetchCoupons();
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Coupons & Special Promos</h2>
          <p className="text-xs text-slate-500 font-medium">Create promotional discounts for customers with minimum order caps</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id || c.code}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-brand-50 text-brand-700 font-black text-sm tracking-wider rounded-xl border border-brand-200">
                  {c.code}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  c.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {c.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <p className="font-extrabold text-base text-slate-900">
                  {c.discount_type === 'percentage'
                    ? `${c.discount_value}% OFF`
                    : `₹${c.discount_value} FLAT OFF`}
                </p>
                {c.max_discount_amount && (
                  <p className="text-slate-500">Max Discount: ₹{c.max_discount_amount}</p>
                )}
                <p className="text-slate-500">Min Order Amount: ₹{c.min_order_amount}</p>
                <p className="text-slate-400">Total Times Redeemed: {c.used_count || 0}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
              <button
                onClick={() => handleToggle(c.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  c.is_active ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {c.is_active ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete Coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">Create New Coupon</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SPECIAL30"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl uppercase font-extrabold text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Rupees (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                {discountType === 'percentage' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      min={1}
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl"
                >
                  {isSubmitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
