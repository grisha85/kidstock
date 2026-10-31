import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { soundService } from '../services/soundService';
import { CheckCircle2, X } from 'lucide-react';

export interface TradeLessonInfo {
  action: 'buy' | 'sell';
  stockName: string;
  amount: number;
}

interface PostTradeCelebrationModalProps {
  trade: TradeLessonInfo;
  onClose: () => void;
}

export const PostTradeCelebrationModal: React.FC<PostTradeCelebrationModalProps> = ({
  trade,
  onClose,
}) => {
  const { language } = useLanguage();
  const isHe = language === 'he';

  const isBuy = trade.action === 'buy';

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150 text-slate-900">
        <button
          onClick={() => {
            soundService.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 rtl:right-auto rtl:left-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
              {isHe ? 'הפעולה הושלמה בהצלחה' : 'Order Executed Successfully'}
            </span>
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              {isBuy
                ? isHe
                  ? `קנית מניות ${trade.stockName} ב-$${trade.amount.toFixed(2)}`
                  : `Bought $${trade.amount.toFixed(2)} of ${trade.stockName}`
                : isHe
                  ? `מכרת מניות ${trade.stockName} ב-$${trade.amount.toFixed(2)}`
                  : `Sold $${trade.amount.toFixed(2)} of ${trade.stockName}`}
            </h3>
          </div>
        </div>

        {/* Educational Market Lesson Box */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2 mb-5">
          <span className="font-extrabold text-blue-900 block text-xs uppercase tracking-wider">
            {isHe ? 'מה קרה עכשיו בבורסה?' : 'Market Lesson: What just happened?'}
          </span>
          {isBuy ? (
            <p>
              {isHe
                ? `הפקודה שלך התאימה למשקיע אחר שרצה למכור מניות של ${trade.stockName}. מעכשיו אתה שותף רשמי בחברה! ככל שהחברה תרוויח ותצמח, שווי החלק שלך יעלה.`
                : `Your purchase matched instantly with a seller on the stock exchange. You are now a legal co-owner of ${trade.stockName}! As the company grows profits and invents new products, the value of your shares can increase.`}
            </p>
          ) : (
            <p>
              {isHe
                ? `מכרת את מניותיך לקונה אחר בבורסה! הרווח או ההפסד ננעלו כעת, והכסף הועבר ישירות לקופת החיסכון שלך כמזומן פנוי להשקעה חוזרת או למשיכה.`
                : `You sold your shares to a buyer on the exchange! Your return on this position is now locked in, and the cash is immediately ready in your Piggy Bank vault to reinvest or withdraw.`}
            </p>
          )}
        </div>

        <button
          onClick={() => {
            soundService.playClick();
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md transition-all hover:scale-[1.01]"
        >
          {isHe ? 'הבנתי, תודה!' : 'Got it, let\'s continue!'}
        </button>
      </div>
    </div>
  );
};
