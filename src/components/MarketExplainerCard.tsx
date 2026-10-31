import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { soundService } from '../services/soundService';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const MarketExplainerCard: React.FC = () => {
  const { language } = useLanguage();
  const isHe = language === 'he';

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'shares' | 'dangers' | 'etfs' | 'created' | 'marketCap' | 'helping' | 'auction'
  >('shares');

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
      <div
        onClick={() => {
          soundService.playClick();
          setIsExpanded(!isExpanded);
        }}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-extrabold text-sm">
            %
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {isHe ? 'איך שוק ההון עובד?' : 'How Does the Stock Market Work?'}
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              {isHe
                ? 'מדריך למשקיעים צעירים: מהי מניה, סיכונים ופיזור השקעות, תעודות סל (ETFs) והנפקות'
                : 'Guide for 10y+ investors: What is a share, managing risks, ETFs, and market growth'}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
          {/* Sub-Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl text-xs font-bold">
            <button
              onClick={() => {
                soundService.playClick();
                setActiveTab('shares');
              }}
              className={`py-2 px-1.5 rounded-xl transition-all text-center ${
                activeTab === 'shares'
                  ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isHe ? '1. מה זו מניה?' : '1. What is a Share?'}
            </button>
            <button
              onClick={() => {
                soundService.playClick();
                setActiveTab('dangers');
              }}
              className={`py-2 px-1.5 rounded-xl transition-all text-center ${
                activeTab === 'dangers'
                  ? 'bg-white text-rose-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isHe ? '2. סיכונים ופיזור' : '2. Risks & Diversification'}
            </button>
            <button
              onClick={() => {
                soundService.playClick();
                setActiveTab('etfs');
              }}
              className={`py-2 px-1.5 rounded-xl transition-all text-center ${
                activeTab === 'etfs'
                  ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isHe ? '3. מהי תעודת סל?' : '3. What is an ETF?'}
            </button>
            <button
              onClick={() => {
                soundService.playClick();
                setActiveTab('created');
              }}
              className={`py-2 px-1.5 rounded-xl transition-all text-center ${
                activeTab === 'created'
                  ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isHe ? '4. איך מניות נוצרות?' : '4. How Stocks Are Created'}
            </button>
            <button
              onClick={() => {
                soundService.playClick();
                setActiveTab('marketCap');
              }}
              className={`py-2 px-1.5 rounded-xl transition-all text-center ${
                activeTab === 'marketCap'
                  ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isHe ? '5. שווי שוק' : '5. Market Cap'}
            </button>
            <button
              onClick={() => {
                soundService.playClick();
                setActiveTab('helping');
              }}
              className={`py-2 px-1.5 rounded-xl transition-all text-center ${
                activeTab === 'helping'
                  ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isHe ? '6. איך הבורסה עוזרת?' : '6. Helping Companies'}
            </button>
            <button
              onClick={() => {
                soundService.playClick();
                setActiveTab('auction');
              }}
              className={`py-2 px-1.5 rounded-xl transition-all text-center ${
                activeTab === 'auction'
                  ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isHe ? '7. שוק המסחר' : '7. Trading Market'}
            </button>
          </div>

          {/* Tab Content with Detailed Real-World Examples */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
            {activeTab === 'shares' && (
              <>
                <p className="font-extrabold text-slate-900 text-sm">
                  {isHe
                    ? '1. מהי מניה? (חלק בעלות אמיתי בחברה):'
                    : '1. What is a Share? (True Company Co-Ownership):'}
                </p>
                <p>
                  {isHe
                    ? 'חברות גדולות מחולקות למיליוני "לבנים" קטנות של בעלות שנקראות מניות (Shares). כשאתה קונה אפילו מניה אחת או שבריר מניה, אתה הופך לבעלים שותף רשמי של החברה עם זכות ליהנות מרווחיה.'
                    : 'Large corporations are divided into millions of tiny ownership slices called shares. When you buy even 1 share (or a fraction of a share), you become a legal co-owner (shareholder) entitled to a cut of the company’s future earnings.'}
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-blue-900 block">
                    {isHe ? 'דוגמה מהעולם האמיתי (פיצרייה שכונתית):' : 'Real-World Example (The Pizza Shop):'}
                  </span>
                  <p className="text-slate-600">
                    {isHe
                      ? 'דמיין שפיצרייה מקומית שווה 1,000$ ומחולקת ל-100 מניות של 10$ כל אחת. אם תקנה 5 מניות ב-50$, אתה הבעלים הרשמי של 5% מכל התנורים, הגבינה, והרווחים שהפיצרייה מייצרת!'
                      : 'Imagine a pizza shop valued at $1,000 that splits into 100 shares worth $10 each. If you buy 5 shares for $50, you legally own 5% of all the ovens, dough, brand, and profits the pizzeria makes!'}
                  </p>
                </div>
              </>
            )}

            {activeTab === 'dangers' && (
              <>
                <p className="font-extrabold text-slate-900 text-sm">
                  {isHe
                    ? '2. מהם הסיכונים בשוק ההון וכיצד מצמצמים אותם?'
                    : '2. Stock Market Risks & How to Reduce Them:'}
                </p>
                <p>
                  {isHe
                    ? 'הסכנה הגדולה ביותר למשקיע היא לשים את כל הכסף בחברה אחת בלבד ("לשים את כל הביצים בסל אחד"). אם החברה הזו מתחרה בבעיות, מוציאה משחק כושל או מאבדת לקוחות, כל החיסכון שלך יצנח בחדות.'
                    : 'The biggest danger in investing is putting all your money into a single company ("putting all your eggs in one basket"). If that one company hits hard times, releases an unpopular game, or loses customers, your entire savings takes a painful hit.'}
                </p>
                <p>
                  {isHe
                    ? 'איך מפחיתים את הסיכון? באמצעות פיזור השקעות (Diversification):'
                    : 'How do smart investors protect themselves? Through Diversification:'}
                </p>
                <div className="space-y-1.5 pl-2 rtl:pl-0 rtl:pr-2 text-xs">
                  <p>
                    <strong>{isHe ? '• פיזור בין ענפים שונים:' : '• Spread across different industries:'}</strong>{' '}
                    {isHe
                      ? 'השקע במשחקים, במזון, בטכנולוגיה, באופנה ובבריאות. אם שוק המשחקים חווה חודש שקט, חברות המזון והסמארטפונים שלך עדיין מרוויחות ומאזנות את התיק!'
                      : 'Own gaming, food, tech, sneakers, and healthcare. If gaming has a slow month, your food and phone companies are still profitable and keep your balance safe!'}
                  </p>
                  <p>
                    <strong>{isHe ? '• פיזור בין מדינות שונות:' : '• Spread across different countries:'}</strong>{' '}
                    {isHe
                      ? 'קנה חברות מארה"ב (אפל), מיפן (נינטנדו, סוני) ומאירופה (אדידס, ספוטיפיי, פררארי). כך אתה מוגן אם כלכלה של מדינה אחת מאטה.'
                      : 'Invest in companies from the US (Apple), Japan (Nintendo, Sony), and Europe (Adidas, Spotify, Ferrari). That way, an economic slowdown in one nation doesn\'t sink your wealth.'}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-blue-900 block">
                    {isHe ? 'דוגמה מהעולם האמיתי (גשם מול משקפי שמש):' : 'Real-World Example (Umbrellas vs Sunglasses):'}
                  </span>
                  <p className="text-slate-600">
                    {isHe
                      ? 'אם חנות מוכרת רק משקפי שמש, היא תרוויח המון בקיץ אבל תפסיד כסף בחורף גשום. אבל אם היא מוכרת גם משקפי שמש וגם מטריות, היא מרוויחה בכל מזג אוויר! זה בדיוק הרעיון של פיזור השקעות.'
                      : 'If a shop only sells sunglasses, it makes a fortune on sunny days but goes broke during a rainy month. But if the shop sells both sunglasses AND umbrellas, it stays profitable in every kind of weather! That is the core superpower of diversification.'}
                  </p>
                </div>
              </>
            )}

            {activeTab === 'etfs' && (
              <>
                <p className="font-extrabold text-slate-900 text-sm">
                  {isHe
                    ? '3. מהי תעודת סל (מדד / ETF) ומדוע היא נחשבת להשקעה החכמה ביותר?'
                    : '3. What is an ETF (Index Fund) & Why is it the Smartest Way to Invest?'}
                </p>
                <p>
                  {isHe
                    ? 'תעודת סל (ETF - Exchange-Traded Fund) היא "סל השקעות" ענק שמכיל בתוכו מאות חברות שונות בבת אחת. במקום לקנות מניה בודדת של נינטנדו ואז מניה של נייקי, אתה קונה יחידה אחת של תעודת סל והופך לבעלים של 500 חברות ענק בבת אחת!'
                    : 'An ETF (Exchange-Traded Fund) is a giant basket that holds hundreds of different top companies inside a single share. Instead of manually buying Nintendo, Apple, and Nike one by one, buying 1 share of an ETF makes you an instant co-owner of 500 leading corporations all together!'}
                </p>
                <div className="space-y-1.5 pl-2 rtl:pl-0 rtl:pr-2 text-xs">
                  <p>
                    <strong>{isHe ? '• פיזור אוטומטי מקסימלי:' : '• Instant bulletproof diversification:'}</strong>{' '}
                    {isHe
                      ? 'גם אם חברה אחת בתוך תעודת הסל נכשלת או פושטת רגל, יש עוד 499 חברות מוצלחות שדוחפות את הסל קדימה.'
                      : 'Even if one company inside the basket has a terrible year or goes bankrupt, 499 other thriving corporations carry the basket forward.'}
                  </p>
                  <p>
                    <strong>{isHe ? '• ניקוי עצמי:' : '• Self-cleaning mechanism:'}</strong>{' '}
                    {isHe
                      ? 'חברות חלשות שנכשלות נפלטות מתעודת הסל באופן אוטומטי, ובמקומן נכנסות החברות החדשניות והחזקות ביותר בעולם.'
                      : 'Companies that stop growing get kicked out of the index automatically, and the fastest-growing new leaders take their place.'}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-blue-900 block">
                    {isHe ? 'דוגמה מהעולם האמיתי (תעודת סל על מדד S&P 500 / SPY):' : 'Real-World Example (The S&P 500 / SPY):'}
                  </span>
                  <p className="text-slate-600">
                    {isHe
                      ? 'המשקיע המפורסם בעולם, וורן באפט, ממליץ לכל אדם להשקיע בתעודת סל העוקבת אחרי מדד S&P 500 (סימול SPY). על פני 100 השנים האחרונות, למרות מלחמות ומשברים, המדד הניב בממוצע כ-10% תשואה בכל שנה, משום שהוא רותם את כוחה של הכלכלה כולה!'
                      : 'Legendary investor Warren Buffett famously advises everyone to invest in the S&P 500 (ticker: SPY). Over the past 100 years, despite wars, depressions, and panics, this basket averaged ~10% gains per year because it tracks human progress as a whole!'}
                  </p>
                </div>
              </>
            )}

            {activeTab === 'created' && (
              <>
                <p className="font-extrabold text-slate-900 text-sm">
                  {isHe
                    ? '2. איך מניות נוצרות בעולם האמיתי (אירוע ה-IPO):'
                    : '2. How Stocks Are Created (The IPO Milestone):'}
                </p>
                <p>
                  {isHe
                    ? 'חברה מתחילה כעסק פרטי קטן. כשהיא זקוקה לסכומי כסף ענקיים כדי לפתוח סניפים ולפתח מוצרים בכל העולם, היא פונה לבורסה ומציעה מניות לציבור הרחב בפעם הראשונה. אירוע זה נקרא IPO (הנפקה ראשונה לציבור).'
                    : 'Every giant corporation began as a private startup. When the founders need massive capital to scale worldwide, they register with the exchange and offer shares to the public for the first time. This event is called an IPO (Initial Public Offering).'}
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-blue-900 block">
                    {isHe ? 'דוגמה מהעולם האמיתי (רובלוקס במוסך מול הבורסה):' : 'Real-World Example (Roblox in 2021):'}
                  </span>
                  <p className="text-slate-600">
                    {isHe
                      ? 'במשך שנים, רובלוקס הייתה חברה פרטית שאי אפשר לקנות בה מניות. בשנת 2021 החברה ביצעה IPO בבורסת ניו יורק (סימול RBLX) וגייסה מיליארדי דולרים מהציבור. מאותו יום, כל ילד או מבוגר יכול לקנות מניה של רובלוקס באפליקציה!'
                      : 'For years, Roblox was a private company—nobody could buy its shares. In 2021, Roblox launched its IPO on the New York Stock Exchange (ticker: RBLX), raising over $1 Billion from public investors. From that exact day, anyone in the world could buy a slice of Roblox on their phone!'}
                  </p>
                </div>
              </>
            )}

            {activeTab === 'marketCap' && (
              <>
                <p className="font-extrabold text-slate-900 text-sm">
                  {isHe
                    ? '3. כיצד נקבע שווי שוק (Market Cap) של חברה?'
                    : '3. How a Company\'s Market Cap is Decided:'}
                </p>
                <p>
                  {isHe
                    ? 'שווי שוק מייצג את המחיר הכולל לקניית כל החברה כולה. הנוסחה פשוטה וברורה:'
                    : 'Market Cap represents the total dollar price tag of the entire company. It is calculated with a simple formula:'}
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900">
                  {isHe
                    ? 'שווי שוק = (מחיר מניה בודדת) × (סך כל המניות הקיימות)'
                    : 'Market Cap = (Live Share Price) × (Total Number of Shares)'}
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-blue-900 block">
                    {isHe ? 'דוגמה מהעולם האמיתי (טסלה):' : 'Real-World Example (Tesla):'}
                  </span>
                  <p className="text-slate-600">
                    {isHe
                      ? 'לטסלה יש כ-3.2 מיליארד מניות. אם מחיר מניה אחת בבורסה עומד על 250$, שווי השוק הכולל של טסלה הוא 800 מיליארד דולר (0.8T$). אם המניה תעלה ל-300$, שווי החברה כולה יזנק לכמעט 1 טריליון דולר!'
                      : 'Tesla has roughly 3.2 billion shares. When 1 share trades for $250 on the market, Tesla’s total market cap is $800 Billion. If excitement drives the share price to $300, the company’s total valuation shoots up to almost $1 Trillion!'}
                  </p>
                </div>
              </>
            )}

            {activeTab === 'helping' && (
              <>
                <p className="font-extrabold text-slate-900 text-sm">
                  {isHe
                    ? '4. כיצד שוק ההון עוזר לחברות לבנות את העתיד?'
                    : '4. How the Stock Market Helps Companies Build the Future:'}
                </p>
                <p>
                  {isHe
                    ? 'בלי שוק ההון, בניית חידושים טכנולוגיים עצומים הייתה כמעט בלתי אפשרית. על ידי מכירת מניות למשקיעים, חברות מגייסות מיליארדי דולרים לבניית מפעלים, תשלום משכורות למהנדסים ולמדענים, פיתוח שבבי בינה מלאכותית, ייצור מכוניות חשמליות ופיתוח תרופות מצילות חיים. בתמורה, המשקיעים שמממנים את הצמיחה נהנים מהרווחים כשהחברה מצליחה.'
                    : 'Without the stock market, building massive innovations would be nearly impossible. By issuing shares, companies raise billions of dollars from investors to build factories, hire engineers, develop AI chips, manufacture electric vehicles, and discover lifesaving medicines. In return, investors who funded the company share in its future profits as it succeeds.'}
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-blue-900 block">
                    {isHe ? 'דוגמה מהעולם האמיתי (מהפכת ה-AI של אנבידיה):' : 'Real-World Example (NVIDIA & AI Supercomputers):'}
                  </span>
                  <p className="text-slate-600">
                    {isHe
                      ? 'פיתוח שבבי הבינה המלאכותית המתקדמים ביותר בעולם עלה לאנבידיה עשרות מיליארדי דולרים לאורך עשור. הכסף שהגיע ממיליוני משקיעים בבורסה אפשר לה להעסיק אלפי מתכנתים ולבנות את מחשבי העל שמפעילים כיום את מודלי ה-AI המובילים בעולם!'
                      : 'Developing cutting-edge AI chips cost NVIDIA tens of billions of dollars over a decade. Capital raised from millions of stock market investors allowed NVIDIA to hire thousands of top scientists and build the supercomputing chips that power the world’s AI revolution today!'}
                  </p>
                </div>
              </>
            )}

            {activeTab === 'auction' && (
              <>
                <p className="font-extrabold text-slate-900 text-sm">
                  {isHe
                    ? '5. שוק המסחר: מכירה פומבית עולמית רציפה:'
                    : '5. The Trading Market: A Global Continuous Auction:'}
                </p>
                <p>
                  {isHe
                    ? 'שוק ההון מפגיש בכל שנייה מיליוני קונים ומוכרים מרחבי העולם. כשאתה לוחץ על "קנה", הפקודה שלך מותאמת מיד למישהו שמוכר מניות באותו רגע בדיוק. המחיר נקבע על פי היצע וביקוש.'
                    : 'The stock exchange matches millions of buyers and sellers worldwide every single second. When you tap "Buy", your order is instantly matched with another investor selling their shares at that exact moment. Prices move based strictly on supply and demand.'}
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-blue-900 block">
                    {isHe ? 'דוגמה מהעולם האמיתי (קונסולת נינטנדו חדשה):' : 'Real-World Example (Nintendo Switch 2 Release):'}
                  </span>
                  <p className="text-slate-600">
                    {isHe
                      ? 'אם נינטנדו מכריזה על קונסולת Switch 2 חדשה ומיליוני הורים קונים אותה לחג, משקיעים יודעים שהרווחים של נינטנדו יזנקו. המוני קונים מגיעים לבורסה, הביקוש עולה על ההיצע, ומחיר המניה מטפס מעלה!'
                      : 'If Nintendo announces a brand-new Switch 2 console and millions of players pre-order it, investors anticipate huge profits. Thousands of investors rush to buy Nintendo shares on the market, driving demand higher than supply and pushing the share price up!'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
