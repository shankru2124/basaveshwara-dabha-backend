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

interface InstallAppButtonProps {
  className?: string;
  variant?: 'pill' | 'banner';
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  className = '',
  variant = 'pill'
}) => {
  const [isStandalone, setIsStandalone] = useState<boolean>(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in installed app standalone mode
    const standalone = isStandaloneMode();
    setIsStandalone(standalone);

    if (standalone) return;

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for appinstalled event
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

  // CRITICAL REQUIREMENT: If opened inside the installed app, DO NOT show the button!
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
      // If browser doesn't support beforeinstallprompt (e.g. iOS Safari)
      setShowInstructions(true);
    }
  };

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (variant === 'banner') {
    if (isDismissed) return null;

    return (
      <>
        <div className="bg-gradient-to-r from-orange-600 via-brand-600 to-amber-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-extrabold tracking-tight">Install Basaveshwara Dabha App</p>
              <p className="text-[11px] text-orange-100 hidden sm:block">
                Get faster food ordering and instant order tracking directly on your home screen!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 bg-white text-brand-700 hover:bg-orange-50 font-black rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 hover:bg-white/20 rounded-lg text-white/80 transition"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Instructions Modal for iOS / unsupported browsers */}
        {showInstructions && (
          <InstructionsModal
            isIOS={isIOS}
            onClose={() => setShowInstructions(false)}
          />
        )}
      </>
    );
  }

  // Default 'pill' variant for Navbar / Header
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white shadow-sm shadow-brand-500/25 transition active:scale-95 shrink-0 ${className}`}
        title="Install Basaveshwara Dabha App on your device"
      >
        <Download className="w-3.5 h-3.5 text-white" />
        <span>Install App</span>
      </button>

      {showInstructions && (
        <InstructionsModal
          isIOS={isIOS}
          onClose={() => setShowInstructions(false)}
        />
      )}
    </>
  );
};

interface InstructionsModalProps {
  isIOS: boolean;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ isIOS, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
          <Smartphone className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-gray-900">
          Install Basaveshwara App
        </h3>

        {isIOS ? (
          <div className="text-xs text-gray-600 space-y-3 text-left bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="flex items-center gap-2 font-bold text-gray-800">
              <Share2 className="w-4 h-4 text-brand-600 shrink-0" />
              1. Tap the Share button at the bottom of Safari
            </p>
            <p className="flex items-center gap-2 font-bold text-gray-800">
              <PlusSquare className="w-4 h-4 text-brand-600 shrink-0" />
              2. Scroll down & select "Add to Home Screen"
            </p>
            <p className="flex items-center gap-2 font-bold text-gray-800">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              3. Tap "Add" in top-right corner to finish!
            </p>
          </div>
        ) : (
          <div className="text-xs text-gray-600 space-y-3 text-left bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="font-bold text-gray-800">
              1. Tap the three dots (⋮) menu in your browser
            </p>
            <p className="font-bold text-gray-800">
              2. Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>
            </p>
            <p className="font-bold text-gray-800">
              3. Tap <strong>"Install"</strong> to add the app icon to your phone!
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs rounded-xl shadow-md transition"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
