import React, { useState } from 'react';
import {
  Plus, Edit, Trash2, CheckCircle2, XCircle, Star, Flame,
  Search, Upload, Image as ImageIcon, Clock
} from 'lucide-react';
import { MenuItem, Category } from '../types';
import { api } from '../services/api';

interface MenuManagementPageProps {
  menuItems: MenuItem[];
  categories: Category[];
  onRefresh: () => void;
}

export const MenuManagementPage: React.FC<MenuManagementPageProps> = ({
  menuItems,
  categories,
  onRefresh
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number>(150);
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [isTodaySpecial, setIsTodaySpecial] = useState(false);
  const [prepTime, setPrepTime] = useState<number>(20);
  const [portionSize, setPortionSize] = useState('Serves 1-2');

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setCategory(categories[0]?.name || 'North Indian');
    setPrice(150);
    setImageUrl('https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80');
    setIsAvailable(true);
    setIsPopular(false);
    setIsTodaySpecial(false);
    setPrepTime(20);
    setPortionSize('Serves 1-2');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setCategory(item.category);
    setPrice(item.price);
    setImageUrl(item.image_url);
    setIsAvailable(item.is_available);
    setIsPopular(item.is_popular);
    setIsTodaySpecial(item.is_today_special);
    setPrepTime(item.preparation_time_minutes || 20);
    setPortionSize(item.portion_size || 'Serves 1-2');
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await api.toggleItemAvailability(item.id, !item.is_available);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle availability');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this dish from the menu?')) return;
    try {
      await api.deleteMenuItem(itemId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete item');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await api.uploadImage(file);
      const fullUrl = `http://localhost:8000${res.url}`;
      setImageUrl(fullUrl);
    } catch (err: any) {
      alert(err.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) return;
    setIsSubmitting(true);

    const payload = {
      name,
      description,
      category,
      price: Number(price),
      image_url: imageUrl,
      is_available: isAvailable,
      is_popular: isPopular,
      is_today_special: isTodaySpecial,
      preparation_time_minutes: Number(prepTime),
      portion_size: portionSize
    };

    try {
      if (editingItem) {
        await api.updateMenuItem(editingItem.id, payload);
      } else {
        await api.createMenuItem(payload);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save menu dish');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = menuItems.filter((i) => {
    const matchCat = selectedCategory === 'All' || i.category === selectedCategory;
    const matchQuery = i.name.toLowerCase().includes(search.toLowerCase()) ||
                       i.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Food Menu Management</h2>
          <p className="text-xs text-slate-500 font-medium">Add, edit prices, photos, and live availability</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-brand-600/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add New Dish
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search dish by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-500"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c.id || c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Dish</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Prep Time</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4">Live Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 border border-veg rounded-sm flex items-center justify-center shrink-0">
                            <span className="w-1 h-1 rounded-full bg-veg"></span>
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{item.description}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                      {item.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-black text-slate-900 text-sm">
                    ₹{item.price}
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-semibold">
                    {item.preparation_time_minutes || 20}m
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {item.is_today_special && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          Special
                        </span>
                      )}
                      {item.is_popular && (
                        <span className="bg-brand-100 text-brand-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition ${
                        item.is_available
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                      title="Click to toggle live customer availability"
                    >
                      {item.is_available ? 'Available' : 'Sold Out'}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                        title="Edit Dish"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">
              {editingItem ? 'Edit Food Dish' : 'Add New Food Dish'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paneer Butter Masala"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Appetizing description of ingredients, spices, and cooking method"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Photo URL & Local Upload */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Food Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prep Time (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    value={prepTime}
                    onChange={(e) => setPrepTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Portion Size</label>
                  <input
                    type="text"
                    placeholder="Serves 1-2"
                    value={portionSize}
                    onChange={(e) => setPortionSize(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Badges toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  Available for Ordering
                </label>
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTodaySpecial}
                    onChange={(e) => setIsTodaySpecial(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  Today's Chef Special
                </label>
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  Popular / Bestseller
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
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
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition"
                >
                  {isSubmitting ? 'Saving...' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
