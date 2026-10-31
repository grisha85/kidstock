export type StockCategory =
  | 'gaming'
  | 'tech'
  | 'treats'
  | 'fashion'
  | 'movies'
  | 'cars'
  | 'stores'
  | 'etfs';

export type VolatilityRating = 'turtle' | 'dolphin' | 'cheetah';
export type MarketCapCategory = 'puppy' | 'lion' | 'giant' | 'mega_titan';

export interface LocalizedText {
  en: string;
  he: string;
}

export interface StockPastBehavior {
  headline: LocalizedText;
  story: LocalizedText;
  lesson: LocalizedText;
}

export interface StockInfo {
  ticker: string;
  name: string;
  category: StockCategory;
  emoji: string;
  domain?: string;
  color: string;
  currentPrice: number;
  previousClose: number;
  dailyChange: number;
  dailyChangePercent: number;
  marketCap: number; // in billions USD
  marketCapCategory: MarketCapCategory;
  peRatio: number;
  dividendYield: number; // percentage, e.g. 2.5
  volatility: VolatilityRating;
  sparkline: number[]; // recent 10-20 points for micro chart
  kidDescription: LocalizedText;
  howTheyMakeMoney: LocalizedText;
  history?: LocalizedText;
  superpower?: LocalizedText;
  watchOut?: LocalizedText;
  famousProducts?: LocalizedText[];
  pastBehavior?: StockPastBehavior;
  yearlyGrowthPercent?: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export interface BuyLot {
  id: string;
  childId: string;
  ticker: string;
  buyDate: string; // ISO string
  originalShares: number;
  remainingShares: number;
  buyPrice: number;
  totalCost: number; // remainingShares * buyPrice
  note: string;
}

export interface AggregatedHolding {
  ticker: string;
  companyName: string;
  category: StockCategory;
  emoji: string;
  domain?: string;
  totalShares: number;
  avgBuyPrice: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  unrealizedGainLoss: number;
  gainLossPercent: number;
  lots: BuyLot[];
}

export type TransactionType =
  | 'DEPOSIT_CASH'
  | 'WITHDRAW_CASH'
  | 'BUY_STOCK'
  | 'SELL_STOCK';

export interface TransactionRecord {
  id: string;
  timestamp: string; // ISO string
  childId: string;
  type: TransactionType;
  ticker?: string;
  shares?: number;
  pricePerShare?: number;
  totalAmount: number; // positive for deposit/sale credit, negative for withdrawal/buy debit
  realizedGainLoss?: number; // for SELL_STOCK
  postBalance: number;
  note: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  googleEmail?: string;
  avatar: string; // emoji or avatar identifier
  color: string; // theme color for avatar ring
  cashBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  createdAt: string;
}

export interface AccountStatus {
  cashBalance: number;
  investedValue: number;
  totalNetWorth: number;
  todayGainLoss: number;
  todayReturnPercent: number;
  lifetimeNetGainLoss: number;
  lifetimeReturnPercent: number;
  totalDeposited: number;
  totalWithdrawn: number;
}

export interface FamilyData {
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  parentEmail?: string;
  profiles: ChildProfile[];
  buyLots: BuyLot[];
  transactions: TransactionRecord[];
  currencySymbol: string;
  lastSync: string;
}

export interface AchievementBadge {
  id: string;
  icon: string;
  title: LocalizedText;
  description: LocalizedText;
  unlockedAt?: string;
}
