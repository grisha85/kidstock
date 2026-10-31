import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ChildProfile, AccountStatus, AggregatedHolding, StockCategory } from '../types';
import { marketService } from '../services/marketService';
import { soundService } from '../services/soundService';
import { GrowthHistoryChart } from './GrowthHistoryChart';
import { StockLogo } from './StockLogo';
import { MarketExplainerCard } from './MarketExplainerCard';
import { formatGainLoss, formatCurrency } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Plus,
  Layers,
} from 'lucide-react';

interface KidDashboardProps {
  child: ChildProfile;
  accountStatus: AccountStatus;
  holdings: AggregatedHolding[];
  onSelectStock: (ticker: string) => void;
  onOpenHistory: () => void;
  showTourBanner?: boolean;
  onStartTour?: () => void;
  onDismissTour?: () => void;
}

export const KidDashboard: React.FC<KidDashboardProps> = ({
  child,
  accountStatus,
  holdings,
  onSelectStock,
  showTourBanner,
  onStartTour,
  onDismissTour,
}) => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<StockCategory>('gaming');
  const [expandedTickers, setExpandedTickers] = useState<Record<string, boolean>>({});

  const toggleExpand = (ticker: string) => {
    soundService.playClick();
    setExpandedTickers((prev) => ({
      ...prev,
      [ticker]: !prev[ticker],
    }));
  };

  const isNetProfitPositive = accountStatus.lifetimeNetGainLoss >= 0;

  // Categories list with big friendly labels & kid-friendly group summaries
  const categories: Array<{
    id: StockCategory;
    label: { en: string; he: string };
    emoji: string;
    summary: { en: string; he: string };
  }> = [
    {
      id: 'gaming',
      label: { en: 'Gaming & Toys', he: 'משחקים וגיימינג' },
      emoji: '🎮',
      summary: {
        en: 'The video games, consoles, and fun toy brands you love! These companies make money when players buy consoles, games, Robux coins, and avatar skins.',
        he: 'משחקי וידאו, קונסולות וצעצועים שאתם הכי אוהבים! החברות האלו מרוויחות כששחקנים קונים קונסולות, משחקים, מטבעות רובאקס וסקינים.',
      },
    },
    {
      id: 'tech',
      label: { en: 'Tech & Phones', he: 'טלפונים וטכנולוגיה' },
      emoji: '📱',
      summary: {
        en: 'The tech giants that build smartphones, tablets, streaming apps, search engines, and fast graphics chips used by billions of people.',
        he: 'ענקיות הטכנולוגיה שמייצרות את הסמארטפונים, הטאבלטים, אפליקציות הסטרימינג, מנועי החיפוש והשבבים שמיליארדי אנשים משתמשים בהם מדי יום.',
      },
    },
    {
      id: 'treats',
      label: { en: 'Treats & Food', he: 'חטיפים וממתקים' },
      emoji: '🍔',
      summary: {
        en: 'Delicious snacks, pizza, cold drinks, burgers, and chocolate! Sold in millions of supermarkets, drive-thrus, and restaurants every day.',
        he: 'חטיפים טעימים, פיצות, משקאות קלים, המבורגרים ושוקולד! נמכרים במיליוני סופרמרקטים, מסעדות וחנויות בכל יום.',
      },
    },
    {
      id: 'fashion',
      label: { en: 'Shoes & Style', he: 'נעליים ואופנה' },
      emoji: '👟',
      summary: {
        en: 'Famous sneakers, sportswear, squishy Crocs, and cool clothes that kids, athletes, and teenagers wear at school and sports.',
        he: 'נעלי ספורט מפורסמות, סניקרס, כפכפי קרוקס ובגדים מגניבים שילדים, ספורטאים ובני נוער לובשים בבית הספר ובספורט.',
      },
    },
    {
      id: 'movies',
      label: { en: 'Movies & Parks', he: 'סרטים ופארקים' },
      emoji: '🍿',
      summary: {
        en: 'Movie studios, magical Disneyland theme parks, superheroes, cartoons, cinemas, and fun books that bring imagination to life.',
        he: 'אולפני קולנוע, פארקי דיסנילנד קסומים, גיבורי-על, סרטים מצוירים, בתי קולנוע וספרים שמעירים את הדמיון לחיים.',
      },
    },
    {
      id: 'cars',
      label: { en: 'Cars & Future', he: 'מכוניות ותחבורה' },
      emoji: '🚗',
      summary: {
        en: 'Electric cars with high-tech software, modern trucks, and smart rides changing transportation.',
        he: 'מכוניות חשמליות מתקדמות, טנדרים רבי עוצמה ונסיעות חכמות שמשנים את עולם התחבורה.',
      },
    },
    {
      id: 'stores',
      label: { en: 'Mega Stores & Travel', he: 'חנויות ענק וחופשות' },
      emoji: '🛒',
      summary: {
        en: 'World-famous superstores, gigantic wholesale warehouses, and vacation homes where families shop and travel.',
        he: 'רשתות קניות ענקיות, מחסני ענק ומקומות נופש שבהם משפחות קונות ומטיילות.',
      },
    },
    {
      id: 'etfs',
      label: { en: 'Magic Baskets', he: 'תעודות סל' },
      emoji: '🌍',
      summary: {
        en: 'Magic Baskets (ETFs) hold hundreds of top world companies together in one slice! If one company dips, the others protect you—the safest way to invest!',
        he: 'תעודות סל שמחזיקות מאות חברות מובילות ביחד ביחידה אחת! אם חברה אחת יורדת, האחרות מאזנות אותה—הדרך החכמה והבטוחה להשקיע!',
      },
    },
  ];

  // Get stocks for the selected category
  const categoryStocks = marketService.searchStocks('', selectedCategory);
  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-900 pb-16">
      {/* First-Visit Quick Tour Prompt Banner (removed once clicked or dismissed) */}
      {showTourBanner && onStartTour && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div>
            <h3 className="text-base sm:text-lg font-black leading-tight text-white">
              {t.howItWorks.firstVisitBannerTitle}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 font-medium mt-0.5">
              {t.howItWorks.firstVisitBannerText}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                soundService.playClick();
                onDismissTour?.();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {t.howItWorks.firstVisitDismissBtn}
            </button>
            <button
              onClick={() => {
                soundService.playTradeSuccess();
                onStartTour();
              }}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-black text-xs shadow-md hover:bg-blue-50 transition-all hover:scale-105"
            >
              {t.howItWorks.firstVisitStartBtn}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: THE BALANCE + GRAPH OF HISTORY
         ========================================================================= */}
      <div data-tour="total-balance" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Total Balance & Piggy Bank */}
          <div className="space-y-4">
            {/* Total Balance */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  {language === 'he' ? 'שווי תיק כולל' : 'Total Balance'}
                </span>
              </div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                ${accountStatus.totalNetWorth.toFixed(2)}
              </div>
            </div>

            {/* Quick Summary Pill: Piggy Bank Cash & Profit */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Cash in Piggy Bank */}
              <div data-tour="piggy-cash" className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800">
                  {language === 'he' ? 'מזומן בקופה:' : 'Piggy Bank Cash:'}
                </span>
                <span className="text-sm font-black text-emerald-700">
                  ${accountStatus.cashBalance.toFixed(2)}
                </span>
              </div>

              {/* All-time Profit / Loss */}
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border ${
                  isNetProfitPositive
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {isNetProfitPositive ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                )}
                <div className="text-left rtl:text-right">
                  <span className="text-[11px] font-bold block leading-tight">
                    {language === 'he' ? 'רווח/הפסד כולל:' : 'Total Profit:'}
                  </span>
                  <span dir="ltr" className="text-sm font-black block leading-tight">
                    {formatGainLoss(accountStatus.lifetimeNetGainLoss, accountStatus.lifetimeReturnPercent).combined}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Accurate Weekly Growth History Chart */}
          <div className="flex-1 w-full lg:max-w-md">
            <GrowthHistoryChart child={child} accountStatus={accountStatus} />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: CURRENT STOCK TABLE (WITH BATCH BUY EXPANSION)
         ========================================================================= */}
      <div data-tour="stock-holdings" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {language === 'he' ? 'המניות שלך' : 'Your Stocks'}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-600">
              {holdings.length}
            </span>
          </div>
        </div>

        {holdings.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
            <p className="text-sm font-bold text-slate-700">
              {language === 'he' ? 'עדיין לא קנית מניות!' : "You don't own any stocks yet!"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'he'
                ? 'בחר חברה למטה ולחץ על "קנה" כדי לקנות את חלק המניה הראשון שלך!'
                : 'Pick a category below and click Buy to own your first slice!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {holdings.map((h) => {
              const isExpanded = !!expandedTickers[h.ticker];
              const stockData = marketService.getStock(h.ticker);
              const shortDesc = stockData
                ? language === 'he'
                  ? stockData.kidDescription.he
                  : stockData.kidDescription.en
                : '';

              return (
                <div
                  key={h.ticker}
                  className="rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-400 transition-all bg-white"
                >
                  {/* Main Holding Row */}
                  <div
                    onClick={() => toggleExpand(h.ticker)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Left: Original Picture Logo, Name & Short Description */}
                    <div className="flex items-center gap-3.5">
                      <StockLogo
                        ticker={h.ticker}
                        name={h.companyName}
                        emoji={h.emoji}
                        domain={h.domain}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-slate-900">
                            {h.companyName}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold uppercase">
                            {h.ticker}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium line-clamp-1 max-w-sm mt-0.5">
                          {shortDesc}
                        </p>
                      </div>
                    </div>

                    {/* Right: Value, Profit ($ and %), and Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-400 font-bold block">
                          {language === 'he' ? 'שווי שברשותך:' : 'What You Own:'}
                        </span>
                        <span className="text-base sm:text-lg font-black text-slate-900 block">
                          ${h.currentValue.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-bold block mb-0.5">
                          {language === 'he' ? 'רווח/הפסד:' : 'Gain / Loss:'}
                        </span>
                        <div
                          dir="ltr"
                          className={`text-xs sm:text-sm font-black inline-flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap shadow-2xs ${
                            formatGainLoss(h.unrealizedGainLoss, h.gainLossPercent).badgeClasses
                          }`}
                        >
                          <span>{formatGainLoss(h.unrealizedGainLoss, h.gainLossPercent).amountFormatted}</span>
                          <span className="text-[11px] opacity-80 font-bold">
                            ({formatGainLoss(h.unrealizedGainLoss, h.gainLossPercent).percentFormatted})
                          </span>
                        </div>
                      </div>

                      {/* Buy More / Sell Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundService.playClick();
                          onSelectStock(h.ticker);
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-colors shrink-0"
                      >
                        {language === 'he' ? 'קנה / מכור' : 'Buy / Sell'}
                      </button>

                      {/* Expand Chevron */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(h.ticker);
                        }}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Per-Batch Buy Lots Drawer */}
                  {isExpanded && (
                    <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-2 animate-in fade-in duration-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>
                          {language === 'he'
                            ? `מנות קנייה נפרדות (${h.lots.length} רכישות)`
                            : `Individual Buy Batches (${h.lots.length} purchases)`}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {h.lots.map((lot, idx) => {
                          const lotVal = Number((lot.remainingShares * h.currentPrice).toFixed(2));
                          const lotProfit = Number((lotVal - lot.totalCost).toFixed(2));
                          const lotPct = lot.totalCost > 0 ? ((lotProfit / lot.totalCost) * 100).toFixed(1) : '0';

                          return (
                            <div
                              key={lot.id}
                              className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex justify-between items-center"
                            >
                              <div className="flex items-center gap-2">
                                <StockLogo ticker={lot.ticker} name={lot.ticker} size="sm" />
                                <div>
                                  <span className="font-extrabold text-slate-900 block">
                                    {language === 'he' ? `מנה #${h.lots.length - idx}` : `Batch #${h.lots.length - idx}`}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {new Date(lot.buyDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-slate-600 block">
                                  {language === 'he' ? `השקעת $${lot.totalCost.toFixed(2)}` : `Invested $${lot.totalCost.toFixed(2)}`}
                                </span>
                                <span
                                  dir="ltr"
                                  className={`font-black ${formatGainLoss(lotProfit, Number(lotPct)).textClasses}`}
                                >
                                  {formatGainLoss(lotProfit, Number(lotPct)).combined}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 2.5: HOW THE STOCK MARKET WORKS (EDUCATIONAL FOR 10y+ KIDS)
         ========================================================================= */}
      <MarketExplainerCard />

      {/* =========================================================================
          SECTION 3: STOCK MARKET CATALOG (BIG CATEGORY BUTTONS, NO SEARCH)
         ========================================================================= */}
      <div data-tour="stock-market" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {language === 'he' ? 'חנות המניות' : 'Stock Market'}
          </h3>
        </div>

        {/* Big Category Buttons Bar (No Search!) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-6">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const label = language === 'he' ? cat.label.he : cat.label.en;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`p-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all transform flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-center leading-tight">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Category Summary Card */}
        {selectedCategoryObj && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                  {language === 'he' ? selectedCategoryObj.label.he : selectedCategoryObj.label.en}
                </h4>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold">
                  {categoryStocks.length} {language === 'he' ? 'חברות זמינות' : 'Stocks Available'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {language === 'he' ? selectedCategoryObj.summary.he : selectedCategoryObj.summary.en}
              </p>
            </div>
          </div>
        )}

        {/* Stocks Grid for the Selected Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStocks.map((stock) => {
            const desc = language === 'he' ? stock.kidDescription.he : stock.kidDescription.en;

            return (
              <div
                key={stock.ticker}
                onClick={() => {
                  soundService.playClick();
                  onSelectStock(stock.ticker);
                }}
                className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200 hover:border-emerald-500 hover:shadow-lg hover:bg-white transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Picture Logo, Name, Price */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <StockLogo
                        ticker={stock.ticker}
                        name={stock.name}
                        emoji={stock.emoji}
                        domain={stock.domain}
                        size="md"
                        className="group-hover:scale-110 transition-transform shrink-0"
                      />
                      <div>
                        <div className="font-black text-base sm:text-lg text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">
                          {stock.name}
                        </div>
                        <span className="text-xs text-slate-400 font-bold uppercase">
                          {stock.ticker}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-sm text-slate-900">
                        {formatCurrency(stock.currentPrice)}
                      </div>
                      <span
                        dir="ltr"
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          formatGainLoss(stock.dailyChangePercent, stock.dailyChangePercent).badgeClasses
                        }`}
                      >
                        {formatGainLoss(stock.dailyChangePercent, stock.dailyChangePercent).percentFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Super Easy Kid Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
                    {desc}
                  </p>
                </div>

                {/* Big Friendly Buy Button */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {language === 'he' ? 'השקע כל סכום שתרצה' : 'Invest any $ you want'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundService.playClick();
                      onSelectStock(stock.ticker);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-transform group-hover:scale-105"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'he' ? 'קנה' : 'Buy'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
