import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Category, MenuItem } from '../types';
import { FoodCard } from '../components/FoodCard';
import { api } from '../services/api';
import { customerWs } from '../services/websocket';

interface MenuPageProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'popular'>('default');
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMenuItems({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        available_only: availableOnly,
        sort_by: sortBy === 'default' ? undefined : sortBy
      });
      setItems(data);
    } catch (err) {
      console.error('Failed to load menu items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, searchQuery, availableOnly, sortBy]);

  // Real-time synchronization
  useEffect(() => {
    const unsub = customerWs.subscribe((data) => {
      if (
        data.event === 'menu_updated' ||
        data.event === 'food_availability_changed' ||
        data.event === 'category_updated'
      ) {
        fetchItems();
      }
    });
    return () => unsub();
  }, [selectedCategory, searchQuery, availableOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Search bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Our Pure Veg Menu
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Freshly prepared dishes with pure ingredients & authentic spices
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search dosas, thalis, paneer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-brand-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories & Filter Bar */}
      <div className="space-y-3 max-w-full overflow-hidden">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => onSelectCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition shadow-sm ${
              selectedCategory === 'All'
                ? 'bg-brand-600 text-white shadow-brand-500/25'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-300'
            }`}
          >
            All Items
          </button>
          {categories.map((c) => (
            <button
              key={c.id || c.name}
              onClick={() => onSelectCategory(c.name)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition shadow-sm ${
                selectedCategory === c.name
                  ? 'bg-brand-600 text-white shadow-brand-500/25'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-100 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 font-semibold text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
              />
              Available items only
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-bold text-gray-800 focus:outline-none focus:border-brand-500"
            >
              <option value="default">Default / Chef's Pick</option>
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 animate-pulse">
              <div className="aspect-[16/10] bg-gray-200 rounded-xl"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-8 bg-gray-200 rounded-xl mt-4"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center text-gray-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">No food items found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            We couldn't find any dish matching your filter criteria. Try resetting the search or category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectCategory('All');
              setAvailableOnly(false);
            }}
            className="px-5 py-2 bg-brand-50 text-brand-600 font-bold text-xs rounded-xl hover:bg-brand-100 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
