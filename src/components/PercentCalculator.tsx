import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { soundService } from '../services/soundService';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const PercentCalculator: React.FC = () => {
  const { language } = useLanguage();
  const isHe = language === 'he';

  const [investedAmount, setInvestedAmount] = useState<number>(20);
  const [percentChange, setPercentChange] = useState<number>(10);

  const gainLoss = (investedAmount * percentChange) / 100;
  const finalValue = Math.max(0, investedAmount + gainLoss);
  const isProfit = percentChange > 0;
  const isLoss = percentChange < 0;

  const quickAmounts = [10, 20, 50, 100];
  const quickPercents = [-20, -10, 5, 10, 25, 50, 100];

  const handleAmountChange = (val: number) => {
    soundService.playClick();
    setInvestedAmount(val);
  };

  const handlePercentChange = (val: number) => {
    soundService.playClick();
    setPercentChange(val);
  };

  return (
    <div className="mt-4 p-4 rounded-3xl bg-gradient-to-b from-blue-50/70 to-indigo-50/50 border border-blue-200/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div>
          <h5 className="font-extrabold text-sm text-slate-900 leading-tight">
            {isHe ? 'מחשבון אחוזים אינטראקטיבי' : 'Interactive Percent Calculator'}
          </h5>
          <p className="text-[11px] text-slate-500">
            {isHe ? 'שנה את הסכום והאחוזים ובדוק כמה כסף תרוויח!' : 'Change the numbers to see how money grows!'}
          </p>
        </div>
      </div>

      {/* Control 1: Invested Money */}
      <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">
            {isHe ? 'כמה כסף השקעת?' : 'How much did you invest?'}
          </span>
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
            <span className="text-slate-400 font-bold">$</span>
            <input
              type="number"
              min="1"
              max="10000"
              value={investedAmount || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setInvestedAmount(isNaN(val) ? 0 : val);
              }}
              className="w-16 bg-transparent text-right font-black text-blue-600 text-sm focus:outline-hidden"
            />
          </div>
        </div>

        {/* Amount Quick Presets */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleAmountChange(amt)}
              className={`py-1 rounded-xl text-xs font-bold transition-all ${
                investedAmount === amt
                  ? 'bg-blue-600 text-white shadow-xs scale-102'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              ${amt}
            </button>
          ))}
        </div>
      </div>

      {/* Control 2: Percentage Change */}
      <div className="space-y-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">
            {isHe ? 'כמה אחוזים (%) המניה עלתה או ירדה?' : 'Stock % Change:'}
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="-100"
              max="500"
              value={percentChange}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setPercentChange(isNaN(val) ? 0 : val);
              }}
              className={`w-16 text-center font-black text-sm px-1.5 py-0.5 rounded-lg border focus:outline-hidden ${
                isProfit
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : isLoss
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-slate-50 border-slate-300 text-slate-700'
              }`}
            />
            <span className="font-extrabold text-xs text-slate-500">%</span>
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="-50"
          max="100"
          step="5"
          value={percentChange}
          onChange={(e) => setPercentChange(parseInt(e.target.value, 10))}
          className="w-full accent-blue-600 cursor-pointer"
        />

        {/* Quick Percent Presets */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-0.5">
          {quickPercents.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handlePercentChange(pct)}
              className={`px-2 py-1 rounded-lg text-[11px] font-black shrink-0 transition-all ${
                percentChange === pct
                  ? pct > 0
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {pct > 0 ? `+${pct}%` : `${pct}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Results Card */}
      <div
        className={`p-3.5 rounded-2xl border transition-all ${
          isProfit
            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
            : isLoss
            ? 'bg-rose-50/90 border-rose-300 text-rose-900'
            : 'bg-slate-100 border-slate-300 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-black text-xs">
            {isProfit ? (
              <>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>{isHe ? 'רווח כספי:' : 'Money Won:'}</span>
              </>
            ) : isLoss ? (
              <>
                <TrendingDown className="w-4 h-4 text-rose-600" />
                <span>{isHe ? 'ירידה זמנית:' : 'Temporary Dip:'}</span>
              </>
            ) : (
              <span>{isHe ? 'ללא שינוי:' : 'No Change:'}</span>
            )}
          </div>
          <span
            className={`font-black text-sm ${
              isProfit ? 'text-emerald-700' : isLoss ? 'text-rose-700' : 'text-slate-700'
            }`}
          >
            {isProfit ? `+$${gainLoss.toFixed(2)}` : isLoss ? `-$${Math.abs(gainLoss).toFixed(2)}` : '$0.00'}
          </span>
        </div>

        {/* Visual Progress / Comparison Bar */}
        <div className="space-y-1 mb-2.5">
          <div className="flex justify-between text-[11px] font-bold text-slate-600">
            <span>{isHe ? 'התחלת עם:' : 'Started:'} ${investedAmount.toFixed(0)}</span>
            <span className="font-extrabold text-slate-900">
              {isHe ? 'עכשיו שווה:' : 'Now Worth:'} ${finalValue.toFixed(2)}
            </span>
          </div>

          <div className="w-full bg-white h-3.5 rounded-full overflow-hidden flex border border-slate-200 p-0.5">
            {/* Base Bar */}
            <div
              className="bg-blue-500 h-full rounded-l-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(10, (investedAmount / Math.max(investedAmount, finalValue)) * 100))}%`,
              }}
            />
            {/* Profit Bar */}
            {isProfit && (
              <div
                className="bg-emerald-500 h-full rounded-r-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (gainLoss / Math.max(investedAmount, finalValue)) * 100)}%`,
                }}
              />
            )}
          </div>
        </div>

        {/* Simple Kid Explanation Sentence */}
        <div className="text-xs leading-relaxed font-semibold">
          <p>
            {isHe ? (
              isProfit ? (
                <>
                  אם שמת <strong>${investedAmount}</strong> והמניה עלתה ב-<strong>+{percentChange}%</strong>, הרווחת עוד{' '}
                  <strong className="text-emerald-700">+${gainLoss.toFixed(2)}</strong>! הכסף שלך הפך ל-
                  <strong className="text-slate-900">${finalValue.toFixed(2)}</strong>! 🎉
                </>
              ) : isLoss ? (
                <>
                  אם המניה ירדה ב-<strong>{percentChange}%</strong>, ה-<strong>${investedAmount}</strong> שלך שווים כרגע{' '}
                  <strong className="text-rose-700">${finalValue.toFixed(2)}</strong> (ירידה של -${Math.abs(gainLoss).toFixed(2)}). זכור: כל עוד לא מכרת, לא הפסדת באמת! 🛡️
                </>
              ) : (
                <>
                  ב-0% אין שינוי. ה-<strong>${investedAmount}</strong> שלך נשארים בדיוק <strong>${investedAmount.toFixed(2)}</strong>.
                </>
              )
            ) : isProfit ? (
              <>
                If you invest <strong>${investedAmount}</strong> and it goes up <strong>+{percentChange}%</strong>, you earn{' '}
                <strong className="text-emerald-700">+${gainLoss.toFixed(2)}</strong> extra! You now have{' '}
                <strong className="text-slate-900">${finalValue.toFixed(2)}</strong>! 🎉
              </>
            ) : isLoss ? (
              <>
                If it drops by <strong>{percentChange}%</strong>, your <strong>${investedAmount}</strong> is currently worth{' '}
                <strong className="text-rose-700">${finalValue.toFixed(2)}</strong> (down -${Math.abs(gainLoss).toFixed(2)}). Remember: prices go up and down like a rollercoaster! 🎢
              </>
            ) : (
              <>
                At 0% there is no change. Your <strong>${investedAmount}</strong> stays exactly <strong>${investedAmount.toFixed(2)}</strong>.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
