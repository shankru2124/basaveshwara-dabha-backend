import React from 'react';
import { Search, Sparkles, Clock, ShieldCheck, ArrowRight, Star, Flame, Utensils } from 'lucide-react';
import { Category, MenuItem, RestaurantSettings } from '../types';
import { FoodCard } from '../components/FoodCard';

interface HomePageProps {
  categories: Category[];
  todaySpecials: MenuItem[];
  popularItems: MenuItem[];
  settings: RestaurantSettings | null;
  onSelectCategory: (cat: string) => void;
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  categories,
  todaySpecials,
  popularItems,
  settings,
  onSelectCategory,
  onNavigate
}) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-900 via-brand-900 to-stone-900 text-white rounded-3xl overflow-hidden mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-2xl">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-5xl mx-auto px-6 sm:px-12 py-16 sm:py-24 text-center space-y-6">
          {/* Pure Veg Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
            <span className="w-2 h-2 rounded-full bg-veg animate-ping"></span>
            100% Pure Vegetarian Restaurant
          </div>

          {/* Authentic Logo Showcase */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-3xl overflow-hidden shadow-2xl ring-4 ring-amber-400/40 bg-black/40 hover:scale-105 transition-transform duration-300">
            <img
              src={settings?.logo_url ? (settings.logo_url.startsWith('http') ? settings.logo_url : (settings.logo_url === '/logo.jpg' ? '/logo.jpg' : `http://localhost:8000${settings.logo_url}`)) : '/logo.jpg'}
              alt="Basaveshwara Dabha"
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Authentic Flavours of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200">
              Basaveshwara Dabha
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-300 leading-relaxed font-medium">
            Relish iconic North Karnataka Jolada Rotti, buttery Davanagere dosas, rich paneer gravies and tandoori breads, cooked fresh with pure desi ghee and time-tested recipes.
          </p>

          {/* Quick CTA */}
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('menu')}
              className="px-8 py-4 bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-brand-500/30 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
            >
              <Utensils className="w-4 h-4" />
              Order Food Online
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('specials-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 backdrop-blur-sm transition"
            >
              Today's Specials
            </button>
          </div>
        </div>
      </section>

      {/* Special Offers Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">New Customers</span>
              <h4 className="font-extrabold text-lg mt-1">50% Flat OFF</h4>
              <p className="text-xs text-orange-100 font-medium">Use coupon <strong>WELCOME50</strong></p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xl">
              50%
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">Dabha Special</span>
              <h4 className="font-extrabold text-lg mt-1">20% Super OFF</h4>
              <p className="text-xs text-emerald-100 font-medium">Use coupon <strong>DABHA20</strong></p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xl">
              20%
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">Party Orders</span>
              <h4 className="font-extrabold text-lg mt-1">₹100 Flat Savings</h4>
              <p className="text-xs text-purple-100 font-medium">Use coupon <strong>FLAT100</strong></p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xl">
              ₹100
            </div>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Food Categories</h2>
            <p className="text-xs text-gray-500 font-medium">Explore by your favourite pure vegetarian cuisines</p>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id || cat.slug}
              onClick={() => {
                onSelectCategory(cat.name);
                onNavigate('menu');
              }}
              className="bg-white rounded-2xl border border-gray-100 p-3 text-center cursor-pointer hover:border-brand-300 hover:shadow-lg transition group flex flex-col items-center justify-center"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden mb-2 bg-gray-100 group-hover:scale-110 transition duration-300">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-xs font-bold text-gray-800 group-hover:text-brand-600 transition line-clamp-1">
                {cat.name}
              </h4>
            </div>
          ))}
        </div>
      </section>

      {/* Today's Special Dishes */}
      <section id="specials-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Today's Chef Specials</h2>
              <p className="text-xs text-gray-500 font-medium">Handcrafted freshly today with special spice blends</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {todaySpecials.slice(0, 4).map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Popular Bestselling Dishes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-700 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Customer Favourites</h2>
              <p className="text-xs text-gray-500 font-medium">Most ordered delicacies by our regular patrons</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularItems.slice(0, 4).map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Quality Guarantees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-veg mx-auto flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-base text-gray-900">100% Pure Vegetarian</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Dedicated pure vegetarian kitchen. Never any meat, poultry, or eggs on premises.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-base text-gray-900">Pure Desi Ghee & Fresh Dairy</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Dosas, dals and biriyanis crafted using fresh malai paneer, fresh curd and genuine desi ghee.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-base text-gray-900">Quick Restaurant Delivery</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Freshly packed in insulated thermal packaging and delivered directly to your doorstep.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
