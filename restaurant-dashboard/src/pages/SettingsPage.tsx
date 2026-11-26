import React, { useState, useEffect } from 'react';
import {
  Settings, Save, CheckCircle2, Power, Store, Phone, MapPin,
  DollarSign, Layout, Upload, Eye, Clock, Sparkles, Image as ImageIcon,
  QrCode, Copy, Check, Smartphone
} from 'lucide-react';
import { RestaurantSettings } from '../types';
import { api } from '../services/api';

interface SettingsPageProps {
  settings: RestaurantSettings | null;
  onRefresh: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onRefresh }) => {
  const [formData, setFormData] = useState<Partial<RestaurantSettings>>({});
  const [activeTab, setActiveTab] = useState<'header' | 'general' | 'upi'>('header');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const res = await api.uploadImage(file);
      handleChange('logo_url', res.url);
    } catch (err: any) {
      alert(err.message || 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingQr(true);
    try {
      const res = await api.uploadImage(file);
      handleChange('upi_qr_image_url', res.url);
    } catch (err: any) {
      alert(err.message || 'Failed to upload QR code image');
    } finally {
      setIsUploadingQr(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Preview logo URL computation
  const previewLogo = formData.logo_url || '/logo.jpg';
  const resolvedLogoUrl = previewLogo.startsWith('http')
    ? previewLogo
    : previewLogo.startsWith('/')
    ? (previewLogo === '/logo.jpg' ? '/logo.jpg' : `http://localhost:8000${previewLogo}`)
    : `http://localhost:8000/uploads/${previewLogo}`;

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Restaurant Settings & Header Customizer
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Customize the customer interface header, brand logo, policies, and store operating hours
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-2xl text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('header')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${
              activeTab === 'header'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layout className="w-4 h-4" />
            Customer Header
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${
              activeTab === 'general'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            General & Ops
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upi')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${
              activeTab === 'upi'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            UPI Gateway & QR
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-xs text-green-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          Settings saved successfully and published to the customer website in real-time!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* ===================== TAB 1: CUSTOMER HEADER EDITOR ===================== */}
        {activeTab === 'header' && (
          <div className="space-y-6">
            {/* Live Interactive Header Preview */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  Live Preview: Customer Website Header
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Updates live as you edit below</span>
              </div>

              {/* Mock Customer Header */}
              <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                {/* Mock Micro Bar */}
                {formData.header_show_announcement !== false && (
                  <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-brand-50 border-b border-orange-100 py-1.5 px-4 text-[11px] font-medium flex justify-between items-center text-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse shrink-0"></span>
                      <span className="font-bold text-green-800 truncate">
                        {formData.header_top_announcement || '100% Pure Vegetarian Kitchen • Authentic Desi Ghee Flavours'}
                      </span>
                      {formData.header_notice && (
                        <span className="hidden md:inline text-brand-700 font-semibold">• {formData.header_notice}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-[10px] text-slate-500">
                      {formData.header_show_timings !== false && (
                        <span>🕒 {formData.opening_time || '08:00 AM'} - {formData.closing_time || '11:00 PM'}</span>
                      )}
                      {formData.header_show_phone !== false && (
                        <span className="font-semibold text-slate-700">📞 {formData.phone || '+91 98765 43210'}</span>
                      )}
                      <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 font-bold">Open</span>
                    </div>
                  </div>
                )}

                {/* Mock Main Header Bar */}
                <div className="p-3 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md border border-brand-200 shrink-0 bg-slate-100">
                      <img
                        src={resolvedLogoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                          {formData.restaurant_name || 'Basaveshwara Dabha'}
                        </span>
                        <span className="w-3.5 h-3.5 border border-green-600 flex items-center justify-center rounded-xs p-0.5" title={formData.header_badge_text || 'Pure Veg'}>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {formData.header_tagline || formData.tagline || 'Authentic Pure Vegetarian Flavours'}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-3 text-xs font-bold text-slate-600">
                    <span className="text-brand-600 font-extrabold">Home</span>
                    <span>Explore Menu</span>
                    <span>My Orders</span>
                    <span className="px-3 py-1.5 rounded-xl bg-brand-600 text-white shadow-sm">Cart (0)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Customization Form Controls */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <h3 className="font-extrabold text-base text-slate-900">Header Branding & Logo</h3>

              {/* Logo Management Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-brand-300 bg-white shrink-0">
                    <img
                      src={resolvedLogoUrl}
                      alt="Brand Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Current Website Logo</h4>
                    <p className="text-slate-500 text-[11px] max-w-xs">
                      Authentic Lord Basaveshwara Dabha official logo graphic.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl cursor-pointer transition shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingLogo ? 'Uploading...' : 'Upload New Logo'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleChange('logo_url', '/uploads/basaveshwara_logo.jpg')}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition"
                  >
                    Reset to Default Logo
                  </button>
                </div>
              </div>

              {/* Brand Title & Taglines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Brand Name in Header *</label>
                  <input
                    type="text"
                    required
                    placeholder="Basaveshwara Dabha"
                    value={formData.restaurant_name || ''}
                    onChange={(e) => handleChange('restaurant_name', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Header Subtitle / Tagline</label>
                  <input
                    type="text"
                    placeholder="Authentic Pure Vegetarian Flavours"
                    value={formData.header_tagline || formData.tagline || ''}
                    onChange={(e) => {
                      handleChange('header_tagline', e.target.value);
                      handleChange('tagline', e.target.value);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pure Veg Badge Tooltip</label>
                  <input
                    type="text"
                    placeholder="100% Pure Veg"
                    value={formData.header_badge_text || '100% Pure Veg'}
                    onChange={(e) => handleChange('header_badge_text', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Custom Logo Path or URL</label>
                  <input
                    type="text"
                    placeholder="/uploads/basaveshwara_logo.jpg or https://..."
                    value={formData.logo_url || ''}
                    onChange={(e) => handleChange('logo_url', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Top Announcement Bar Customization */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Top Announcement Ribbon</h4>
                    <p className="text-slate-500 text-[11px]">Micro bar displayed at the very top of the customer website</p>
                  </div>
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.header_show_announcement ?? true}
                      onChange={(e) => handleChange('header_show_announcement', e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded"
                    />
                    Display Top Bar
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Primary Banner Text (e.g. Pure Veg Guarantee)</label>
                    <input
                      type="text"
                      placeholder="100% Pure Vegetarian Kitchen • Authentic Desi Ghee Flavours"
                      value={formData.header_top_announcement || ''}
                      onChange={(e) => handleChange('header_top_announcement', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Secondary Offer Notice (e.g. Coupon Code)</label>
                    <input
                      type="text"
                      placeholder="Special 50% discount on first order! Code: WELCOME50"
                      value={formData.header_notice || ''}
                      onChange={(e) => handleChange('header_notice', e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Additional visibility toggles */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.header_show_timings ?? true}
                      onChange={(e) => handleChange('header_show_timings', e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded"
                    />
                    Show Restaurant Timings in Top Bar
                  </label>

                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.header_show_phone ?? true}
                      onChange={(e) => handleChange('header_show_phone', e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded"
                    />
                    Show Phone Number in Top Bar
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: GENERAL & OPERATIONS ===================== */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Operational Status Box */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">Online Ordering Control</h3>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Accept Online Orders</h4>
                  <p className="text-xs text-slate-500">
                    Turn OFF during rush hours or holidays to pause incoming customer orders.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('is_accepting_orders', !formData.is_accepting_orders)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
                    formData.is_accepting_orders
                      ? 'bg-green-600 text-white shadow-md shadow-green-600/30'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {formData.is_accepting_orders ? 'OPEN FOR ORDERS' : 'STORE PAUSED / CLOSED'}
                </button>
              </div>

              {!formData.is_accepting_orders && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Closed Reason / Announcement</label>
                  <input
                    type="text"
                    placeholder="e.g. Closed for kitchen sanitization until 5 PM"
                    value={formData.closed_reason || ''}
                    onChange={(e) => handleChange('closed_reason', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-semibold"
                  />
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">Contact & Location</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Timings and Pricing Rules */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">Pricing, Taxes & Timings</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Opening Time</label>
                  <input
                    type="text"
                    value={formData.opening_time || ''}
                    onChange={(e) => handleChange('opening_time', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Closing Time</label>
                  <input
                    type="text"
                    value={formData.closing_time || ''}
                    onChange={(e) => handleChange('closing_time', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.min_order_value || 99}
                    onChange={(e) => handleChange('min_order_value', Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={formData.delivery_fee || 35}
                    onChange={(e) => handleChange('delivery_fee', Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Free Delivery Above (₹)</label>
                  <input
                    type="number"
                    value={formData.free_delivery_threshold || 499}
                    onChange={(e) => handleChange('free_delivery_threshold', Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">GST Tax Percentage (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.tax_percentage || 5.0}
                    onChange={(e) => handleChange('tax_percentage', Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: REAL UPI GATEWAY & QR ===================== */}
        {activeTab === 'upi' && (
          <div className="space-y-6">
            {/* Interactive Live UPI Payment Preview */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  Live Customer UPI Checkout Preview
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  This is the exact payment screen customers see when selecting "Pay using UPI"
                </span>
              </div>

              {/* Mock Customer UPI Modal Box */}
              <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-md mx-auto shadow-2xl border border-slate-200 text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 rounded-full text-[11px] font-bold text-amber-900">
                  <QrCode className="w-3.5 h-3.5 text-orange-600" />
                  Scan QR with GPay / PhonePe / Paytm / BHIM
                </div>

                <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-200 inline-block">
                  <img
                    src={
                      formData.upi_qr_image_url
                        ? (formData.upi_qr_image_url.startsWith('http')
                            ? formData.upi_qr_image_url
                            : `http://localhost:8000${formData.upi_qr_image_url}`)
                        : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(
                            `upi://pay?pa=${formData.upi_id || 'basaveshwaradabha@okaxis'}&pn=${encodeURIComponent(formData.upi_payee_name || 'Basaveshwara Dabha')}&am=250.00&tn=Order%20Demo&cu=INR`
                          )}`
                    }
                    alt="UPI QR Code Preview"
                    className="w-44 h-44 object-contain rounded-lg mx-auto"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Live Interactive QR (Sample ₹250.00)</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Merchant UPI ID (VPA)</span>
                      <span className="font-mono text-xs font-black text-slate-800">{formData.upi_id || 'basaveshwaradabha@okaxis'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(formData.upi_id || 'basaveshwaradabha@okaxis');
                        setCopiedUpi(true);
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                    >
                      {copiedUpi ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 font-semibold">
                    Payee: <strong className="text-slate-800">{formData.upi_payee_name || 'Basaveshwara Dabha'}</strong>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Payments automatically mark order as ACCEPTED in Kitchen!
                </div>
              </div>
            </div>

            {/* UPI Settings Form Controls */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">UPI Payment Gateway Configuration</h3>
                  <p className="text-slate-500 text-[11px]">Configure your restaurant's bank UPI ID or upload your physical merchant counter QR code</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('is_upi_enabled', formData.is_upi_enabled === false ? true : false)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
                    formData.is_upi_enabled !== false
                      ? 'bg-green-600 text-white shadow-md shadow-green-600/30'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {formData.is_upi_enabled !== false ? 'UPI PAYMENTS ACTIVE' : 'UPI DISABLED'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Restaurant Bank UPI VPA ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. basaveshwaradabha@okaxis or 9876543210@paytm"
                    value={formData.upi_id || ''}
                    onChange={(e) => handleChange('upi_id', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 text-sm focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    All customer payments will be deposited directly to this UPI ID.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Payee Name / Merchant Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Basaveshwara Dabha"
                    value={formData.upi_payee_name || ''}
                    onChange={(e) => handleChange('upi_payee_name', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    The name displayed on customer UPI apps (Google Pay, PhonePe, Paytm).
                  </span>
                </div>
              </div>

              {/* Upload Physical Counter QR Code */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Custom Counter Merchant QR Stand (Optional)</h4>
                    <p className="text-[11px] text-slate-500">
                      Upload your official PhonePe/GooglePay/Paytm table stand QR image if preferred.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl cursor-pointer text-xs transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingQr ? 'Uploading...' : 'Upload QR Image'}</span>
                      <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                    </label>
                    {formData.upi_qr_image_url && (
                      <button
                        type="button"
                        onClick={() => handleChange('upi_qr_image_url', null)}
                        className="px-3 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 font-bold rounded-xl text-xs transition"
                      >
                        Remove Custom QR
                      </button>
                    )}
                  </div>
                </div>

                {formData.upi_qr_image_url && (
                  <div className="flex items-center gap-3 pt-2">
                    <img
                      src={
                        formData.upi_qr_image_url.startsWith('http')
                          ? formData.upi_qr_image_url
                          : `http://localhost:8000${formData.upi_qr_image_url}`
                      }
                      alt="Uploaded QR"
                      className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-white"
                    />
                    <div className="text-[11px] text-slate-600">
                      <p className="font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Custom Merchant QR Active
                      </p>
                      <p className="text-slate-400 truncate max-w-sm">{formData.upi_qr_image_url}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div className="flex justify-end pt-4 sticky bottom-4 z-20">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-brand-600/30 transition active:scale-98 disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Publishing Live...' : 'Save & Publish Live to Customer Website'}
          </button>
        </div>
      </form>
    </div>
  );
};
