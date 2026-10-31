import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { soundService } from '../services/soundService';
import { Info, X, Lightbulb } from 'lucide-react';
import { PercentCalculator } from './PercentCalculator';

export type ExplainerTopic =
  | 'percent'
  | 'gainLoss'
  | 'totalBalance'
  | 'piggyCash'
  | 'batchLots'
  | 'howMarketWorks'
  | 'shares'
  | 'diversification';

interface ExplainerContent {
  title: { en: string; he: string };
  simpleText: { en: string; he: string };
  example: { en: string; he: string };
}

const EXPLAINERS: Record<ExplainerTopic, ExplainerContent> = {
  howMarketWorks: {
    title: {
      en: 'How Does the Stock Market Work?',
      he: 'איך עובד שוק ההון ומסחר במניות?',
    },
    simpleText: {
      en: 'The stock market is a giant global auction where millions of people buy and sell tiny pieces of real companies every second. Prices move based on supply and demand: when more people want to buy a company, its price goes up. When more people want to sell, its price dips.',
      he: 'שוק ההון הוא כמו מכירה פומבית עולמית ענקית שבה מיליוני אנשים קונים ומוכרים חתיכות מחברות אמיתיות בכל שנייה. המחירים נקבעים לפי היצע וביקוש: כשיותר אנשים רוצים לקנות מניה, המחיר שלה עולה. כשיותר אנשים רוצים למכור, המחיר יורד.',
    },
    example: {
      en: 'Real-world example: If Nintendo announces a brand new Pokémon game and millions of players get excited, lots of investors rush to buy Nintendo stock, pushing the price higher! If sales slow down, the price cools off.',
      he: 'דוגמה מהעולם האמיתי: אם נינטנדו מכריזה על משחק פוקימון חדש ומלהיב, המוני משקיעים רצים לקנות מניות של נינטנדו כי הם צופים רווחים גדולים, והמחיר עולה!',
    },
  },
  shares: {
    title: {
      en: 'What is a "Share" of Stock?',
      he: 'מה זה ״מניה״ (Share)?',
    },
    simpleText: {
      en: 'Big companies like Apple, Disney, or Roblox are divided into millions of tiny slices called "shares". When you buy even 1 share (or a fraction of a share), you become a real legal co-owner (shareholder) of that entire company!',
      he: 'חברות ענק כמו אפל, דיסני או רובלוקס מחולקות למיליוני חלקים קטנים שנקראים ״מניות״. כשאתה קונה מניה או חלק ממנה, אתה הופך לבעלים שותף רשמי של החברה!',
    },
    example: {
      en: 'Real-world example: If you own Roblox shares and Roblox builds a hit feature that earns millions of dollars, the value of your shares increases because the entire company is now worth more.',
      he: 'דוגמה מהעולם האמיתי: אם יש לך מניות של רובלוקס והחברה מרוויחה מיליוני דולרים משחקנים חדשים, שווי המניה שלך גדל כי החברה כולה שווה יותר כסף.',
    },
  },
  diversification: {
    title: {
      en: 'What is Diversification (Not All in One Basket)?',
      he: 'מה זה פיזור השקעות (לא לשים הכל בסל אחד)?',
    },
    simpleText: {
      en: 'Diversification means spreading your money across different kinds of businesses (like video games, snacks, tech, and sports) instead of putting all your cash into just one company.',
      he: 'פיזור השקעות אומר לחלק את הכסף שלך בין כמה תחומים שונים (משחקי מחשב, חטיפים, טכנולוגיה וספורט) במקום להמר על חברה אחת בלבד.',
    },
    example: {
      en: 'Real-world example: If you only own a gaming stock and video games have a slow month, your whole portfolio drops. But if you also own Apple and Nike, their good days help keep your total balance protected and growing!',
      he: 'דוגמה מהעולם האמיתי: אם כל הכסף שלך במניית משחקים אחת ויש לה חודש חלש, כל החיסכון יורד. אבל אם יש לך גם מניות של אפל ונייקי, ההצלחה שלהן מגנה על הכסף שלך!',
    },
  },
  percent: {
    title: {
      en: 'What does Percent (%) mean?',
      he: 'מה זה אומר אחוזים (%)?',
    },
    simpleText: {
      en: 'Percent shows how fast your money grows, no matter how much cash you started with! It lets you compare a small $10 investment with a giant $1,000 investment on the exact same scale.',
      he: 'אחוזים מראים באיזה קצב הכסף שלך צומח, לא משנה עם כמה דולרים התחלת! הם מאפשרים להשוות השקעה קטנה של 10$ להשקעה גדולה של 1,000$ באותה המידה בדיוק.',
    },
    example: {
      en: 'Rule of thumb: Think of 10% as 10 cents on every dollar. If you put in $10 and it grows +10%, you gain $1.00. If you put in $50 and it grows +10%, you gain $5.00!',
      he: 'כלל אצבע: תחשוב על 10% כמו 10 סנט על כל דולר. אם השקעת 10$ והמניה עלתה ב-+10%, הרווחת 1.00$. אם השקעת 50$, הרווחת 5.00$!',
    },
  },
  gainLoss: {
    title: {
      en: 'What is Gain & Loss?',
      he: 'מה זה רווח והפסד?',
    },
    simpleText: {
      en: 'Green (+) means the current market price of your company is higher than what you paid for it. Red (-) means the market price dipped below what you paid.',
      he: 'ירוק (+) אומר ששווי המניה בשוק כרגע גבוה יותר ממה ששילמת עליה. אדום (-) אומר שהמחיר בשוק ירד זמנית מתחת למחיר שקנית.',
    },
    example: {
      en: 'Investor tip: Stock prices fluctuate every single day. Experienced investors don’t panic when prices turn red—they view dips as an opportunity to buy great companies at a discount!',
      he: 'טיפ למשקיעים: מחירי מניות עולים ויורדים בכל יום. משקיעים חכמים לא נבהלים כשהצבע הופך לאדום—הם רואים בירידות זמניות הזדמנות לקנות חברות מעולות בהנחה!',
    },
  },
  totalBalance: {
    title: {
      en: 'Total Balance vs Cash in Piggy Bank',
      he: 'מה ההבדל בין שווי כולל למזומן בקופה?',
    },
    simpleText: {
      en: 'Your Total Balance is the complete value of your wealth: cash in your Piggy Bank vault plus the live market value of all the stock shares you own right now.',
      he: 'השווי הכולל הוא סך כל הכסף שלך: המזומן שיושב בקופת החיסכון + השווי העדכני של כל המניות שרכשת עד עכשיו.',
    },
    example: {
      en: 'Example: If you have $25 cash in your Piggy Bank and your Roblox shares are worth $35, your Total Balance is $60.00.',
      he: 'דוגמה: אם יש לך 25$ מזומן בקופה ומניות הרובלוקס שלך שוות 35$, השווי הכולל שלך הוא 60.00$.',
    },
  },
  piggyCash: {
    title: {
      en: 'Piggy Bank Cash',
      he: 'קופת חיסכון (מזומן פנוי)',
    },
    simpleText: {
      en: 'This is uninvested cash ready in your account. You can use it anytime to invest in new companies, or ask your parent to cash it out for real-world spending.',
      he: 'זהו כסף מזומן שלא מושקע כרגע במניות. תוכל להשתמש בו בכל רגע כדי לקנות מניות של חברה חדשה, או לבקש מההורה למשוך אותו כדי לקנות משהו אמיתי.',
    },
    example: {
      en: 'Example: You get $15 for helping around the house or a birthday gift, give it to your parent, and they record it in your KidStock Piggy Bank!',
      he: 'דוגמה: קיבלת 15$ עבור עזרה בבית או מתנת יום הולדת, נתת להורה, וההורה הפקיד אותם לקופה שלך באפליקציה!',
    },
  },
  batchLots: {
    title: {
      en: 'What are Buy Batches?',
      he: 'מה זה ״מנות קנייה״ (Batches)?',
    },
    simpleText: {
      en: 'Every time you make a purchase, KidStock records a separate "batch". Because stock prices change daily, buying on Monday and buying again on Friday means each batch was bought at a different price.',
      he: 'בכל פעם שאתה קונה מניה, נרשמת ״מנת קנייה״ נפרדת. מכיוון שמחיר המניה משתנה בכל יום, קנייה ביום שני וקנייה ביום שישי נעשות במחירים שונים.',
    },
    example: {
      en: 'Example: Batch #1 might show a gain of +12% while Batch #2 shows +3%. Tracking separate batches lets you see exactly how each purchase performed over time.',
      he: 'דוגמה: מנה מס׳ 1 עשויה להראות רווח של +12% בעוד מנה מס׳ 2 מראה רווח של +3%. כך תוכל לראות בדיוק כמה הרווחת על כל קנייה!',
    },
  },
};

export const ExplainerTooltip: React.FC<{ topic: ExplainerTopic; className?: string }> = ({
  topic,
  className = '',
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const data = EXPLAINERS[topic];
  if (!data) return null;

  const title = language === 'he' ? data.title.he : data.title.en;
  const simpleText = language === 'he' ? data.simpleText.he : data.simpleText.en;
  const example = language === 'he' ? data.example.he : data.example.en;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          soundService.playClick();
          setIsOpen(true);
        }}
        title="Click for kid explanation"
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold transition-transform hover:scale-110 shrink-0 ${className}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-left rtl:text-right relative animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto ${
              topic === 'percent' ? 'max-w-md sm:max-w-lg' : 'max-w-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                </div>
                <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                  {title}
                </h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3 font-medium">
              {simpleText}
            </p>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 font-semibold leading-relaxed">
              {example}
            </div>

            {/* Interactive Calculator for Percent Topic */}
            {topic === 'percent' && <PercentCalculator />}

            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              {language === 'he' ? 'הבנתי, תודה! 👍' : 'Got it! 👍'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
