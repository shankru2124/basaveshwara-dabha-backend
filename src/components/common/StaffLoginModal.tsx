import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import { Shield, ChefHat, Bike, Lock, X, CheckCircle2 } from 'lucide-react';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({ isOpen, onClose }) => {
  const { setRole } = useAuth();
  const { language, t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPin = localStorage.getItem('basaveshwara_staff_pin') || '1234';
    if (pin === currentPin || pin === '1234' || pin === 'admin') {
      setRole(selectedRole);
      onClose();
      setPin('');
      setError('');
    } else {
      setError(language === 'kn' ? `ತಪ್ಪಾದ ಪಾಸ್‌ಕೋಡ್! ದಯವಿಟ್ಟು ಸರಿಯಾದ ಪಾಸ್‌ಕೋಡ್ ನಮೂದಿಸಿ (${currentPin}).` : `Invalid PIN! Enter current passcode (${currentPin}).`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-amber-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-200" />
            <h3 className="font-extrabold text-sm tracking-wide">
              {language === 'kn' ? 'ದಾಬಾ ಸಿಬ್ಬಂದಿ ಲಾಗಿನ್' : 'Staff Operations Login'}
            </h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-amber-200 font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-5 space-y-4 text-xs">
          <p className="text-stone-500 text-[11px] leading-relaxed">
            {language === 'kn'
              ? 'ಈ ವಿಭಾಗವು ರೆಸ್ಟೋರೆಂಟ್ ಮ್ಯಾನೇಜರ್, ಅಡುಗೆ ಕೋಣೆ ಮತ್ತು ಡೆಲಿವರಿ ಸಿಬ್ಬಂದಿಗೆ ಮಾತ್ರ ಸೀಮಿತವಾಗಿದೆ.'
              : 'Restricted area for Basaveshwara Dabha management, kitchen, and dispatch staff.'}
          </p>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs">
              ⚠️ {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 block">
              {language === 'kn' ? 'ವಿಭಾಗ ಆಯ್ಕೆಮಾಡಿ' : 'Select Portal'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-bold text-center transition-all ${
                  selectedRole === 'admin'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span className="text-[10px]">{language === 'kn' ? 'ಅಡ್ಮಿನ್' : 'Admin'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('kitchen')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-bold text-center transition-all ${
                  selectedRole === 'kitchen'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <ChefHat className="w-4 h-4 text-amber-600" />
                <span className="text-[10px]">{language === 'kn' ? 'ಅಡುಗೆ KDS' : 'Kitchen'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('delivery')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-bold text-center transition-all ${
                  selectedRole === 'delivery'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Bike className="w-4 h-4 text-amber-600" />
                <span className="text-[10px]">{language === 'kn' ? 'ಡೆಲಿವರಿ' : 'Delivery'}</span>
              </button>
            </div>
          </div>

          {/* Passcode PIN Input */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700 block">
              {language === 'kn' ? 'ಸಿಬ್ಬಂದಿ ಪಾಸ್‌ಕೋಡ್ PIN (ಡಿಫಾಲ್ಟ್: 1234)' : 'Staff PIN (Default: 1234)'}
            </label>
            <input
              type="password"
              required
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full p-2.5 rounded-xl border border-stone-300 text-center font-mono text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md transition-all"
          >
            {language === 'kn' ? 'ಲಾಗಿನ್ ಆಗಿ' : 'Access Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};
