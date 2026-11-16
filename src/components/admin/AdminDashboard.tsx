import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { defaultSettings, initialProducts } from '../../data/menuData';
import { Product, ProductVariant, Offer } from '../../types';
import { formatPrice, formatDateTime } from '../../utils/formatters';
import { exportOrdersToCSV } from '../../utils/csvExport';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  Volume2,
  BellRing,
  Utensils,
  Plus,
  Sliders,
  Phone,
  Check,
  Tag,
  Edit,
  Trash2,
  Image as ImageIcon,
  Upload,
  ToggleLeft,
  ToggleRight,
  Leaf,
  Layers,
  UserCheck,
  Lock,
  Building2,
  CreditCard,
  Key,
  Mail,
  MapPin,
  Camera,
  FileCheck2,
} from 'lucide-react';

export interface AdminProfile {
  name: string;
  name_kn: string;
  role_title: string;
  role_title_kn: string;
  email: string;
  phone_primary: string;
  phone_secondary: string;
  restaurant_name: string;
  restaurant_name_kn: string;
  fssai_license: string;
  gstin: string;
  avatar_url: string;
  staff_pin: string;
  address: string;
  address_kn: string;
  upi_id: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
}

const defaultAdminProfile: AdminProfile = {
  name: 'Basavaraj S. Gowda',
  name_kn: 'ಬಸವರಾಜ್ ಎಸ್. ಗೌಡ',
  role_title: 'General Manager & Restaurant Owner',
  role_title_kn: 'ಮುಖ್ಯ ವ್ಯವಸ್ಥಾಪಕರು & ಮಾಲೀಕರು',
  email: 'manager@basaveshwaradabha.com',
  phone_primary: '+91 98450 12345',
  phone_secondary: '+91 98450 67890',
  restaurant_name: 'Basaveshwara Dabha (100% Pure Veg)',
  restaurant_name_kn: 'ಬಸವೇಶ್ವರ ದಾಬಾ (೧೦೦% ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ)',
  fssai_license: '11223344000123',
  gstin: '29AAAAA0000A1Z5',
  avatar_url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=400&q=80',
  staff_pin: '1234',
  address: 'Near Basaveshwara Circle, Highway Bypass, Hubballi, Karnataka 580024',
  address_kn: 'ಬಸವೇಶ್ವರ ವೃತ್ತದ ಬಳಿ, ಹೈವೇ ಬೈಪಾಸ್, ಹುಬ್ಬಳ್ಳಿ, ಕರ್ನಾಟಕ ೫೮೦೦೨೪',
  upi_id: 'basaveshwaradabha@okaxis',
  bank_name: 'State Bank of India (Hubballi Branch)',
  account_number: '39485720194',
  ifsc_code: 'SBIN0001234',
};

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    acknowledgeAllOrders,
    updateOrderStatus,
    assignDeliveryPartner,
    deliveryPartners,
    hasUnacknowledgedOrders,
    testAlarmSound,
  } = useOrders();

  const { language, t } = useLanguage();
  const { offers, setOffers } = useCart();

  // Tab navigation inside Admin: 'orders' | 'menu' | 'offers' | 'profile' | 'settings'
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'offers' | 'profile' | 'settings'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  const {
    products: productsList,
    updateProduct,
    addProduct,
    deleteProduct,
    toggleProductAvailability,
  } = useProducts();

  // Settings State
  const [settings, setSettings] = useState(defaultSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- ADMIN PROFILE STATE ---
  const [profile, setProfile] = useState<AdminProfile>(() => {
    try {
      const saved = localStorage.getItem('basaveshwara_admin_profile');
      if (saved) return JSON.parse(saved);
      const savedPin = localStorage.getItem('basaveshwara_staff_pin');
      return savedPin ? { ...defaultAdminProfile, staff_pin: savedPin } : defaultAdminProfile;
    } catch {
      return defaultAdminProfile;
    }
  });

  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Handle Admin Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('basaveshwara_admin_profile', JSON.stringify(profile));
      localStorage.setItem('basaveshwara_staff_pin', profile.staff_pin || '1234');
      setProfileSuccessMsg(
        language === 'kn'
          ? 'ಅಡ್ಮಿನ್ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಪಾಸ್‌ಕೋಡ್ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಡೇಟ್ ಆಗಿದೆ!'
          : 'Admin profile and security credentials updated successfully!'
      );
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      console.warn('Could not save profile', err);
    }
  };

  // Handle Profile Avatar File Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfile((prev) => ({ ...prev, avatar_url: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- DISH EDIT / UPDATE MODAL STATE ---
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editNameEn, setEditNameEn] = useState('');
  const [editNameKn, setEditNameKn] = useState('');
  const [editDescEn, setEditDescEn] = useState('');
  const [editDescKn, setEditDescKn] = useState('');
  const [editCategory, setEditCategory] = useState('cat-curries');
  const [editBasePrice, setEditBasePrice] = useState(150);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editSpiceLevel, setEditSpiceLevel] = useState<1 | 2 | 3>(2);
  const [editPrepTime, setEditPrepTime] = useState(15);
  const [editVariants, setEditVariants] = useState<ProductVariant[]>([]);

  // New Variant inputs inside modal
  const [newVarNameEn, setNewVarNameEn] = useState('');
  const [newVarNameKn, setNewVarNameKn] = useState('');
  const [newVarPrice, setNewVarPrice] = useState(180);

  // --- NEW OFFER MODAL STATE ---
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [newOfferCode, setNewOfferCode] = useState('');
  const [newOfferTitleEn, setNewOfferTitleEn] = useState('');
  const [newOfferTitleKn, setNewOfferTitleKn] = useState('');
  const [newOfferDescEn, setNewOfferDescEn] = useState('');
  const [newOfferType, setNewOfferType] = useState<'flat' | 'percentage'>('flat');
  const [newOfferValue, setNewOfferValue] = useState(50);
  const [newOfferMinOrder, setNewOfferMinOrder] = useState(299);
  const [newOfferMaxDiscount, setNewOfferMaxDiscount] = useState<number | undefined>(100);

  // Stats Calculations
  const todayRevenue = orders
    .filter((o) => !['cancelled', 'rejected'].includes(o.status))
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const completedCount = orders.filter((o) => o.status === 'delivered').length;
  const totalOrdersCount = orders.length;

  // Filtered Orders List
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'pending') return order.status === 'pending';
    if (orderFilter === 'active') return ['accepted', 'preparing', 'ready', 'picked_up', 'out_for_delivery'].includes(order.status);
    if (orderFilter === 'completed') return ['delivered', 'cancelled', 'rejected'].includes(order.status);
    return true;
  });

  // Open Dish Edit Modal
  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setEditNameEn(prod.name_en);
    setEditNameKn(prod.name_kn);
    setEditDescEn(prod.description_en);
    setEditDescKn(prod.description_kn);
    setEditCategory(prod.category_id);
    setEditBasePrice(prod.base_price);
    setEditImageUrl(prod.image_url);
    setEditSpiceLevel(prod.spice_level);
    setEditPrepTime(prod.preparation_time_minutes);
    setEditVariants([...prod.variants]);
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Variant to Edited Dish
  const handleAddVariant = () => {
    if (!newVarNameEn.trim() || !editingProduct) return;
    const newV: ProductVariant = {
      id: `var-${Date.now()}`,
      product_id: editingProduct.id,
      name_en: newVarNameEn.trim(),
      name_kn: newVarNameKn.trim() || newVarNameEn.trim(),
      price: Number(newVarPrice),
    };
    setEditVariants((prev) => [...prev, newV]);
    setNewVarNameEn('');
    setNewVarNameKn('');
    setNewVarPrice(180);
  };

  // Remove Variant
  const handleRemoveVariant = (varId: string) => {
    setEditVariants((prev) => prev.filter((v) => v.id !== varId));
  };

  // Save Dish Updates
  const handleSaveProductUpdates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updated: Product = {
      ...editingProduct,
      name_en: editNameEn,
      name_kn: editNameKn,
      description_en: editDescEn,
      description_kn: editDescKn,
      category_id: editCategory,
      base_price: Number(editBasePrice),
      image_url: editImageUrl,
      spice_level: editSpiceLevel,
      preparation_time_minutes: Number(editPrepTime),
      is_veg: true, // 100% Pure Veg
      variants: editVariants.length > 0 ? editVariants : [
        {
          id: `var-${editingProduct.id}-std`,
          product_id: editingProduct.id,
          name_en: 'Standard Portion',
          name_kn: 'ಸಾಧಾರಣ ಪ್ರಮಾಣ',
          price: Number(editBasePrice),
          is_default: true,
        }
      ],
    };

    updateProduct(updated);
    setEditingProduct(null);
  };

  // Toggle In-Stock / Out-of-Stock
  const handleToggleProductAvailability = (productId: string) => {
    toggleProductAvailability(productId);
  };

  // Delete Dish
  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to remove this dish from the active menu?')) {
      deleteProduct(productId);
    }
  };

  // Toggle Offer Active State
  const handleToggleOffer = (offerId: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, is_active: !o.is_active } : o))
    );
  };

  // Create New Offer
  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferCode.trim()) return;

    const offer: Offer = {
      id: `off-${Date.now()}`,
      code: newOfferCode.trim().toUpperCase(),
      title_en: newOfferTitleEn || `Special ${newOfferCode}`,
      title_kn: newOfferTitleKn || `ಸ್ಪೆಷಲ್ ${newOfferCode}`,
      description_en: newOfferDescEn || `Save with code ${newOfferCode}`,
      description_kn: `ಕೂಪನ್ ಬಳಸಿ ರಿಯಾಯಿತಿ ಪಡೆಯಿರಿ`,
      discount_type: newOfferType,
      discount_value: Number(newOfferValue),
      min_order_amount: Number(newOfferMinOrder),
      max_discount_amount: newOfferType === 'percentage' ? Number(newOfferMaxDiscount) : undefined,
      is_active: true,
    };

    setOffers((prev) => [offer, ...prev]);
    setIsOfferModalOpen(false);
    setNewOfferCode('');
    setNewOfferTitleEn('');
    setNewOfferTitleKn('');
  };

  // Delete Offer
  const handleDeleteOffer = (offerId: string) => {
    if (confirm('Delete this coupon offer?')) {
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
    }
  };

  // Presets of authentic food photos for quick selection
  const photoPresets = [
    { label: 'Jolada Rotti Oota', url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80' },
    { label: 'Jolada Rotti Fresh', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80' },
    { label: 'Badanekayi Yennegai', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80' },
    { label: 'Veg Dum Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
    { label: 'Paneer Butter Masala', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80' },
    { label: 'Shahi Kaju Masala', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80' },
    { label: 'Girmit & Mirchi Bajji', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
    { label: 'Shenga Holige', url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Top Banner with Manager Profile Summary Badge & KPI Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-[#2A1810] via-[#381F13] to-[#2A1810] text-[#FDFAF5] p-6 rounded-3xl shadow-warm-lg border border-[#4E2E1B]">
        {/* Restaurant & Profile Headline */}
        <div className="flex items-center gap-4">
          {/* Manager Avatar Thumbnail */}
          <div
            onClick={() => setActiveTab('profile')}
            className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md bg-stone-900 cursor-pointer flex-shrink-0 relative group"
            title="Click to edit profile"
          >
            <img
              src={profile.avatar_url}
              alt="Manager Avatar"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Edit className="w-4 h-4 text-amber-300" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5" />
                100% Pure Veg Admin
              </span>
              <span className="text-xs text-[#E9DFCE]/70">Basaveshwara Dabha Hubballi-Dharwad</span>
            </div>

            <div className="flex items-baseline gap-2 mt-0.5">
              <h1 className="text-2xl font-black text-amber-300 font-kannada">
                {language === 'kn' ? profile.name_kn : profile.name}
              </h1>
              <span className="text-xs text-amber-200/80 font-medium">
                ({language === 'kn' ? profile.role_title_kn : profile.role_title})
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Edit Profile, Export CSV & Audio Alarm Control */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Edit Profile Shortcut Button */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                : 'bg-[#3D2314] hover:bg-[#4E2E1B] text-amber-300 border-amber-500/30'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{language === 'kn' ? 'ಪ್ರೊಫೈಲ್ ತಿದ್ದಿ' : 'Edit Profile'}</span>
          </button>

          <button
            onClick={() => exportOrdersToCSV(orders)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.admin.exportCsv}</span>
          </button>

          <button
            onClick={testAlarmSound}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#3D2314] hover:bg-[#4E2E1B] text-amber-300 font-semibold text-xs border border-amber-500/30"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t.admin.testAlarm}</span>
          </button>

          {hasUnacknowledgedOrders && (
            <button
              onClick={acknowledgeAllOrders}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg animate-pulse"
            >
              <BellRing className="w-4 h-4" />
              <span>{t.admin.silenceAlarm}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-warm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t.admin.todayRevenue}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900 mt-2 font-mono">
            {formatPrice(todayRevenue)}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">100% Pure Veg Orders</span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-warm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t.admin.todayOrders}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900 mt-2 font-mono">
            {totalOrdersCount}
          </p>
          <span className="text-[11px] text-stone-500 font-medium">Orders logged</span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-warm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t.admin.pendingAlert}
            </span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-600 mt-2 font-mono">
            {pendingCount}
          </p>
          <span className="text-[11px] text-red-700 font-bold">Action Needed</span>
        </div>

        {/* Completed Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-warm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Delivered & Picked Up
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-stone-900 mt-2 font-mono">
            {completedCount}
          </p>
          <span className="text-[11px] text-blue-700 font-semibold">Fulfilled today</span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'orders'
              ? 'bg-[#2A1810] text-amber-400 shadow-sm'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t.admin.liveOrders} ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'menu'
              ? 'bg-[#2A1810] text-amber-400 shadow-sm'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>{t.admin.menuManagement} ({productsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'offers'
              ? 'bg-[#2A1810] text-amber-400 shadow-sm'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{t.admin.offersManagement} ({offers.length})</span>
        </button>

        {/* TAB 4: ADMIN PROFILE EDIT */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'profile'
              ? 'bg-[#2A1810] text-amber-400 shadow-sm'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{language === 'kn' ? 'ಅಡ್ಮಿನ್ ಪ್ರೊಫೈಲ್' : 'Admin Profile'}</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'settings'
              ? 'bg-[#2A1810] text-amber-400 shadow-sm'
              : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t.admin.settings}</span>
        </button>
      </div>

      {/* TAB 1: LIVE ORDERS QUEUE */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {(['all', 'pending', 'active', 'completed'] as const).map((fil) => (
              <button
                key={fil}
                onClick={() => setOrderFilter(fil)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  orderFilter === fil
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                {fil}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-warm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#2A1810] text-amber-300 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items & Notes</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Type & Pay</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-500 font-medium">
                        No orders in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const isUnack = order.status === 'pending' && !order.acknowledged_by_admin;

                      return (
                        <tr
                          key={order.id}
                          className={`transition-colors ${
                            isUnack ? 'bg-red-50 hover:bg-red-100/70 font-semibold' : 'hover:bg-stone-50'
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-stone-900">
                            <span className="flex items-center gap-1.5">
                              {isUnack && <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />}
                              {order.order_number}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                            {formatDateTime(order.created_at)}
                          </td>

                          <td className="py-3 px-4">
                            <p className="font-bold text-stone-900">{order.customer_name}</p>
                            <a
                              href={`tel:${order.customer_phone}`}
                              className="text-stone-500 hover:text-amber-800 font-mono text-[11px] flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              {order.customer_phone}
                            </a>
                            {order.delivery_address && (
                              <p className="text-[10px] text-stone-400 line-clamp-1 max-w-xs">
                                📍 {order.delivery_address.address_line1}, {order.delivery_address.landmark}
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="space-y-0.5 max-w-xs">
                              {order.items.map((it) => (
                                <p key={it.id} className="text-stone-800 text-[11px]">
                                  <span className="font-bold">{it.quantity}x</span> {it.product_name_en}
                                  {it.variant_name_en && (
                                    <span className="text-amber-800 ml-1">({it.variant_name_en})</span>
                                  )}
                                </p>
                              ))}
                              {order.special_instructions && (
                                <p className="text-[10px] text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded font-mono mt-1">
                                  Chef Note: {order.special_instructions}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 font-black font-mono text-stone-900">
                            {formatPrice(order.total_amount)}
                            {order.discount_amount && order.discount_amount > 0 && (
                              <span className="block text-[10px] text-emerald-700 font-bold">
                                -{formatPrice(order.discount_amount)} ({order.applied_coupon_code})
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold uppercase block w-fit">
                              {order.order_type}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase block mt-1 ${
                                order.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {order.payment_method} ({order.payment_status})
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                order.status === 'pending'
                                  ? 'bg-amber-100 text-amber-900'
                                  : order.status === 'preparing'
                                  ? 'bg-blue-100 text-blue-900'
                                  : order.status === 'ready'
                                  ? 'bg-purple-100 text-purple-900'
                                  : order.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {order.status}
                            </span>

                            {order.assigned_driver && (
                              <p className="text-[10px] text-stone-500 font-semibold mt-1">
                                🛵 {order.assigned_driver.name}
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {order.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => updateOrderStatus(order.id, 'accepted', 'Admin accepted order')}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => updateOrderStatus(order.id, 'rejected', 'Order declined')}
                                    className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-[11px]"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {order.status === 'accepted' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'preparing', 'Kitchen chef cooking')}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]"
                                >
                                  Cook
                                </button>
                              )}

                              {order.status === 'preparing' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'ready', 'Packed and ready')}
                                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px]"
                                >
                                  Ready
                                </button>
                              )}

                              {order.status === 'ready' && order.order_type === 'delivery' && !order.assigned_driver && (
                                <select
                                  onChange={(e) => assignDeliveryPartner(order.id, e.target.value)}
                                  defaultValue=""
                                  className="text-[11px] p-1 rounded-lg border border-stone-300 bg-white"
                                >
                                  <option value="" disabled>Assign Rider</option>
                                  {deliveryPartners.map((dp) => (
                                    <option key={dp.id} value={dp.id}>
                                      {dp.name} ({dp.status})
                                    </option>
                                  ))}
                                </select>
                              )}

                              {order.status === 'ready' && order.order_type === 'pickup' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'delivered', 'Customer picked up at dabha')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                                >
                                  Delivered
                                </button>
                              )}

                              {['picked_up', 'out_for_delivery'].includes(order.status) && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'delivered', 'Delivered at doorstep')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                                >
                                  Mark Delivered
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENU & DISH EDITOR WITH PHOTOS, PRICES & VARIANTS */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-stone-900 text-lg">
                100% Pure Veg Menu Editor (Prices, Photos & Variants)
              </h3>
              <p className="text-xs text-stone-500">
                Click "Edit" on any dish to update its photo, base price, portion variants, or availability.
              </p>
            </div>

            <button
              onClick={() => {
                const newProd: Product = {
                  id: `prod-custom-${Date.now()}`,
                  category_id: 'cat-curries',
                  name_en: 'New Veg Special',
                  name_kn: 'ಹೊಸ ಸಸ್ಯಾಹಾರಿ ಸ್ಪೆಷಲ್',
                  description_en: 'Authentic pure veg dabha specialty.',
                  description_kn: 'ದಾಬಾದ ವಿಶೇಷ ಸಸ್ಯಾಹಾರಿ ತಿಂಡಿ.',
                  base_price: 150,
                  image_url: photoPresets[0].url,
                  is_veg: true,
                  is_available: true,
                  spice_level: 2,
                  preparation_time_minutes: 15,
                  variants: [
                    { id: `var-${Date.now()}`, product_id: `prod-custom-${Date.now()}`, name_en: 'Regular', name_kn: 'ಸಾಧಾರಣ', price: 150, is_default: true }
                  ]
                };
                openEditModal(newProd);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.admin.addNewItem}</span>
            </button>
          </div>

          {/* Dishes Table */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-warm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#2A1810] text-amber-300 uppercase font-bold">
                  <tr>
                    <th className="py-3 px-4">Photo & Dish</th>
                    <th className="py-3 px-4">Kannada Name</th>
                    <th className="py-3 px-4">Base Price</th>
                    <th className="py-3 px-4">Portion Variants</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {productsList.map((prod) => (
                    <tr key={prod.id} className="hover:bg-stone-50">
                      {/* Photo & Name */}
                      <td className="py-3 px-4 font-bold text-stone-900 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                          <img
                            src={prod.image_url}
                            alt={prod.name_en}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="veg-indicator !w-3 !h-3">
                              <span className="veg-indicator-dot !w-1 !h-1" />
                            </span>
                            <span className="font-extrabold text-sm text-stone-900">{prod.name_en}</span>
                          </div>
                          <span className="text-[10px] text-stone-400 block uppercase font-mono">
                            {prod.category_id}
                          </span>
                        </div>
                      </td>

                      {/* Kannada Name */}
                      <td className="py-3 px-4 font-kannada font-bold text-stone-800 text-sm">
                        {prod.name_kn}
                      </td>

                      {/* Base Price */}
                      <td className="py-3 px-4 font-mono font-black text-amber-900 text-sm">
                        {formatPrice(prod.base_price)}
                      </td>

                      {/* Variants & Prices */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {prod.variants.map((v) => (
                            <span
                              key={v.id}
                              className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-semibold text-[11px] border border-stone-200"
                            >
                              {v.name_en}: <strong className="font-mono text-amber-900">{formatPrice(v.price)}</strong>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* In-Stock Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleProductAvailability(prod.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            prod.is_available
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {prod.is_available ? '● In Stock' : '✕ Sold Out'}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit / Price</span>
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete Dish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OFFERS & COUPONS MANAGEMENT */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-stone-900 text-lg">
                Exclusive Offers & Promo Coupons
              </h3>
              <p className="text-xs text-stone-500">
                Create and manage promo codes that customers can apply in their cart.
              </p>
            </div>

            <button
              onClick={() => setIsOfferModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.admin.createOffer}</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-warm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#2A1810] text-amber-300 uppercase font-bold">
                  <tr>
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Min Order</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {offers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-mono font-black text-amber-900 text-sm">
                        <span className="bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                          {offer.code}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-stone-900">{offer.title_en}</p>
                        <p className="text-stone-500 font-kannada text-[11px]">{offer.title_kn}</p>
                      </td>

                      <td className="py-3 px-4 font-bold text-emerald-800">
                        {offer.discount_type === 'flat' ? `Flat ₹${offer.discount_value} OFF` : `${offer.discount_value}% OFF`}
                        {offer.max_discount_amount && (
                          <span className="text-[10px] text-stone-400 block font-normal">
                            Up to ₹{offer.max_discount_amount}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-stone-700">
                        ₹{offer.min_order_amount}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleOffer(offer.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            offer.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {offer.is_active ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-stone-400" />}
                          <span>{offer.is_active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPREHENSIVE ADMIN PROFILE & SECURITY EDITOR */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-stone-900 text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-600" />
                <span>{language === 'kn' ? 'ಅಡ್ಮಿನ್ ಪ್ರೊಫೈಲ್ & ವ್ಯವಸ್ಥಾಪಕರ ವಿವರಗಳು' : 'Admin Profile & Management Credentials'}</span>
              </h3>
              <p className="text-xs text-stone-500">
                Update restaurant owner details, official contact numbers, FSSAI license, staff passcode, and payout settlement info.
              </p>
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'kn' ? 'ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ' : 'Save Profile Updates'}</span>
            </button>
          </div>

          {profileSuccessMsg && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
              <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {/* Section 1: Manager Personal & Photo Details */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-warm space-y-4">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5 border-b border-stone-100 pb-2">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>1. ಮ್ಯಾನೇಜರ್ ವಿವರಗಳು & ಪ್ರೊಫೈಲ್ ಫೋಟೋ (Manager Details & Avatar)</span>
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Avatar Live Preview */}
              <div className="relative group flex-shrink-0">
                <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-amber-500 shadow-md bg-stone-100">
                  <img
                    src={profile.avatar_url}
                    alt="Manager Avatar Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultAdminProfile.avatar_url;
                    }}
                  />
                </div>
                <label className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Avatar URL text input */}
              <div className="flex-1 w-full space-y-2 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Profile Avatar URL (Or Click Camera to Upload File)
                  </label>
                  <input
                    type="url"
                    value={profile.avatar_url}
                    onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-stone-200 font-mono text-xs"
                  />
                </div>
                <p className="text-[11px] text-stone-400">
                  Supports JPG, PNG, WEBP files or cloud image links.
                </p>
              </div>
            </div>

            {/* Names & Designations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Manager Name (English) *</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Manager Name (ಕನ್ನಡ Unicode) *</label>
                <input
                  type="text"
                  required
                  value={profile.name_kn}
                  onChange={(e) => setProfile({ ...profile, name_kn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-kannada font-bold text-amber-950"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Designation / Role Title</label>
                <input
                  type="text"
                  value={profile.role_title}
                  onChange={(e) => setProfile({ ...profile, role_title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">ಹುದ್ದೆ (ಕನ್ನಡ)</label>
                <input
                  type="text"
                  value={profile.role_title_kn}
                  onChange={(e) => setProfile({ ...profile, role_title_kn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-kannada"
                />
              </div>
            </div>

            {/* Email & Phone Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>Official Email *</span>
                </label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>Primary Manager Phone *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={profile.phone_primary}
                  onChange={(e) => setProfile({ ...profile, phone_primary: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>Kitchen Emergency Phone</span>
                </label>
                <input
                  type="tel"
                  value={profile.phone_secondary}
                  onChange={(e) => setProfile({ ...profile, phone_secondary: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Security & Staff Passcode Settings */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-warm space-y-4">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5 border-b border-stone-100 pb-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>2. ಭದ್ರತೆ & ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್ ಪಾಸ್‌ಕೋಡ್ (Security & Staff Passcode PIN)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <label className="font-extrabold text-amber-950 block mb-1 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>Staff Portal Passcode PIN *</span>
                </label>
                <p className="text-[11px] text-amber-800/80 mb-2">
                  Used by managers, chefs, and drivers to log into protected staff portals.
                </p>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={profile.staff_pin}
                  onChange={(e) => setProfile({ ...profile, staff_pin: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-amber-300 bg-white font-mono text-center text-lg font-black tracking-widest text-amber-950 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-center">
                <span className="font-bold text-stone-800 block text-xs mb-1">
                  Protected Portals:
                </span>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Changing this PIN immediately protects the Admin Command Center, Kitchen Display (KDS), and Delivery Dispatch.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Legal, FSSAI & GST Credentials */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-warm space-y-4">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5 border-b border-stone-100 pb-2">
              <FileCheck2 className="w-4 h-4 text-amber-600" />
              <span>3. ಆಹಾರ ಪರವಾನಗಿ & ವ್ಯಾಪಾರ ವಿವರಗಳು (FSSAI & Business License)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Registered Restaurant Name *</label>
                <input
                  type="text"
                  value={profile.restaurant_name}
                  onChange={(e) => setProfile({ ...profile, restaurant_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">ರೆಸ್ಟೋರೆಂಟ್ ಹೆಸರು (ಕನ್ನಡ) *</label>
                <input
                  type="text"
                  value={profile.restaurant_name_kn}
                  onChange={(e) => setProfile({ ...profile, restaurant_name_kn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-kannada font-bold text-amber-950"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">FSSAI License Number *</label>
                <input
                  type="text"
                  value={profile.fssai_license}
                  onChange={(e) => setProfile({ ...profile, fssai_license: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={profile.gstin}
                  onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>Operating Address</span>
              </label>
              <textarea
                rows={2}
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
              />
            </div>
          </div>

          {/* Section 4: Bank & Settlement Accounts */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-warm space-y-4">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5 border-b border-stone-100 pb-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>4. ಪಾವತಿ ಜಮೆ ಖಾತೆ ವಿವರಗಳು (Settlement & Bank Payout Details)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Restaurant Business UPI ID *</label>
                <input
                  type="text"
                  value={profile.upi_id}
                  onChange={(e) => setProfile({ ...profile, upi_id: e.target.value })}
                  placeholder="name@okaxis"
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Bank Name & Branch</label>
                <input
                  type="text"
                  value={profile.bank_name}
                  onChange={(e) => setProfile({ ...profile, bank_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Account Number</label>
                <input
                  type="text"
                  value={profile.account_number}
                  onChange={(e) => setProfile({ ...profile, account_number: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={profile.ifsc_code}
                  onChange={(e) => setProfile({ ...profile, ifsc_code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* Final Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Check className="w-5 h-5" />
              <span>{language === 'kn' ? 'ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿ ಉಳಿಸಿ' : 'Save Profile Updates'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: RESTAURANT SETTINGS */}
      {activeTab === 'settings' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
          }}
          className="bg-white rounded-3xl p-6 border border-stone-200 shadow-warm space-y-4 max-w-2xl"
        >
          <div className="flex items-center gap-2">
            <span className="veg-indicator">
              <span className="veg-indicator-dot" />
            </span>
            <h3 className="font-extrabold text-stone-900 text-lg">
              {t.admin.settings} (100% Pure Veg Dabha)
            </h3>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                {t.admin.openHours}
              </label>
              <input
                type="text"
                value={`${settings.open_time} - ${settings.close_time}`}
                onChange={() => {}}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Restaurant Phone
              </label>
              <input
                type="text"
                value={settings.phone_primary}
                onChange={(e) => setSettings({ ...settings, phone_primary: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-200 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                {t.admin.baseFee}
              </label>
              <input
                type="number"
                value={settings.delivery_fee_base}
                onChange={(e) => setSettings({ ...settings, delivery_fee_base: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-stone-200 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                {t.admin.freeAbove}
              </label>
              <input
                type="number"
                value={settings.free_delivery_above}
                onChange={(e) => setSettings({ ...settings, free_delivery_above: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-stone-200 font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md"
            >
              {t.admin.saveSettings}
            </button>
          </div>
        </form>
      )}

      {/* --- COMPREHENSIVE DISH EDIT MODAL (PHOTO, PRICE & VARIANTS) --- */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#FDFAF5] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-amber-900/20 my-8">
            <div className="bg-[#2A1810] text-[#FDFAF5] px-6 py-4 flex items-center justify-between border-b border-[#4E2E1B]">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-amber-300">
                  Update Dish, Price & Photos
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-stone-300 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProductUpdates} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Photo Upload & Preview Section */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
                <label className="font-extrabold text-stone-800 text-xs block flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>Dish Photo (Upload or Paste URL or Choose Preset)</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Live Photo Preview */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 border-2 border-amber-500 flex-shrink-0 shadow-md">
                    <img
                      src={editImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = photoPresets[0].url;
                      }}
                    />
                  </div>

                  {/* Input & Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <div>
                      <input
                        type="url"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        placeholder="Paste image URL here..."
                        className="w-full p-2 rounded-xl border border-stone-300 font-mono text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 cursor-pointer font-bold text-stone-700">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Custom Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-stone-400">JPG, PNG or WEBP</span>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block mb-1">
                    Quick Photography Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {photoPresets.map((pr) => (
                      <button
                        type="button"
                        key={pr.label}
                        onClick={() => setEditImageUrl(pr.url)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          editImageUrl === pr.url
                            ? 'bg-[#2A1810] text-amber-300 border-amber-500'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200'
                        }`}
                      >
                        {pr.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dish Names (English & Kannada) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Dish Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={editNameEn}
                    onChange={(e) => setEditNameEn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Dish Name (ಕನ್ನಡ Unicode) *</label>
                  <input
                    type="text"
                    required
                    value={editNameKn}
                    onChange={(e) => setEditNameKn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-kannada font-bold"
                  />
                </div>
              </div>

              {/* Category & Base Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editBasePrice}
                    onChange={(e) => setEditBasePrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-mono font-bold text-amber-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="cat-meals">Rotti Meals & Thali</option>
                    <option value="cat-roti">Jolada Rotti & Breads</option>
                    <option value="cat-curries">North Karnataka Palya</option>
                    <option value="cat-paneer">Dabha Paneer & Kaju</option>
                    <option value="cat-biryani">Pure Veg Dum Biryani</option>
                    <option value="cat-snacks">Evening Snacks & Chaats</option>
                    <option value="cat-drinks">Desserts & Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={editPrepTime}
                    onChange={(e) => setEditPrepTime(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Description (English)</label>
                  <textarea
                    rows={2}
                    value={editDescEn}
                    onChange={(e) => setEditDescEn(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Description (ಕನ್ನಡ)</label>
                  <textarea
                    rows={2}
                    value={editDescKn}
                    onChange={(e) => setEditDescKn(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-200 bg-white font-kannada"
                  />
                </div>
              </div>

              {/* Portion Variants Management */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-stone-800 text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Portion Sizes & Custom Prices (Half / Full / Packs)</span>
                  </label>
                  <span className="text-[11px] text-stone-400">
                    {editVariants.length} variants configured
                  </span>
                </div>

                {/* List of current variants */}
                <div className="space-y-2">
                  {editVariants.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200"
                    >
                      <div>
                        <span className="font-bold text-stone-900">{v.name_en}</span>
                        <span className="text-stone-500 font-kannada ml-2">({v.name_kn})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-amber-900">
                          {formatPrice(v.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(v.id)}
                          className="text-stone-400 hover:text-red-600 p-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new variant inputs */}
                <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                  <div>
                    <label className="text-[10px] text-stone-500 font-bold block mb-0.5">Size (EN)</label>
                    <input
                      type="text"
                      placeholder="e.g. Half Portion"
                      value={newVarNameEn}
                      onChange={(e) => setNewVarNameEn(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 font-bold block mb-0.5">Size (KN)</label>
                    <input
                      type="text"
                      placeholder="ಅರ್ಧ ಪ್ಲೇಟ್"
                      value={newVarNameKn}
                      onChange={(e) => setNewVarNameKn(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-stone-300 text-xs font-kannada"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 font-bold block mb-0.5">Price (₹)</label>
                    <input
                      type="number"
                      value={newVarPrice}
                      onChange={(e) => setNewVarPrice(Number(e.target.value))}
                      className="w-full p-1.5 rounded-lg border border-stone-300 font-mono text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="py-1.5 px-3 rounded-lg bg-[#2A1810] text-amber-400 font-bold text-xs"
                  >
                    + Add Variant
                  </button>
                </div>
              </div>

              {/* Submit / Save Button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md"
                >
                  Save Dish Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE NEW OFFER MODAL --- */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#FDFAF5] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-amber-900/20 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-extrabold text-stone-900 text-base">{t.admin.createOffer}</h3>
              <button onClick={() => setIsOfferModalOpen(false)} className="text-stone-500 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER50"
                  value={newOfferCode}
                  onChange={(e) => setNewOfferCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono uppercase font-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Discount Type</label>
                  <select
                    value={newOfferType}
                    onChange={(e) => setNewOfferType(e.target.value as 'flat' | 'percentage')}
                    className="w-full p-2 rounded-xl border border-stone-300"
                  >
                    <option value="flat">Flat ₹ Off</option>
                    <option value="percentage">Percentage % Off</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={newOfferValue}
                    onChange={(e) => setNewOfferValue(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-stone-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={newOfferMinOrder}
                    onChange={(e) => setNewOfferMinOrder(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={newOfferMaxDiscount}
                    onChange={(e) => setNewOfferMaxDiscount(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Title (English)</label>
                <input
                  type="text"
                  value={newOfferTitleEn}
                  onChange={(e) => setNewOfferTitleEn(e.target.value)}
                  placeholder="e.g. Flat ₹50 OFF on Jolada Rotti"
                  className="w-full p-2 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Title (ಕನ್ನಡ)</label>
                <input
                  type="text"
                  value={newOfferTitleKn}
                  onChange={(e) => setNewOfferTitleKn(e.target.value)}
                  placeholder="ಉದಾ: ₹50 ರಿಯಾಯಿತಿ"
                  className="w-full p-2 rounded-xl border border-stone-300 font-kannada"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md"
                >
                  Activate & Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
