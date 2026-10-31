import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ChildProfile, AggregatedHolding } from '../types';
import { marketService } from '../services/marketService';
import { portfolioEngine } from '../services/portfolioEngine';
import { soundService } from '../services/soundService';
import {
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { StockLogo } from './StockLogo';
import { StockMonthChart } from './StockMonthChart';
import { StockKidIndicators } from './StockKidIndicators';
import { getCompanyHistory } from '../data/companyHistory';
import { getExtendedStockDetails } from '../data/extendedStockDetails';
import { formatGainLoss, formatCurrency } from '../utils/formatters';

interface StockDetailModalProps {
  ticker: string;
  child: ChildProfile;
  holdings: AggregatedHolding[];
  onClose: () => void;
  onTradeComplete: (trade?: { action: 'buy' | 'sell'; stockName: string; amount: number }) => void;
}

interface TradeFeedbackDetails {
  type: 'success' | 'error';
  title: string;
  lesson: string;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  ticker,
  child,
  holdings,
  onClose,
  onTradeComplete,
}) => {
  const { language } = useLanguage();
  const isHe = language === 'he';

  const stock = marketService.getStock(ticker);

  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [dollarsInput, setDollarsInput] = useState<string>('10');
  const [sellDollarsInput, setSellDollarsInput] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<TradeFeedbackDetails | null>(null);

  if (!stock) return null;

  const currentHolding = holdings.find((h) => h.ticker === ticker);
  const ownedShares = currentHolding ? currentHolding.totalShares : 0;
  const ownedValue = currentHolding ? currentHolding.currentValue : 0;

  const description = isHe ? stock.kidDescription.he : stock.kidDescription.en;
  const howTheyMakeMoney = isHe ? stock.howTheyMakeMoney.he : stock.howTheyMakeMoney.en;

  const historyText = getCompanyHistory(stock.ticker, stock.name, stock.category);
  const history = isHe ? historyText.he : historyText.en;

  const extendedDetails = getExtendedStockDetails(stock.ticker, stock.name, stock.category);

  // Buy calculations
  const buyAmount = parseFloat(dollarsInput) || 0;
  const hasEnoughCash = child.cashBalance >= buyAmount && buyAmount > 0;
  const remainingCash = Number((child.cashBalance - buyAmount).toFixed(2));

  // Sell calculations
  const sellAmount = parseFloat(sellDollarsInput) || 0;
  const maxSellAmount = ownedValue;
  const canSell = sellAmount > 0 && sellAmount <= maxSellAmount + 0.01;

  // 52-Week Range indicator calculation
  const low52 = stock.fiftyTwoWeekLow || stock.currentPrice * 0.8;
  const high52 = stock.fiftyTwoWeekHigh || stock.currentPrice * 1.2;
  const rangeProgress = Math.max(
    5,
    Math.min(95, ((stock.currentPrice - low52) / (high52 - low52 || 1)) * 100)
  );

  const handleExecuteBuy = () => {
    if (!hasEnoughCash) {
      setFeedbackMsg({
        type: 'error',
        title: isHe
          ? `אין לך מספיק מזומן בקופה (יש לך רק $${child.cashBalance.toFixed(2)})`
          : `Not enough cash in your Piggy Bank (You have $${child.cashBalance.toFixed(2)})`,
        lesson: isHe
          ? 'כדי לקנות עוד מניות, בקש מההורה להפקיד דמי כיס לקופת החיסכון שלך.'
          : 'To buy more shares, ask your parent to deposit allowance into your Piggy Bank.',
      });
      return;
    }

    const result = portfolioEngine.buyStock(child.id, stock.ticker, { dollarAmount: buyAmount });
    if (result.success) {
      soundService.playTradeSuccess();
      onTradeComplete({
        action: 'buy',
        stockName: stock.name,
        amount: buyAmount,
      });
      onClose();
    } else {
      setFeedbackMsg({
        type: 'error',
        title: result.error || 'Failed to buy.',
        lesson: '',
      });
    }
  };

  const handleExecuteSell = () => {
    if (!canSell) {
      setFeedbackMsg({
        type: 'error',
        title: isHe ? `ניתן למכור עד $${maxSellAmount.toFixed(2)}` : `You can only sell up to $${maxSellAmount.toFixed(2)}`,
        lesson: '',
      });
      return;
    }

    const sharesToSell = Number((sellAmount / stock.currentPrice).toFixed(4));
    const result = portfolioEngine.sellStock(child.id, stock.ticker, sharesToSell);
    if (result.success) {
      soundService.playCashRegister();
      onTradeComplete({
        action: 'sell',
        stockName: stock.name,
        amount: sellAmount,
      });
      onClose();
    } else {
      setFeedbackMsg({
        type: 'error',
        title: result.error || 'Failed to sell.',
        lesson: '',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-white rounded-3xl max-w-3xl lg:max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-slate-900">
        
        {/* Pinned Sticky Header - Always Accessible, Never Scrolls Away */}
        <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center gap-3.5">
            <StockLogo
              ticker={stock.ticker}
              name={stock.name}
              emoji={stock.emoji}
              domain={stock.domain}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {stock.name}
                </h3>
                <span className="text-xs font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                  {stock.ticker}
                </span>
              </div>
              <div className="flex items-center gap-2.5 mt-1" dir="ltr">
                <span className="text-sm sm:text-base font-black text-slate-900">
                  {formatCurrency(stock.currentPrice)}
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    formatGainLoss(stock.dailyChange, stock.dailyChangePercent).badgeClasses
                  }`}
                >
                  {formatGainLoss(stock.dailyChange, stock.dailyChangePercent).combined}
                </span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            aria-label="Close"
            className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Body Content with Sleek Custom Scrollbar */}
        <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6 space-y-6 custom-scrollbar">
          {/* 52-Week High/Low Bar */}
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between gap-3">
            <span className="shrink-0 font-bold text-slate-500">
              {isHe ? 'שפל שנתי:' : '52W Low:'} ${low52.toFixed(1)}
            </span>
            <div className="flex-1 relative h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                style={{ width: `${rangeProgress}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
              />
            </div>
            <span className="shrink-0 font-bold text-slate-500">
              {isHe ? 'שיא שנתי:' : '52W High:'} ${high52.toFixed(1)}
            </span>
          </div>

          {/* Feedback & Market Learning Message */}
          {feedbackMsg && (
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm animate-in fade-in space-y-1.5 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                  : 'bg-rose-50 text-rose-950 border border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-black">
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{feedbackMsg.title}</span>
              </div>
              {feedbackMsg.lesson && (
                <p className="text-xs font-medium text-slate-700 pl-7 rtl:pl-0 rtl:pr-7 leading-relaxed">
                  {feedbackMsg.lesson}
                </p>
              )}
            </div>
          )}

          {/* 2. Interactive Performance Graph */}
          <StockMonthChart stock={stock} />

          {/* 3. Four Economic Indicators */}
          <StockKidIndicators stock={stock} />

          {/* 4 & 5 & 6 & 7. Company Details & Market Insights Grid */}
          <div className="space-y-4">
            {/* Top Row: What They Do (Left) & Historical Behavior (Right) - Equal Height */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
              {/* What They Do & How They Make Money */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-slate-700 leading-relaxed flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="font-bold text-blue-900 block text-xs uppercase tracking-wider">
                    {isHe ? 'מה החברה עושה ואיך היא מרוויחה' : 'What They Do & How They Earn Money'}
                  </span>
                  <p>{description}</p>
                  <p className="text-slate-600 font-semibold">{howTheyMakeMoney}</p>
                </div>

                {/* Recognizable Products */}
                <div className="pt-2 border-t border-blue-100/80">
                  <span className="text-[11px] font-bold text-blue-900 block mb-1.5">
                    {isHe ? 'מוצרים מפורסמים של החברה:' : 'Famous Products & Services:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {extendedDetails.famousProducts.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg bg-white text-slate-800 font-bold text-[11px] border border-blue-200/80 shadow-2xs"
                      >
                        {isHe ? p.he : p.en}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Past Historical Behavior & Investor Lesson */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-blue-50/90 border border-indigo-200 shadow-2xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="text-indigo-950 font-bold text-xs uppercase tracking-wider">
                    <span>
                      {isHe ? 'התנהגות עבר ושיעור למשקיע' : 'Historical Behavior & Market Lesson'}
                    </span>
                  </div>

                  <h5 className="font-extrabold text-sm text-indigo-900">
                    {isHe ? extendedDetails.pastBehavior.headline.he : extendedDetails.pastBehavior.headline.en}
                  </h5>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {isHe ? extendedDetails.pastBehavior.story.he : extendedDetails.pastBehavior.story.en}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/95 border border-indigo-200/80 text-xs font-bold text-indigo-950">
                  <span>
                    <strong>{isHe ? 'השיעור למשקיע:' : 'Key Lesson:'}</strong>{' '}
                    {isHe ? extendedDetails.pastBehavior.lesson.he : extendedDetails.pastBehavior.lesson.en}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Story of Company (Left) & Superpower vs Watch-Out (Right) - Equal Height */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
              {/* Origin Story */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-2xs flex flex-col">
                <div className="mb-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <span>{isHe ? `הסיפור של ${stock.name}` : `The Story of ${stock.name}`}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium flex-1">
                  {history}
                </p>
              </div>

              {/* Superpower & Watch-Out Split Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs flex flex-col">
                  <div className="font-bold text-emerald-900 mb-1.5 uppercase tracking-wider">
                    <span>{isHe ? 'כוח עיקרי של החברה' : 'Company Superpower'}</span>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed flex-1">
                    {isHe ? extendedDetails.superpower.he : extendedDetails.superpower.en}
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs flex flex-col">
                  <div className="font-bold text-rose-900 mb-1.5 uppercase tracking-wider">
                    <span>{isHe ? 'סיכון שחשוב להכיר' : 'Risk & Watch-Out'}</span>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed flex-1">
                    {isHe ? extendedDetails.watchOut.he : extendedDetails.watchOut.en}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 8. BUY & SELL TRADING SECTION (Embedded Directly in the Page) */}
        <div className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-sm text-slate-900">
              {isHe ? 'מסחר במניה:' : 'Trade this Stock:'}
            </span>

            {/* Buy vs Sell Action Switcher */}
            {ownedShares > 0 && (
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
                <button
                  onClick={() => {
                    soundService.playClick();
                    setTradeAction('buy');
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    tradeAction === 'buy'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isHe ? 'קנה' : 'Buy'}
                </button>
                <button
                  onClick={() => {
                    soundService.playClick();
                    setTradeAction('sell');
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    tradeAction === 'sell'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isHe ? `מכור ($${ownedValue.toFixed(2)})` : `Sell ($${ownedValue.toFixed(2)})`}
                </button>
              </div>
            )}
          </div>

          {tradeAction === 'buy' || ownedShares <= 0 ? (
            /* BUY FLOW */
            <div className="space-y-3.5">
              {/* Available Cash Box */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm">
                <span className="font-bold text-slate-700">
                  {isHe ? 'מזומן זמין בקופת החיסכון:' : 'Available in your Piggy Bank:'}
                </span>
                <span className="text-base font-extrabold text-emerald-600">
                  ${child.cashBalance.toFixed(2)}
                </span>
              </div>

              {/* Input Dollars */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                  {isHe ? 'כמה דולרים תרצה להשקיע?' : 'How many dollars do you want to invest?'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={dollarsInput}
                    onChange={(e) => setDollarsInput(e.target.value)}
                    className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 text-xl font-extrabold text-slate-900 bg-white border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-hidden transition-all text-center"
                  />
                </div>
              </div>

              {/* Quick Pick Pills */}
              <div className="flex gap-2">
                {[5, 10, 20, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      soundService.playClick();
                      setDollarsInput(preset.toString());
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                      dollarsInput === preset.toString()
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              {/* Remaining Cash Notice */}
              {buyAmount > 0 && (
                <div className="text-xs text-center text-slate-500">
                  {isHe ? 'יישאר לך בקופת החיסכון: ' : 'You will have remaining: '}
                  <strong className={remainingCash >= 0 ? 'text-slate-800' : 'text-rose-600'}>
                    ${remainingCash.toFixed(2)}
                  </strong>
                </div>
              )}

              {/* Big Buy Button */}
              <button
                onClick={handleExecuteBuy}
                disabled={!hasEnoughCash}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-base shadow-md transition-all ${
                  hasEnoughCash
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white transform hover:scale-[1.01] active:scale-[0.98]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isHe
                  ? `אישור קנייה (בסך $${buyAmount.toFixed(2)})`
                  : `Confirm Buy ($${buyAmount.toFixed(2)})`}
              </button>
            </div>
          ) : (
            /* SELL FLOW */
            <div className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm">
                <span className="font-bold text-slate-700 block mb-0.5">
                  {isHe ? 'המניות שיש לך במניה זו:' : 'Your current investment in this stock:'}
                </span>
                <span className="text-base font-extrabold text-amber-700">
                  ${ownedValue.toFixed(2)}
                </span>
              </div>

              {/* Input Dollars or Quick Sell ALL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {isHe ? 'סכום בדולרים למכירה:' : 'Dollars to Cash Out:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playClick();
                      setSellDollarsInput(ownedValue.toFixed(2));
                    }}
                    className={`text-xs px-2.5 py-0.5 rounded-lg font-bold border transition-colors ${
                      sellDollarsInput === ownedValue.toFixed(2)
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {isHe ? `מכור הכל (100% - $${ownedValue.toFixed(2)})` : `Sell All (100% - $${ownedValue.toFixed(2)})`}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    max={ownedValue}
                    placeholder={`Max $${ownedValue.toFixed(2)}`}
                    value={sellDollarsInput}
                    onChange={(e) => setSellDollarsInput(e.target.value)}
                    className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 text-xl font-extrabold text-slate-900 bg-white border-2 border-slate-200 rounded-2xl focus:border-rose-500 focus:outline-hidden transition-all text-center"
                  />
                </div>
              </div>

              <button
                onClick={handleExecuteSell}
                disabled={!canSell}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-base shadow-md transition-all ${
                  canSell
                    ? 'bg-rose-600 hover:bg-rose-700 text-white transform hover:scale-[1.01]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isHe
                  ? `אישור מכירה ($${sellAmount.toFixed(2)})`
                  : `Confirm Sale ($${sellAmount.toFixed(2)})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};
