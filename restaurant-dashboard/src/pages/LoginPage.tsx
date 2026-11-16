import React, { useState, useEffect } from 'react';
import { Lock, User as UserIcon, ShieldAlert, ArrowRight, Server, Check, RefreshCw, Sparkles, Laptop, Cloud, Settings2 } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { getApiBaseUrl, setCustomApiUrl, resetToLocalhost, resetToCloud, pingBackendServer, autoDetectFastestBackend } from '../services/api';

export const LoginPage: React.FC = () => {
  const { login } = useAdminAuth();
  const [identifier, setIdentifier] = useState('basaveshwara-admin');
  const [password, setPassword] = useState('shankar123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Login to Dashboard');

  // Server connection state
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [showConfig, setShowConfig] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [connectionLabel, setConnectionLabel] = useState('Direct Connection');

  // Auto-probe fastest server on startup with ZERO delay
  useEffect(() => {
    let isMounted = true;
    const autoConnect = async () => {
      try {
        const fastest = await autoDetectFastestBackend();
        if (isMounted) {
          setApiUrl(fastest);
          setServerOnline(true);
          if (fastest.includes('localhost') || fastest.includes('127.0.0.1')) {
            setConnectionLabel('Direct Localhost (Zero Delay)');
          } else {
            setConnectionLabel('Cloud Server (Active)');
          }
        }
      } catch {
        if (isMounted) {
          setServerOnline(false);
          setConnectionLabel('Connecting...');
        }
      }
    };
    autoConnect();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setLoadingText('Connecting directly...');

    // Save custom URL if user edited it
    if (apiUrl.trim()) {
      try {
        const clean = setCustomApiUrl(apiUrl.trim());
        setApiUrl(clean);
      } catch (err: any) {
        setError(err.message || 'Invalid server URL format');
        setIsLoading(false);
        return;
      }
    }

    try {
      await login({ email: identifier.trim(), password: password.trim() });
    } catch (err: any) {
      const msg = err.message || 'Invalid administrator credentials';
      setError(msg);
      setServerOnline(false);
    } finally {
      setIsLoading(false);
      setLoadingText('Login to Dashboard');
    }
  };

  const handleSelectLocalhost = async () => {
    const local = resetToLocalhost();
    setApiUrl(local);
    setError('');
    setIsPinging(true);
    const res = await pingBackendServer(local);
    setServerOnline(res.success);
    setConnectionLabel('Direct Localhost (Zero Delay)');
    setIsPinging(false);
  };

  const handleSelectCloud = async () => {
    const cloud = resetToCloud();
    setApiUrl(cloud);
    setError('');
    setIsPinging(true);
    const res = await pingBackendServer(cloud);
    setServerOnline(res.success);
    setConnectionLabel('Cloud Server (Active)');
    setIsPinging(false);
  };

  const handleFillDefaultAdmin = () => {
    setIdentifier('basaveshwara-admin');
    setPassword('shankar123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6">
        {/* Header with authentic logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-xl ring-2 ring-brand-500/40 bg-slate-900 flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="Basaveshwara Dabha"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/logo.png';
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

          {/* Direct Connection Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-950 border border-slate-700 text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                serverOnline === true
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                  : serverOnline === false
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-emerald-400 animate-ping'
              }`}
            />
            <span>{connectionLabel}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-950/80 border border-red-800 rounded-2xl text-xs text-red-200 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-red-300">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 pl-6">
              <button
                type="button"
                onClick={handleSelectLocalhost}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold border border-slate-600 transition text-[10px] flex items-center gap-1"
              >
                <Laptop className="w-3 h-3 text-emerald-400" />
                <span>Switch to Localhost (8000)</span>
              </button>
              <button
                type="button"
                onClick={handleSelectCloud}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold border border-slate-600 transition text-[10px] flex items-center gap-1"
              >
                <Cloud className="w-3 h-3 text-sky-400" />
                <span>Switch to Cloud Server</span>
              </button>
            </div>
          </div>
        )}

        {/* Optional Connection Settings Panel (Hidden by default) */}
        {showConfig && (
          <div className="p-4 bg-slate-900 border border-slate-700 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-brand-400" />
                Backend Connection Target
              </span>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSelectLocalhost}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-500 rounded-xl text-left transition text-xs text-white flex items-center gap-2"
              >
                <Laptop className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-[11px] truncate">Localhost (Instant)</div>
                  <div className="text-[9px] text-slate-400 truncate">http://localhost:8000</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSelectCloud}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-500 rounded-xl text-left transition text-xs text-white flex items-center gap-2"
              >
                <Cloud className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-[11px] truncate">Cloud Server</div>
                  <div className="text-[9px] text-slate-400 truncate">Render Cloud</div>
                </div>
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://basaveshwara-dabha-backend.onrender.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>
        )}

        {/* Clean Direct Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="basaveshwara-admin"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-medium"
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
                placeholder="shankar123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isPinging}
            className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-brand-500/25 transition active:scale-98 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{loadingText}</span>
              </>
            ) : (
              <>
                <span>Login to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials Info */}
        <div className="border-t border-slate-700/80 pt-4 space-y-2.5 text-center">
          <button
            type="button"
            onClick={handleFillDefaultAdmin}
            className="text-xs font-bold text-brand-400 hover:text-brand-300 hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Default: basaveshwara-admin / shankar123</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 mx-auto transition"
          >
            <Settings2 className="w-3 h-3" />
            <span>Connection Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
