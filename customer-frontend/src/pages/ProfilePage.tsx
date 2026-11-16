import React, { useState } from 'react';
import { User as UserIcon, Phone, Mail, MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, addAddress } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New address state
  const [newTitle, setNewTitle] = useState('Home');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newPincode, setNewPincode] = useState('560001');
  const [showAddModal, setShowAddModal] = useState(false);

  if (!user) {
    return <div className="py-20 text-center">Please login to manage your profile.</div>;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({ name, phone });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLine.trim()) return;
    try {
      await addAddress({
        title: newTitle,
        address_line: newAddressLine,
        landmark: newLandmark || undefined,
        city: newCity,
        pincode: newPincode
      });
      setShowAddModal(false);
      setNewAddressLine('');
      setNewLandmark('');
    } catch (err: any) {
      alert(err.message || 'Failed to add address');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Customer Profile</h1>

      {/* Account Info Form */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-gray-900">{user.name}</h2>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Saved Delivery Addresses */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">Saved Addresses</h3>
            <p className="text-xs text-gray-500">Quickly select addresses during checkout</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 font-bold text-xs rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Address
          </button>
        </div>

        {user.addresses && user.addresses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {user.addresses.map((a, idx) => (
              <div key={a.id || idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1">
                <span className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 inline-block">
                  {a.title}
                </span>
                <p className="text-gray-800 font-medium pt-1">{a.address_line}</p>
                {a.landmark && <p className="text-gray-500">Landmark: {a.landmark}</p>}
                <p className="text-gray-500">{a.city} - {a.pincode}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic py-2">No saved addresses yet. Click "Add New Address" above.</p>
        )}
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-gray-900">Add New Address</h3>
            <form onSubmit={handleAddAddressSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Address Label</label>
                <div className="flex gap-2">
                  {['Home', 'Work', 'Other'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewTitle(t)}
                      className={`px-3 py-1.5 rounded-lg border font-bold transition ${
                        newTitle === t ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">House / Flat / Street Address *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. #42, Sai Villa, 2nd Main Road"
                  value={newAddressLine}
                  onChange={(e) => setNewAddressLine(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Landmark</label>
                  <input
                    type="text"
                    placeholder="Near BDA Complex"
                    value={newLandmark}
                    onChange={(e) => setNewLandmark(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="560001"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
