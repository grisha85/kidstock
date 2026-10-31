import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { StockInfo } from '../types';
import { Info, X, Lightbulb } from 'lucide-react';
import { soundService } from '../services/soundService';

interface StockKidIndicatorsProps {
  stock: StockInfo;
}

type IndicatorType = 'pe' | 'yearlyGrowth' | 'volatility' | 'marketCap';

interface ExplainerDetail {
  title: { en: string; he: string };
  analogy: { en: string; he: string };
  whatItMeansForYou: { en: string; he: string };
}

const INDICATOR_EXPLAINERS: Record<IndicatorType, ExplainerDetail> = {
  pe: {
    title: {
      en: 'What is the Value Tag (P/E Ratio)?',
      he: 'מה זה תג מחיר ומכפיל רווח (P/E)?',
    },
    analogy: {
      en: "Imagine buying a lemonade stand from a friend. If the stand makes $10 in profit every summer and you buy it for $100, the P/E is 10 (it takes 10 years of earnings to pay for the purchase price).",
      he: "תחשוב שאתה קונה דוכן לימונדה מחבר. אם הדוכן מרוויח 10$ בכל קיץ ואתה קונה אותו ב-100$, מכפיל הרווח (P/E) הוא 10 (ייקח לרווחים 10 שנים להחזיר את המחיר).",
    },
    whatItMeansForYou: {
      en: 'If P/E is low (under 20), it is priced at a reasonable valuation. If P/E is high, investors expect the company to invent major new products and grow fast.',
      he: 'אם מכפיל הרווח נמוך (מתחת ל-20), המניה נסחרת במחיר סביר. אם הוא גבוה, משקיעים מאמינים שהחברה תמציא מוצרים חדשים ותצמח במהירות.',
    },
  },
  yearlyGrowth: {
    title: {
      en: 'What is 1-Year Growth?',
      he: 'מה זה צמיחה בשנה האחרונה?',
    },
    analogy: {
      en: 'Every day a stock price bounces up and down. Looking at 365 days shows the true trend: is the company growing over the whole year or cooling off?',
      he: 'בכל יום מחיר המניה זז למעלה ולמטה. מבט על 365 ימים מראה את המגמה האמיתית: האם החברה בצמיחה לאורך כל השנה או שהיא נחלשה?',
    },
    whatItMeansForYou: {
      en: 'If you invested $100 one year ago, this tells you how much bigger or smaller your investment would be today.',
      he: 'אם היית משקיע 100$ לפני שנה, האחוז הזה מראה בכמה ההשקעה שלך הייתה גדלה או קטנה עד היום.',
    },
  },
  volatility: {
    title: {
      en: 'What is Price Volatility?',
      he: 'מה זו תנודתיות במחיר?',
    },
    analogy: {
      en: 'Some amusement park rides are calm carousel ponies for toddlers, while others are mega looping rollercoasters that turn you upside down at 80 miles per hour!',
      he: 'חלק מהמתקנים בלונה פארק הם סוסי עץ רגועים לקטנטנים, וחלק הם רכבות הרים מסחררות עם לופים באוויר במהירות שיא!',
    },
    whatItMeansForYou: {
      en: 'Low volatility stocks (Apple, Coca-Cola) are very stable. High volatility stocks (Roblox, Tesla) can swing quickly. Holding a mix helps balance your portfolio.',
      he: 'מניות עם תנודתיות נמוכה (אפל, קוקה קולה) יציבות מאוד. מניות עם תנודתיות גבוהה (רובלוקס, טסלה) נעות מהר. שילוב של שתיהן מאזן את התיק.',
    },
  },
  marketCap: {
    title: {
      en: 'What is Company Size (Market Cap)?',
      he: 'מה זה שווי שוק (גודל החברה)?',
    },
    analogy: {
      en: 'Market Cap is the total dollar value of the whole company—calculated by multiplying all shares by the current price.',
      he: 'שווי שוק הוא השווי הכולל בדולרים של כל החברה—מחושב לפי מספר כל המניות כפול המחיר שלהן בבורסה.',
    },
    whatItMeansForYou: {
      en: 'Mega-cap companies (over $1 Trillion) like Apple or Microsoft have massive revenue and established market positions.',
      he: 'חברות ענק (מעל 1 טריליון דולר) כמו אפל או מיקרוסופט הן חברות יציבות במיוחד עם פעילות גלובלית רחבה.',
    },
  },
};

export const StockKidIndicators: React.FC<StockKidIndicatorsProps> = ({ stock }) => {
  const { language } = useLanguage();
  const isHe = language === 'he';

  const [activeModal, setActiveModal] = useState<IndicatorType | null>(null);

  // 1. Calculate P/E Badge
  const pe = stock.peRatio;
  let peBadge = { text: isHe ? 'מציאה משתלמת' : 'Bargain Value', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  if (pe <= 0) {
    peBadge = { text: isHe ? 'משקיעה בצמיחה' : 'Growth Company', color: 'bg-blue-50 text-blue-800 border-blue-200' };
  } else if (pe >= 20 && pe <= 35) {
    peBadge = { text: isHe ? 'מחיר הוגן ומאוזן' : 'Fair Balanced Price', color: 'bg-amber-50 text-amber-800 border-amber-200' };
  } else if (pe > 35) {
    peBadge = { text: isHe ? 'ציפיות צמיחה גבוהות' : 'High Growth Expectations', color: 'bg-purple-50 text-purple-800 border-purple-200' };
  }

  // 2. Calculate 1-Year Growth
  const yearlyGrowth = stock.yearlyGrowthPercent !== undefined
    ? stock.yearlyGrowthPercent
    : Number((((stock.currentPrice - stock.fiftyTwoWeekLow) / (stock.fiftyTwoWeekLow || 1)) * 100 * 0.75 - 4).toFixed(1));
  const isYearlyPositive = yearlyGrowth >= 0;

  // 3. Volatility / Danger
  let volBadge = { text: isHe ? 'סיכון נמוך (יציב)' : 'Low Volatility (Stable)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  if (stock.volatility === 'dolphin') {
    volBadge = { text: isHe ? 'סיכון בינוני (מאוזן)' : 'Medium Volatility', color: 'bg-blue-50 text-blue-800 border-blue-200' };
  } else if (stock.volatility === 'cheetah') {
    volBadge = { text: isHe ? 'סיכון גבוה (תנודתי)' : 'High Volatility', color: 'bg-rose-50 text-rose-800 border-rose-200' };
  }

  // 4. Market Cap / Size
  let sizeBadge = { text: isHe ? 'חברת ענק ($100B+)' : 'Large Cap ($100B+)', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
  if (stock.marketCapCategory === 'puppy') {
    sizeBadge = { text: isHe ? 'חברה קטנה (<10B$)' : 'Small Cap (<$10B)', color: 'bg-amber-50 text-amber-800 border-amber-200' };
  } else if (stock.marketCapCategory === 'lion') {
    sizeBadge = { text: isHe ? 'חברה בינונית (10B$-100B$)' : 'Mid Cap ($10B-$100B)', color: 'bg-blue-50 text-blue-800 border-blue-200' };
  } else if (stock.marketCapCategory === 'mega_titan') {
    sizeBadge = { text: isHe ? 'מגה-חברה (>1T$)' : 'Mega Cap (>$1 Trillion)', color: 'bg-purple-50 text-purple-800 border-purple-200' };
  }

  const openInfo = (type: IndicatorType) => {
    soundService.playClick();
    setActiveModal(type);
  };

  return (
    <div className="space-y-2 mb-4">
      {/* Title */}
      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
        <span>{isHe ? 'מדדים כלכליים' : 'Economic Indicators'}</span>
      </div>

      {/* 2x2 Grid of Kid Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Param 1: Price Tag (P/E) */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500">
              {isHe ? 'תג מחיר (P/E מכפיל)' : 'Price Tag (P/E Ratio)'}
            </span>
            <button
              type="button"
              onClick={() => openInfo('pe')}
              className="w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center transition-transform hover:scale-110"
              title="Click for kid explanation"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className="text-sm font-black text-slate-900">
              {pe > 0 ? `${pe}x` : (isHe ? 'צמיחה' : 'Growth')}
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${peBadge.color}`}>
              {peBadge.text}
            </span>
          </div>
        </div>

        {/* Param 2: 1-Year Growth */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500">
              {isHe ? 'צמיחה בשנה האחרונה' : '1-Year Growth'}
            </span>
            <button
              type="button"
              onClick={() => openInfo('yearlyGrowth')}
              className="w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center transition-transform hover:scale-110"
              title="Click for kid explanation"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className={`text-sm font-black ${isYearlyPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isYearlyPositive ? '+' : ''}{yearlyGrowth}%
            </span>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                isYearlyPositive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {isYearlyPositive
                ? (isHe ? 'מגמת עלייה' : 'Climbing Up')
                : (isHe ? 'בהנחה זמנית' : 'On Discount')}
            </span>
          </div>
        </div>

        {/* Param 3: Danger / Rollercoaster */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500">
              {isHe ? 'רמת תנודתיות (תנודות במחיר)' : 'Volatility Level'}
            </span>
            <button
              type="button"
              onClick={() => openInfo('volatility')}
              className="w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center transition-transform hover:scale-110"
              title="Click for kid explanation"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-1">
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border block text-center truncate ${volBadge.color}`}>
              {volBadge.text}
            </span>
          </div>
        </div>

        {/* Param 4: Monster Size (Market Cap) */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500">
              {isHe ? 'גודל החברה (שווי שוק)' : 'Company Size (Market Cap)'}
            </span>
            <button
              type="button"
              onClick={() => openInfo('marketCap')}
              className="w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center transition-transform hover:scale-110"
              title="Click for kid explanation"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className="text-xs font-black text-slate-900">
              ${stock.marketCap >= 1000 ? `${(stock.marketCap / 1000).toFixed(1)}T` : `${stock.marketCap}B`}
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${sizeBadge.color}`}>
              {sizeBadge.text}
            </span>
          </div>
        </div>
      </div>

      {/* Explainer Modal (When kid clicks "ℹ️") */}
      {activeModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setActiveModal(null);
          }}
          className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-left rtl:text-right relative animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                </div>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                  {isHe
                    ? INDICATOR_EXPLAINERS[activeModal].title.he
                    : INDICATOR_EXPLAINERS[activeModal].title.en}
                </h4>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Analogy Box */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 font-medium leading-relaxed mb-3">
              {isHe
                ? INDICATOR_EXPLAINERS[activeModal].analogy.he
                : INDICATOR_EXPLAINERS[activeModal].analogy.en}
            </div>

            {/* What it means */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 font-bold leading-relaxed mb-4">
              {isHe
                ? INDICATOR_EXPLAINERS[activeModal].whatItMeansForYou.he
                : INDICATOR_EXPLAINERS[activeModal].whatItMeansForYou.en}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors"
            >
              {isHe ? 'הבנתי, תודה! 👍' : 'Got it! 👍'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
