import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { soundService } from '../services/soundService';
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';

export interface TourStep {
  id: string;
  targetSelector: string;
  titleKey: string;
  descKey: string;
}

interface KidLiveTourProps {
  onClose: () => void;
  onComplete?: () => void;
}

export const KidLiveTour: React.FC<KidLiveTourProps> = ({ onClose, onComplete }) => {
  const { language, t } = useLanguage();
  const isHe = language === 'he';

  const steps: TourStep[] = [
    {
      id: 'piggy-cash',
      targetSelector: '[data-tour="piggy-cash"]',
      titleKey: t.howItWorks.tourStepPiggyTitle,
      descKey: t.howItWorks.tourStepPiggyDesc,
    },
    {
      id: 'total-balance',
      targetSelector: '[data-tour="total-balance"]',
      titleKey: t.howItWorks.tourStepBalanceTitle,
      descKey: t.howItWorks.tourStepBalanceDesc,
    },
    {
      id: 'stock-holdings',
      targetSelector: '[data-tour="stock-holdings"]',
      titleKey: t.howItWorks.tourStepHoldingsTitle,
      descKey: t.howItWorks.tourStepHoldingsDesc,
    },
    {
      id: 'stock-market',
      targetSelector: '[data-tour="stock-market"]',
      titleKey: t.howItWorks.tourStepMarketTitle,
      descKey: t.howItWorks.tourStepMarketDesc,
    },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const step = steps[currentStepIndex];

  // Update target bounding box and smooth-scroll to it
  const updateRect = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    if (!step) return;

    const el = document.querySelector(step.targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Small delay to let scroll finish before taking rect
      const timer = setTimeout(updateRect, 300);
      return () => clearTimeout(timer);
    } else {
      updateRect();
    }
  }, [currentStepIndex, step, updateRect]);

  // Recalculate on window resize or scroll
  useEffect(() => {
    const handleScrollOrResize = () => updateRect();
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [updateRect]);

  const handleNext = () => {
    soundService.playClick();
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    soundService.playClick();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    soundService.playTradeSuccess();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
    setIsFinished(true);
    if (onComplete) {
      onComplete();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (isHe) handlePrev();
        else handleNext();
      } else if (e.key === 'ArrowLeft') {
        if (isHe) handleNext();
        else handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, isHe]);

  // Compute position for the tooltip popup
  const getTooltipStyle = () => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const margin = 16;
    const isTargetNearBottom = targetRect.bottom + 250 > window.innerHeight;

    let top = 0;
    if (isTargetNearBottom && targetRect.top > 240) {
      // Place above target
      top = Math.max(margin, targetRect.top - 230);
    } else {
      // Place below target
      top = Math.min(window.innerHeight - 250, targetRect.bottom + margin);
    }

    // Horizontal centering
    const left = Math.max(
      margin,
      Math.min(window.innerWidth - 380, targetRect.left + targetRect.width / 2 - 180)
    );

    return {
      top: `${top}px`,
      left: `${left}px`,
      maxWidth: '360px',
      width: 'calc(100vw - 32px)',
    };
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mb-4 shadow-inner">
            🏅
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            {t.howItWorks.tourBadgeUnlocked}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 font-medium leading-relaxed">
            {isHe
              ? 'עכשיו אתה שולט בכל המסך! בחר מניה שאתה אוהב וקנה את החלק הראשון שלך!'
              : "You're all set and ready to be an investor! Pick a company you love and buy your first slice!"}
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
          >
            {isHe ? 'בואו נתחיל להשקיע! 🚀' : "Let's Start Investing! 🚀"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      {/* Target Spotlight Highlight Ring */}
      {targetRect && (
        <div
          style={{
            top: `${Math.max(0, targetRect.top - 8)}px`,
            left: `${Math.max(0, targetRect.left - 8)}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.72)',
          }}
          className="fixed rounded-2xl pointer-events-none transition-all duration-300 border-2 border-amber-400 ring-4 ring-amber-400/30"
        />
      )}

      {/* If element wasn't found, standard dark overlay */}
      {!targetRect && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Floating Tour Card */}
      <div
        style={getTooltipStyle()}
        className="fixed z-50 bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 text-left rtl:text-right transition-all duration-300 animate-in fade-in zoom-in-95"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider block">
              {isHe
                ? `שלב ${currentStepIndex + 1} מתוך ${steps.length}`
                : `Step ${currentStepIndex + 1} of ${steps.length}`}
            </span>
            <h4 className="text-base font-black text-slate-900 leading-tight">
              {step.titleKey}
            </h4>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            title={t.howItWorks.tourSkip}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-5">
          {step.descKey}
        </p>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
          >
            {t.howItWorks.tourSkip}
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                {t.howItWorks.tourPrev}
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all hover:scale-[1.02]"
            >
              <span>
                {currentStepIndex === steps.length - 1
                  ? t.howItWorks.tourFinish
                  : t.howItWorks.tourNext}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
