import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User as UserIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register(formData);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 mx-auto flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-brand-500/20 mb-3">
            BD
          </div>
          <h3 className="font-extrabold text-2xl text-gray-900">
            {mode === 'login' ? 'Welcome Back!' : 'Create an Account'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Order authentic pure vegetarian food from Basaveshwara Dabha
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === 'login' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === 'register' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Gowda"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-brand-500/25 transition active:scale-98 disabled:opacity-70"
          >
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
