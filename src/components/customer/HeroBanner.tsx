import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { Sparkles, Clock, Leaf, Tag, ShieldCheck, HeartHandshake, Utensils } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { language, t } = useLanguage();
  const { offers, applyPromoCode } = useCart();

  const activeOffers = offers.filter((o) => o.is_active);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50/70 text-stone-900 shadow-warm-lg border-2 border-amber-200/80 p-5 md:p-8 my-6">
      {/* Background Subtle Golden Sunlight Glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Headline, Brand Badges & Offers */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* 100% PURE VEG BADGE */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider shadow-xs">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.pureVegBadge}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'kn' ? 'ಅಧಿಕೃತ ದಾಬಾ ಕಿಚನ್' : 'Authentic Dabha Kitchen'}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-stone-700 border border-stone-200 text-xs font-semibold shadow-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'kn' ? '೩೦-೪೦ ನಿಮಿಷಗಳಲ್ಲಿ ಡೆಲಿವರಿ' : 'Avg. Delivery: 30-40 mins'}</span>
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl font-black text-amber-950 tracking-tight leading-tight font-kannada">
            ಬಿಸಿಬಿಸಿ <span className="text-amber-600 underline decoration-amber-400">ಜೋಳದ ರೊಟ್ಟಿ</span>, ಘಮಘಮಿಸುವ{' '}
            <span className="text-amber-600 underline decoration-amber-400">ಬದನೆಕಾಯಿ ಎಣ್ಣೆಗಾಯಿ</span> ಮತ್ತು ಮಡಕೆ ವೆಜ್ ದಮ್ ಬಿರಿಯಾನಿ!
          </h2>

          <p className="text-sm md:text-base text-stone-700 max-w-2xl font-normal leading-relaxed font-kannada">
            ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಹೆದ್ದಾರಿಯ ಪ್ರಸಿದ್ಧ ಬಸವೇಶ್ವರ ದಾಬಾದಿಂದ ನೇರವಾಗಿ ನಿಮ್ಮ ಮನೆ ಬಾಗಿಲಿಗೆ. ಸಂಪೂರ್ಣ ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ, ಶೇಂಗಾ ಚಟ್ನಿಪುಡಿ, ಶುದ್ಧ ಹಸುವಿನ ಬೆಣ್ಣೆ ಹಾಗೂ ಸಾಂಪ್ರದಾಯಿಕ ರುಚಿ.
          </p>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-amber-200 shadow-xs">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Leaf className="w-4 h-4" />
              </div>
              <div className="text-xs font-kannada">
                <p className="font-extrabold text-emerald-950">೧೦೦% ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ</p>
                <p className="text-stone-500 text-[11px]">ಮಾಂಸಾಹಾರವಿಲ್ಲ</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-amber-200 shadow-xs">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs font-kannada">
                <p className="font-extrabold text-amber-950">ಶುದ್ಧ ತುಪ್ಪ & ಬೆಣ್ಣೆ</p>
                <p className="text-stone-500 text-[11px]">ಕೈತಟ್ಟಿದ ರೊಟ್ಟಿ</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-amber-200 shadow-xs">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div className="text-xs font-kannada">
                <p className="font-extrabold text-amber-950">ನೇರ ದಾಬಾ ದರ</p>
                <p className="text-stone-500 text-[11px]">ಉಚಿತ ಡೆಲಿವರಿ ₹೩೯೯+</p>
              </div>
            </div>
          </div>

          {/* Active Offers Banner Pills */}
          {activeOffers.length > 0 && (
            <div className="pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1 mb-1.5 font-kannada">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>ಸಕ್ರಿಯ ಆಫರ್‌ಗಳು & ಕೂಪನ್‌ಗಳು:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {activeOffers.map((off) => (
                  <button
                    key={off.id}
                    onClick={() => {
                      applyPromoCode(off.code);
                      alert(`ಕೂಪನ್ ${off.code} ಅನ್ವಯಿಸಲಾಗಿದೆ!`);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-300 text-xs font-mono font-bold text-amber-950 shadow-xs transition-all hover:scale-105"
                    title="ಕ್ಲಿಕ್ ಮಾಡಿ ಕೂಪನ್ ಅನ್ವಯಿಸಿ"
                  >
                    <span className="bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md text-[10px] font-black">
                      {off.code}
                    </span>
                    <span className="font-kannada font-semibold text-[11px] text-stone-800">
                      {off.title_kn}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Displaying the Newly Uploaded Basaveshwara Dabha Brand Artwork */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full bg-white rounded-3xl p-3 border-2 border-amber-300 shadow-warm-lg overflow-hidden group">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-amber-950 shadow-inner">
              <img
                src="/logo.png"
                alt="ಬಸವೇಶ್ವರ ದಾಬಾ ಅಧಿಕೃತ ಲಾಂಛನ"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-3 text-center space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] font-kannada border border-emerald-300">
                🌿 ಬಸವ ತತ್ವದ ನೈಜ ಶುದ್ಧ ಸಾತ್ವಿಕ ಭೋಜನ
              </span>
              <h3 className="font-black text-amber-950 text-base font-kannada">
                ಬಸವೇಶ್ವರ ದಾಬಾ - ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ
              </h3>
              <p className="text-xs text-stone-600 font-kannada">
                ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ೧೧:೦೦ ರಿಂದ ರಾತ್ರಿ ೧೧:೩೦ ರವರೆಗೆ ಬಿಸಿಬಿಸಿ ಊಟ ಲಭ್ಯ!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
