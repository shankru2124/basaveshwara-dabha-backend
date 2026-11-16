import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, Share2, PlusSquare } from 'lucide-react';

export const isStandaloneMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

interface InstallAdminAppButtonProps {
  className?: string;
  variant?: 'pill' | 'sidebar';
}

export const InstallAdminAppButton: React.FC<InstallAdminAppButtonProps> = ({
  className = '',
  variant = 'pill'
}) => {
  const [isStandalone, setIsStandalone] = useState<boolean>(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in installed app standalone mode
    const standalone = isStandaloneMode();
    setIsStandalone(standalone);

    if (standalone) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // CRITICAL: When opened inside the installed app, DO NOT show the install button!
  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        setShowInstructions(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (variant === 'sidebar') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md shadow-orange-600/20 transition active:scale-98 ${className}`}
          title="Install Restaurant Admin Dashboard as a Desktop/Mobile App"
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-white" />
            <span>Install Admin App</span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-black uppercase">
            App
          </span>
        </button>

        {showInstructions && (
          <AdminInstructionsModal
            isIOS={isIOS}
            onClose={() => setShowInstructions(false)}
          />
        )}
      </>
    );
  }

  // Header pill variant
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-sm shadow-orange-600/20 transition active:scale-95 shrink-0 ${className}`}
        title="Install Kitchen Admin App on this device"
      >
        <Download className="w-3.5 h-3.5 text-white" />
        <span>Install Admin App</span>
      </button>

      {showInstructions && (
        <AdminInstructionsModal
          isIOS={isIOS}
          onClose={() => setShowInstructions(false)}
        />
      )}
    </>
  );
};

interface AdminInstructionsModalProps {
  isIOS: boolean;
  onClose: () => void;
}

const AdminInstructionsModal: React.FC<AdminInstructionsModalProps> = ({ isIOS, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto border border-orange-500/30">
          <Smartphone className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-lg font-black text-white">
            Install Kitchen Admin App
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Install on your kitchen tablet, desktop, or mobile for 1-click access & uninterrupted loud order alarms!
          </p>
        </div>

        {isIOS ? (
          <div className="text-xs text-slate-300 space-y-2.5 text-left bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
            <p className="flex items-center gap-2 font-semibold">
              <Share2 className="w-4 h-4 text-orange-400 shrink-0" />
              1. Tap the Share icon in Safari browser
            </p>
            <p className="flex items-center gap-2 font-semibold">
              <PlusSquare className="w-4 h-4 text-orange-400 shrink-0" />
              2. Tap "Add to Home Screen"
            </p>
            <p className="flex items-center gap-2 font-semibold text-green-400">
              <Check className="w-4 h-4 shrink-0" />
              3. Tap "Add" to install BD Admin icon!
            </p>
          </div>
        ) : (
          <div className="text-xs text-slate-300 space-y-2 text-left bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
            <p className="font-semibold">
              1. Look for the <strong className="text-white">Install App icon [⬇]</strong> in your browser address bar or tap browser menu (⋮)
            </p>
            <p className="font-semibold">
              2. Select <strong className="text-orange-400">"Install BD Admin"</strong> or <strong className="text-orange-400">"Add to Home Screen"</strong>
            </p>
            <p className="font-semibold text-green-400">
              3. Click Install to place the app on your desktop/home screen!
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-600/30 transition"
        >
          Understood!
        </button>
      </div>
    </div>
  );
};
