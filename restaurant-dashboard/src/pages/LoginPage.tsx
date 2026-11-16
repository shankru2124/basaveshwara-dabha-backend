import React, { useState, useEffect } from 'react';
import { Lock, User as UserIcon, ShieldAlert, ArrowRight, Server, Check, RefreshCw, AlertCircle, Sparkles, Laptop, Cloud } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { getApiBaseUrl, setCustomApiUrl, resetToLocalhost, resetToCloud, pingBackendServer } from '../services/api';

export const LoginPage: React.FC = () => {
  const { login } = useAdminAuth();
  const [identifier, setIdentifier] = useState('admin@basaveshwara.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Login to Dashboard');

  // Server connection config
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [showConfig, setShowConfig] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string } | null>(null);

  // Quick initial ping check on load
  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      try {
        const res = await pingBackendServer();
        if (isMounted) {
          setServerOnline(res.success);
        }
      } catch {
        if (isMounted) setServerOnline(false);
      }
    };
    checkServer();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setLoadingText('Connecting to server...');

    // Guarantee that whatever is typed in apiUrl is saved before login attempt
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
      if (msg.toLowerCase().includes('connect') || msg.toLowerCase().includes('reach') || msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('render')) {
        setShowConfig(true);
        setServerOnline(false);
      }
    } finally {
      setIsLoading(false);
      setLoadingText('Login to Dashboard');
    }
  };

  const handleTestAndSaveUrl = async () => {
    if (!apiUrl.trim()) return;
    setIsPinging(true);
    setPingResult(null);
    setError('');

    try {
      const cleanUrl = setCustomApiUrl(apiUrl.trim());
      setApiUrl(cleanUrl);

      const result = await pingBackendServer(cleanUrl);
      setPingResult(result);
      setServerOnline(result.success);

      if (result.success) {
        setTimeout(() => {
          setShowConfig(false);
          setPingResult(null);
        }, 2500);
      }
    } catch (err: any) {
      setPingResult({
        success: false,
        message: err.message || 'Invalid URL or server unreachable'
      });
      setServerOnline(false);
    } finally {
      setIsPinging(false);
    }
  };

  const handleSelectLocalhost = async () => {
    const local = resetToLocalhost();
    setApiUrl(local);
    setError('');
    setIsPinging(true);
    const res = await pingBackendServer(local);
    setPingResult(res);
    setServerOnline(res.success);
    setIsPinging(false);
  };

  const handleSelectCloud = async () => {
    const cloud = resetToCloud();
    setApiUrl(cloud);
    setError('');
    setIsPinging(true);
    const res = await pingBackendServer(cloud);
    setPingResult(res);
    setServerOnline(res.success);
    setIsPinging(false);
  };

  const handleFillDemoAdmin = () => {
    setIdentifier('admin@basaveshwara.com');
    setPassword('Admin@123');
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

          {/* Server Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-950 border border-slate-700 text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                serverOnline === true
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                  : serverOnline === false
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            <span>
              {serverOnline === true
                ? 'Server Online'
                : serverOnline === false
                ? 'Server Sleeping or Connecting'
                : 'Checking Server...'}
            </span>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-brand-400 hover:text-brand-300 underline font-semibold ml-1"
            >
              Configure
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-950/80 border border-red-800 rounded-2xl text-xs text-red-200 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-red-300">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            {(error.toLowerCase().includes('reach') || error.toLowerCase().includes('connect') || error.toLowerCase().includes('fetch') || error.toLowerCase().includes('render')) && (
              <div className="text-[11px] text-red-300/90 leading-relaxed pl-6 space-y-2">
                <p>
                  If you are using the cloud server, Render's free tier sleeps and needs ~30-45 seconds to wake up.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
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
                    <span>Switch to Render Cloud</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Server Connection Panel */}
        {showConfig && (
          <div className="p-4 bg-slate-900 border border-slate-700 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-brand-400" />
                Backend Server URL
              </span>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Quick 1-Click Selectors */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSelectCloud}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-500 rounded-xl text-left transition text-xs text-white flex items-center gap-2"
              >
                <Cloud className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-[11px] truncate">Render Cloud</div>
                  <div className="text-[9px] text-slate-400 truncate">basaveshwara-dabha-backend</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSelectLocalhost}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-500 rounded-xl text-left transition text-xs text-white flex items-center gap-2"
              >
                <Laptop className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-[11px] truncate">Localhost</div>
                  <div className="text-[9px] text-slate-400 truncate">http://localhost:8000</div>
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

              <button
                type="button"
                disabled={isPinging}
                onClick={handleTestAndSaveUrl}
                className="w-full py-2 px-3 bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 disabled:opacity-60 text-white font-extrabold rounded-xl text-xs transition active:scale-98 flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20"
              >
                {isPinging ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting & waking up server (please wait)...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Test & Save Server Connection</span>
                  </>
                )}
              </button>
            </div>

            {/* Ping Result Notification */}
            {pingResult && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                  pingResult.success
                    ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
                    : 'bg-amber-950/80 border border-amber-800 text-amber-200'
                }`}
              >
                {pingResult.success ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{pingResult.message}</span>
              </div>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="admin@basaveshwara.com or admin"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
            disabled={isLoading || isPinging}
            className="w-full py-3 bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-brand-500/25 transition active:scale-98 disabled:opacity-70 flex items-center justify-center gap-2"
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

        {/* Quick Help & Credentials */}
        <div className="border-t border-slate-700/80 pt-4 space-y-2.5 text-center">
          <button
            type="button"
            onClick={handleFillDemoAdmin}
            className="text-xs font-bold text-brand-400 hover:text-brand-300 hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Use Default Credentials (admin@basaveshwara.com / Admin@123)</span>
          </button>

          {!showConfig && (
            <button
              type="button"
              onClick={() => setShowConfig(true)}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 mx-auto transition"
            >
              <Server className="w-3 h-3 text-brand-400" />
              <span>Backend: <span className="font-mono text-slate-300">{apiUrl.replace('/api', '')}</span> (Change)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
