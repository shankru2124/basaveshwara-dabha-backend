import React from 'react';
import { Plus, Minus, Star, Flame, Clock } from 'lucide-react';
import { MenuItem } from '../types';
import { useCart } from '../context/CartContext';

interface FoodCardProps {
  item: MenuItem;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.id === item.id);
  const qty = cartItem ? cartItem.quantity : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Food Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
          <img
            src={item.image_url}
            alt={item.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              !item.is_available ? 'grayscale opacity-60' : ''
            }`}
            loading="lazy"
          />

          {/* Sold out banner */}
          {!item.is_available && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="px-3.5 py-1.5 bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-lg">
                Sold Out
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {item.is_today_special && (
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                <Star className="w-3 h-3 fill-white" /> Special
              </span>
            )}
            {item.is_popular && (
              <span className="inline-flex items-center gap-1 bg-brand-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                Bestseller
              </span>
            )}
          </div>

          {/* Prep time badge */}
          <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3 text-brand-400" />
            {item.preparation_time_minutes || 20}m
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-gray-900 text-base group-hover:text-brand-600 transition line-clamp-1">
              {item.name}
            </h3>
            {/* Pure Veg Indicator */}
            <span
              className="w-4 h-4 border border-veg flex items-center justify-center rounded-sm bg-white shrink-0 mt-1"
              title="100% Pure Vegetarian"
            >
              <span className="w-2 h-2 rounded-full bg-veg"></span>
            </span>
          </div>

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>

          {/* Category & Portion details */}
          <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium mb-2">
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold">
              {item.category}
            </span>
            {item.portion_size && <span>• {item.portion_size}</span>}
            {item.calories && <span>• {item.calories} kcal</span>}
          </div>
        </div>
      </div>

      {/* Footer Price & Add Button */}
      <div className="p-4 pt-0 border-t border-gray-50 flex items-center justify-between mt-auto">
        <div>
          <span className="text-xs text-gray-400 font-medium">Price</span>
          <p className="text-lg font-extrabold text-gray-900">
            ₹{item.price.toFixed(0)}
          </p>
        </div>

        <div>
          {!item.is_available ? (
            <button
              disabled
              className="px-4 py-2 bg-gray-100 text-gray-400 font-bold text-xs rounded-xl cursor-not-allowed uppercase"
            >
              Unavailable
            </button>
          ) : qty > 0 ? (
            <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-xl px-2 py-1 shadow-sm">
              <button
                onClick={() => updateQuantity(item.id, qty - 1)}
                className="w-6 h-6 rounded-lg bg-white text-brand-700 font-bold flex items-center justify-center hover:bg-brand-600 hover:text-white transition shadow-sm active:scale-90"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-extrabold text-sm text-brand-900 px-1 min-w-[16px] text-center">
                {qty}
              </span>
              <button
                onClick={() => updateQuantity(item.id, qty + 1)}
                className="w-6 h-6 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center hover:bg-brand-700 transition shadow-sm active:scale-90"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem(item, 1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-brand-50 text-brand-600 hover:text-brand-700 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-brand-200 hover:border-brand-300 shadow-sm hover:shadow transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
