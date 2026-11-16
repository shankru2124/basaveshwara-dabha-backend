import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowRight, Server, Check, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { getApiBaseUrl, setCustomApiUrl } from '../services/api';

export const LoginPage: React.FC = () => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [showConfig, setShowConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      const msg = err.message || 'Invalid administrator credentials';
      setError(msg);
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        setShowConfig(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@basaveshwara.com');
    setPassword('Admin@123');
  };

  const handleSaveApiUrl = () => {
    if (!apiUrl.trim()) return;
    setCustomApiUrl(apiUrl.trim());
    setConfigSaved(true);
    setError('');
    setTimeout(() => {
      setConfigSaved(false);
      setShowConfig(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-xl ring-2 ring-brand-500/30 bg-slate-900">
            <img
              src="/logo.jpg"
              alt="Basaveshwara Dabha"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Restaurant Command Center
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Basaveshwara Dabha Kitchen & Operations Control
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">{error}</span>
              {(error.toLowerCase().includes('fetch') || error.toLowerCase().includes('network')) && (
                <p className="text-[11px] text-red-200 leading-relaxed">
                  Unable to reach backend API at <code className="bg-black/50 px-1 py-0.5 rounded text-[10px] text-amber-300">{getApiBaseUrl()}</code>.
                  Please verify your Render backend URL below.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Server URL Config Panel (Automatically shown on fetch error or when toggled) */}
        {showConfig && (
          <div className="p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl space-y-2.5 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-brand-400" />
                Backend API Server URL
              </span>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://your-backend.onrender.com"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleSaveApiUrl}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition active:scale-95 flex items-center gap-1 shrink-0"
              >
                {configSaved ? <Check className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>{configSaved ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Tip: Paste your Render URL here (e.g. <code>https://basaveshwara-api.onrender.com</code>).
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="admin@basaveshwara.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-brand-500/25 transition active:scale-98 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Verifying...' : 'Login to Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-slate-700/80 pt-4 space-y-2 text-center">
          <button
            type="button"
            onClick={handleFillDemoAdmin}
            className="text-xs font-bold text-brand-400 hover:text-brand-300 hover:underline block mx-auto"
          >
            Fill Demo Admin Credentials (admin@basaveshwara.com)
          </button>

          {!showConfig && (
            <button
              type="button"
              onClick={() => setShowConfig(true)}
              className="text-[11px] text-slate-400 hover:text-slate-300 flex items-center justify-center gap-1 mx-auto"
            >
              <Server className="w-3 h-3" />
              <span>Server: {getApiBaseUrl().replace('/api', '')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
