import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { soundService } from '../services/soundService';
import {
  X,
  TrendingUp,
} from 'lucide-react';

interface KidExplainerModalProps {
  onClose: () => void;
  onStartLiveTour: () => void;
}

export const KidExplainerModal: React.FC<KidExplainerModalProps> = ({
  onClose,
  onStartLiveTour,
}) => {
  const { language, t } = useLanguage();
  const isHe = language === 'he';

  const [activeTab, setActiveTab] = useState<'tour' | 'stories'>('tour');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      emoji: '💵',
      badge: isHe ? 'שלב 1: מזומן' : 'Step 1: Cash',
      color: 'bg-emerald-500',
      bgGrad: 'from-emerald-500/10 to-teal-500/5',
      title: t.howItWorks.story1Title,
      desc: t.howItWorks.story1Desc,
      visual: (
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl shadow-xs animate-bounce">
            🧒
          </div>
          <span className="text-2xl text-emerald-600 font-black">➔ $20 ➔</span>
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl shadow-xs">
            👨
          </div>
          <span className="text-2xl text-blue-600 font-black">➔</span>
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-xs">
            🐷
          </div>
        </div>
      ),
    },
    {
      emoji: '🎮',
      badge: isHe ? 'שלב 2: קניית חלק' : 'Step 2: Buy Slices',
      color: 'bg-blue-500',
      bgGrad: 'from-blue-500/10 to-indigo-500/5',
      title: t.howItWorks.story2Title,
      desc: t.howItWorks.story2Desc,
      visual: (
        <div className="flex items-center justify-center gap-2 py-6">
          <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 text-center">
            <span className="text-2xl block mb-1">🟥</span>
            <span className="text-xs font-black">Roblox</span>
            <span className="text-[10px] text-emerald-600 font-bold block">$5.00</span>
          </div>
          <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 text-center">
            <span className="text-2xl block mb-1">🍏</span>
            <span className="text-xs font-black">Apple</span>
            <span className="text-[10px] text-emerald-600 font-bold block">$10.00</span>
          </div>
          <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 text-center">
            <span className="text-2xl block mb-1">🏰</span>
            <span className="text-xs font-black">Disney</span>
            <span className="text-[10px] text-emerald-600 font-bold block">$5.00</span>
          </div>
        </div>
      ),
    },
    {
      emoji: '📈',
      badge: isHe ? 'שלב 3: צמיחה' : 'Step 3: Growth',
      color: 'bg-indigo-500',
      bgGrad: 'from-indigo-500/10 to-purple-500/5',
      title: t.howItWorks.story3Title,
      desc: t.howItWorks.story3Desc,
      visual: (
        <div className="flex items-center justify-center gap-4 py-6">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
            <span className="text-xs font-extrabold text-emerald-800 block">
              {isHe ? 'השקעת $10' : 'You Put $10'}
            </span>
            <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto my-1" />
            <span className="text-sm font-black text-emerald-700 block">
              {isHe ? 'עכשיו שווה $12.50 (+25%)' : 'Now Worth $12.50 (+25%)'}
            </span>
          </div>
        </div>
      ),
    },
    {
      emoji: '🏆',
      badge: isHe ? 'שלב 4: משקיעים חכמים' : 'Step 4: Smart Investor',
      color: 'bg-amber-500',
      bgGrad: 'from-amber-500/10 to-orange-500/5',
      title: t.howItWorks.story4Title,
      desc: t.howItWorks.story4Desc,
      visual: (
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
            <span className="text-4xl block mb-1">🎖️</span>
            <span className="text-xs font-black text-amber-900 block">
              {isHe ? 'סבלנות = הצלחה!' : 'Patience Pays Off!'}
            </span>
            <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
              {isHe ? 'משוך כסף אמיתי מההורים מתי שתרצה' : 'Cash out with your parent anytime you want real money'}
            </span>
          </div>
        </div>
      ),
    },
  ];

  const handleNextSlide = () => {
    soundService.playClick();
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      setCurrentSlide(0);
    }
  };

  const handlePrevSlide = () => {
    soundService.playClick();
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 text-left rtl:text-right"
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/60">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {t.howItWorks.modalTitle.replace(' 🚀', '')}
            </h3>
            <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
              {t.howItWorks.modalSubtitle}
            </p>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Tabs Bar */}
        <div className="flex border-b border-slate-200 px-4 sm:px-6 bg-white gap-4">
          <button
            onClick={() => {
              soundService.playClick();
              setActiveTab('tour');
            }}
            className={`py-3 text-xs sm:text-sm font-black border-b-2 transition-all ${
              activeTab === 'tour'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{t.howItWorks.tabTour.replace(/[^a-zA-Z\u0590-\u05FF\s]/g, '').trim()}</span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              setActiveTab('stories');
            }}
            className={`py-3 text-xs sm:text-sm font-black border-b-2 transition-all ${
              activeTab === 'stories'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{t.howItWorks.tabStories.replace(/[^a-zA-Z\u0590-\u05FF\s]/g, '').trim()}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: LIVE INTERACTIVE TOUR */}
          {activeTab === 'tour' && (
            <div className="space-y-6 text-center py-4">
              <div className="max-w-md mx-auto">
                <h4 className="text-xl font-black text-slate-900 mb-2">
                  {isHe ? 'סיור חי במסך' : 'Interactive Live Screen Tour'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {isHe
                    ? 'נאיר עבורך את קופת החיסכון, שווי התיק, המניות שברשותך וחנות המניות צעד אחר צעד.'
                    : "We'll spotlight your Piggy Bank, Total Balance, your stocks, and the market catalog step by step on your real dashboard."}
                </p>
              </div>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 gap-2 text-left rtl:text-right max-w-md mx-auto">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 block">
                    {isHe ? 'קופת חיסכון ומזומן' : 'Piggy Bank Cash'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isHe ? 'מזומן זמין להשקעה' : 'Ready to invest'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 block">
                    {isHe ? 'גרף צמיחה' : 'Growth Chart'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isHe ? 'מעקב שווי בזמן אמת' : 'Real-time value tracking'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 block">
                    {isHe ? 'מנות קנייה נפרדות' : 'Buy Batches'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isHe ? 'מעקב רווח לפי רכישה' : 'Profit per purchase lot'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 block">
                    {isHe ? 'חנות מניות' : 'Stock Store'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isHe ? '60 מניות מובילות' : '60 kid favorites'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    soundService.playTradeSuccess();
                    onStartLiveTour();
                  }}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md transition-all hover:scale-105"
                >
                  <span>{t.howItWorks.startTourBtn.replace(' 🚀', '')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STORY CARDS */}
          {activeTab === 'stories' && (
            <div className="space-y-4">
              {/* Active Card */}
              <div
                className={`p-6 rounded-3xl border border-slate-200 bg-gradient-to-b ${slides[currentSlide].bgGrad} transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider text-white px-2.5 py-0.5 rounded-full ${slides[currentSlide].color}`}
                  >
                    {slides[currentSlide].badge}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {currentSlide + 1} / {slides.length}
                  </span>
                </div>

                {/* Animated graphic mockup */}
                {slides[currentSlide].visual}

                <h4 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                  {slides[currentSlide].title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  {slides[currentSlide].desc}
                </p>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handlePrevSlide}
                  disabled={currentSlide === 0}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {isHe ? 'הקודם' : 'Previous'}
                </button>

                {/* Dots indicator */}
                <div className="flex items-center gap-1.5">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        soundService.playClick();
                        setCurrentSlide(idx);
                      }}
                      className={`h-2.5 rounded-full transition-all ${
                        currentSlide === idx ? 'w-6 bg-blue-600' : 'w-2.5 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextSlide}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-colors"
                >
                  {currentSlide === slides.length - 1
                    ? isHe
                      ? 'התחלה מחדש ↺'
                      : 'Restart ↺'
                    : isHe
                    ? 'הבא ←'
                    : 'Next →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
