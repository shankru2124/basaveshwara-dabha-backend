import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Category } from '../../types';
import { Search, Sparkles, Leaf } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const { language, t } = useLanguage();

  return (
    <div id="menu-section" className="space-y-4 mb-6">
      {/* Search Bar & 100% Pure Veg Emblem (Light Theme) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl shadow-warm border border-amber-200/80">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-amber-700/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-amber-50/40 border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-stone-900 placeholder-stone-500 font-kannada"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 bg-stone-200 rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* 100% Pure Veg Permanent Emblem */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-black shadow-xs font-kannada">
          <div className="veg-indicator">
            <div className="veg-indicator-dot"></div>
          </div>
          <span>{t.pureVegBadge}</span>
          <Leaf className="w-3.5 h-3.5 text-emerald-600" />
        </div>
      </div>

      {/* Category Pills (Horizontal Scroll on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold whitespace-nowrap transition-all shadow-xs font-kannada ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-stone-950 border border-amber-600 shadow-md transform -translate-y-0.5'
              : 'bg-white text-stone-700 hover:bg-amber-50/70 border border-amber-200/70'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-stone-950" />
          <span>{t.categories.all}</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold whitespace-nowrap transition-all shadow-xs font-kannada ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 border border-amber-600 shadow-md transform -translate-y-0.5'
                  : 'bg-white text-stone-700 hover:bg-amber-50/70 border border-amber-200/70'
              }`}
            >
              {language === 'kn' ? cat.name_kn : cat.name_en}
            </button>
          );
        })}
      </div>
    </div>
  );
};
