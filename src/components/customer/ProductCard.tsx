import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';
import { Clock, Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, t } = useLanguage();
  const { items, addToCart, updateQuantity } = useCart();

  // Selected portion variant (defaults to default variant or first variant)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(() => {
    return product.variants.find((v) => v.is_default) || product.variants[0];
  });

  // Calculate current price based on selected variant
  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;

  // Identify matching cart item ID
  const cartItemId = `${product.id}-${selectedVariant?.id || 'standard'}`;
  const cartItem = items.find((item) => item.id === cartItemId);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    if (!product.is_available) return;
    addToCart(product, selectedVariant);
  };

  return (
    <div
      className={`group flex flex-col justify-between bg-white rounded-3xl overflow-hidden border-2 transition-all duration-300 ${
        product.is_available
          ? 'border-amber-100 hover:border-amber-400 hover:shadow-warm-lg hover:-translate-y-1'
          : 'border-stone-200 opacity-60 bg-stone-50'
      }`}
    >
      {/* Top Image & Badges */}
      <div>
        <div className="relative aspect-[16/10] overflow-hidden bg-amber-50">
          <img
            src={product.image_url}
            alt={product.name_en}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Gradient Overlay for badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* 100% Pure Veg Indicator Badge */}
          <div className="absolute top-3 left-3 bg-white/95 px-2 py-1 rounded-lg shadow-sm flex items-center gap-1.5 border border-emerald-300">
            <div className="veg-indicator">
              <div className="veg-indicator-dot" />
            </div>
            <span className="text-[10px] font-black text-emerald-800 font-kannada">ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ</span>
          </div>

          {/* Bestseller Badge */}
          {product.is_bestseller && (
            <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-[10px] tracking-wider uppercase shadow-md">
              ಸ್ಪೆಷಲ್
            </span>
          )}

          {/* Availability Badge */}
          {!product.is_available && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs uppercase tracking-wider font-kannada">
                {t.soldOut}
              </span>
            </div>
          )}

          {/* Prep time & spice pill */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white font-bold font-kannada">
            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{product.preparation_time_minutes} ನಿಮಿಷ</span>
            </span>
            <span className="flex items-center gap-0.5 bg-black/50 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
              {Array.from({ length: product.spice_level }).map((_, i) => (
                <span key={i} title={t.spicy}>🌶️</span>
              ))}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2.5">
          {/* Dish Names (Kannada Prominent) */}
          <div>
            <h3 className="font-black text-base text-stone-900 group-hover:text-amber-800 transition-colors leading-snug font-kannada">
              {product.name_kn}
            </h3>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {product.name_en}
            </p>
          </div>

          {/* Description */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-kannada font-normal">
            {language === 'kn' ? product.description_kn : product.description_en}
          </p>

          {/* Portion Variants Selector (if more than 1 variant) */}
          {product.variants && product.variants.length > 1 && (
            <div className="pt-1">
              <label className="text-[11px] font-bold text-amber-900 block mb-1 font-kannada">
                {t.portion}:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all font-kannada ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 border border-amber-600 shadow-xs'
                          : 'bg-amber-50/70 text-stone-700 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      <span>{language === 'kn' ? v.name_kn : v.name_en}</span>
                      <span className="ml-1 text-[10px] opacity-90 font-mono">({formatPrice(v.price)})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Price & Add To Cart Button */}
      <div className="p-4 pt-2 border-t border-amber-100 flex items-center justify-between gap-2 mt-auto bg-amber-50/30">
        <div>
          <span className="text-[10px] text-stone-500 block -mb-0.5 font-kannada">{t.portion}</span>
          <span className="text-lg font-black text-amber-900 font-mono">
            {formatPrice(currentPrice)}
          </span>
        </div>

        {/* Action Button: Add or (+ / -) Counter */}
        {quantityInCart === 0 ? (
          <button
            onClick={handleAddToCart}
            disabled={!product.is_available}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all font-kannada ${
              product.is_available
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.addToCart}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-amber-500 text-stone-950 px-2.5 py-1.5 rounded-xl shadow-sm border border-amber-600">
            <button
              onClick={() => updateQuantity(cartItemId, -1)}
              className="p-1 hover:bg-amber-600 rounded text-stone-950 transition-colors"
              title="ಕಡಿಮೆ ಮಾಡಿ"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
            <span className="font-black text-sm px-1 min-w-[16px] text-center font-mono">
              {quantityInCart}
            </span>
            <button
              onClick={() => updateQuantity(cartItemId, 1)}
              className="p-1 hover:bg-amber-600 rounded text-stone-950 transition-colors"
              title="ಹೆಚ್ಚಿಸಿ"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
