import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { defaultSettings } from '../../data/menuData';
import { MapPin, Phone, Clock, Heart, Shield, Lock, Leaf } from 'lucide-react';
import { StaffLoginModal } from './StaffLoginModal';

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  return (
    <footer className="bg-gradient-to-b from-amber-50/80 via-white to-amber-100/60 text-stone-800 border-t border-amber-200/80 pt-12 pb-8 mt-16 font-kannada">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-auto rounded-xl overflow-hidden border border-amber-300 shadow-sm bg-white p-0.5 flex-shrink-0">
              <img
                src="/logo.png"
                alt="Basaveshwara Dabha Logo"
                className="h-full w-auto object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-black text-amber-950 font-kannada">
                ಬಸವೇಶ್ವರ ದಾಬಾ
              </h3>
              <span className="text-xs text-emerald-800 font-extrabold flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>೧೦೦% ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ (Pure Veg)</span>
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-600 max-w-md leading-relaxed">
            ಅಪ್ಪಟ ಉತ್ತರ ಕರ್ನಾಟಕ ಶೈಲಿಯ ಬಿಸಿ ಜೋಳದ ರೊಟ್ಟಿ, ಬದನೆಕಾಯಿ ಎಣ್ಣೆಗಾಯಿ, ಮಡಕೆ ವೆಜ್ ದಮ್ ಬಿರಿಯಾನಿ ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ರುಚಿಗೆ ನಿಮ್ಮ ನೆಚ್ಚಿನ ಸ್ಥಳ.
          </p>

          <div className="pt-1 flex items-center gap-2 text-xs text-emerald-800 font-bold">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>FSSAI ಪ್ರಮಾಣೀಕೃತ ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ ಅಡುಗೆ ಕೋಣೆ • 100% ನೈಸರ್ಗಿಕ ಶುದ್ಧತೆ</span>
          </div>
        </div>

        {/* Timings & Contact */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
            ಸಂಪರ್ಕ & ಸ್ಥಳ
          </h4>

          <div className="space-y-2 text-xs text-stone-700">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{defaultSettings.address_display_kn}</span>
            </p>

            <p className="flex items-center gap-2 font-mono font-bold">
              <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <a href={`tel:${defaultSettings.phone_primary}`} className="hover:text-amber-800">
                {defaultSettings.phone_primary}
              </a>
            </p>

            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{defaultSettings.open_time} - {defaultSettings.close_time} (ಪ್ರತಿದಿನ)</span>
            </p>
          </div>
        </div>

        {/* Customer Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
            ವಿಭಾಗಗಳು
          </h4>

          <ul className="space-y-1.5 text-xs text-stone-700">
            <li>
              <a href="#menu-section" className="hover:text-amber-800 transition-colors">
                ಜೋಳದ ರೊಟ್ಟಿ ಊಟ & ಥಾಲಿ
              </a>
            </li>
            <li>
              <a href="#menu-section" className="hover:text-amber-800 transition-colors">
                ಬಿಸಿ ಜೋಳದ ರೊಟ್ಟಿ
              </a>
            </li>
            <li>
              <a href="#menu-section" className="hover:text-amber-800 transition-colors">
                ಮಡಕೆ ವೆಜ್ ದಮ್ ಬಿರಿಯಾನಿ
              </a>
            </li>
            <li>
              <a href="#menu-section" className="hover:text-amber-800 transition-colors">
                ಶೇಂಗಾ ಹೋಳಿಗೆ & ಧಾರವಾಡ್ ಪೇಡಾ
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar with Copyright & Protected Staff Login */}
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-4 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-600 gap-3">
        <p>© {new Date().getFullYear()} ಬಸವೇಶ್ವರ ದಾಬಾ (Basaveshwara Dabha). ಸರ್ವ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.</p>

        <div className="flex items-center gap-4">
          <p className="flex items-center gap-1 text-[11px]">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for authentic Karnataka food lovers
          </p>

          {/* Discreet Staff Login Link */}
          <button
            onClick={() => setIsStaffModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-200/60 hover:bg-amber-300 text-amber-950 font-bold text-[11px] transition-colors"
          >
            <Lock className="w-3 h-3 text-amber-800" />
            <span>{t.staffLogin}</span>
          </button>
        </div>
      </div>

      {/* Password-protected Staff Login Modal */}
      <StaffLoginModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
      />
    </footer>
  );
};
