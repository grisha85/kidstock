import {
  FamilyData,
  ChildProfile,
  BuyLot,
  AggregatedHolding,
  TransactionRecord,
  AccountStatus,
} from '../types';
import { marketService } from './marketService';
import { APP_CONFIG } from '../config';

const LOCAL_STORAGE_KEY = 'kidstock_family_data_v1';

class PortfolioEngine {
  private data: FamilyData;
  private subscribers: Array<(data: FamilyData) => void> = [];

  constructor() {
    this.data = this.loadInitialData();
  }

  private loadInitialData(): FamilyData {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    // Default starter data
    const initial: FamilyData = {
      currencySymbol: APP_CONFIG.DEFAULT_CURRENCY,
      profiles: [...APP_CONFIG.DEMO_PROFILES],
      buyLots: [
        {
          id: 'lot_demo_1',
          childId: 'child_1',
          ticker: 'AAPL',
          buyDate: new Date(Date.now() - 86400000 * 5).toISOString(),
          originalShares: 0.15,
          remainingShares: 0.15,
          buyPrice: 220.0,
          totalCost: 33.0,
          note: 'First Apple slice',
        },
        {
          id: 'lot_demo_2',
          childId: 'child_1',
          ticker: 'RBLX',
          buyDate: new Date(Date.now() - 86400000 * 2).toISOString(),
          originalShares: 0.5,
          remainingShares: 0.5,
          buyPrice: 42.0,
          totalCost: 21.0,
          note: 'Roblox investment',
        },
      ],
      transactions: [
        {
          id: 'tx_demo_0',
          timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
          childId: 'child_1',
          type: 'DEPOSIT_CASH',
          totalAmount: 100.0,
          postBalance: 100.0,
          note: 'Starting allowance',
        },
        {
          id: 'tx_demo_1',
          timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
          childId: 'child_1',
          type: 'BUY_STOCK',
          ticker: 'AAPL',
          shares: 0.15,
          pricePerShare: 220.0,
          totalAmount: -33.0,
          postBalance: 67.0,
          note: 'Bought 0.15 AAPL shares',
        },
        {
          id: 'tx_demo_2',
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          childId: 'child_1',
          type: 'BUY_STOCK',
          ticker: 'RBLX',
          shares: 0.5,
          pricePerShare: 42.0,
          totalAmount: -21.0,
          postBalance: 46.0,
          note: 'Bought 0.50 RBLX shares',
        },
      ],
      lastSync: new Date().toISOString(),
    };

    this.saveData(initial);
    return initial;
  }

  private saveData(newData: FamilyData) {
    this.data = newData;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
    this.notify();
  }

  public getFamilyData(): FamilyData {
    return this.data;
  }

  public subscribe(callback: (data: FamilyData) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.subscribers.forEach((cb) => cb(this.data));
  }

  // ================= PROFILE MANAGEMENT =================
  public getChild(childId: string): ChildProfile | undefined {
    return this.data.profiles.find((p) => p.id === childId);
  }

  public addChild(name: string, avatar: string, color: string, googleEmail?: string, startingCash: number = 0): ChildProfile {
    const newChild: ChildProfile = {
      id: `child_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      avatar,
      color,
      googleEmail: googleEmail?.trim().toLowerCase(),
      cashBalance: startingCash,
      totalDeposited: startingCash,
      totalWithdrawn: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedProfiles = [...this.data.profiles, newChild];
    const updatedTransactions = [...this.data.transactions];

    if (startingCash > 0) {
      updatedTransactions.unshift({
        id: `tx_${Date.now()}`,
        timestamp: new Date().toISOString(),
        childId: newChild.id,
        type: 'DEPOSIT_CASH',
        totalAmount: startingCash,
        postBalance: startingCash,
        note: 'Starting cash deposit',
      });
    }

    this.saveData({
      ...this.data,
      profiles: updatedProfiles,
      transactions: updatedTransactions,
      lastSync: new Date().toISOString(),
    });

    return newChild;
  }

  public updateChild(childId: string, updates: Partial<ChildProfile>) {
    const updatedProfiles = this.data.profiles.map((p) =>
      p.id === childId ? { ...p, ...updates } : p
    );
    this.saveData({
      ...this.data,
      profiles: updatedProfiles,
      lastSync: new Date().toISOString(),
    });
  }

  // ================= CASH VAULT (DEPOSIT & WITHDRAW) =================
  public depositCash(childId: string, amount: number, note: string = 'Cash allowance deposit'): boolean {
    if (amount <= 0) return false;
    const child = this.getChild(childId);
    if (!child) return false;

    const newCash = Number((child.cashBalance + amount).toFixed(2));
    const newTotalDeposited = Number((child.totalDeposited + amount).toFixed(2));

    const newTx: TransactionRecord = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      childId,
      type: 'DEPOSIT_CASH',
      totalAmount: amount,
      postBalance: newCash,
      note,
    };

    const updatedProfiles = this.data.profiles.map((p) =>
      p.id === childId ? { ...p, cashBalance: newCash, totalDeposited: newTotalDeposited } : p
    );

    this.saveData({
      ...this.data,
      profiles: updatedProfiles,
      transactions: [newTx, ...this.data.transactions],
      lastSync: new Date().toISOString(),
    });

    return true;
  }

  public withdrawCash(childId: string, amount: number, note: string = 'Cash withdrawal'): boolean {
    if (amount <= 0) return false;
    const child = this.getChild(childId);
    if (!child || child.cashBalance < amount) return false;

    const newCash = Number((child.cashBalance - amount).toFixed(2));
    const newTotalWithdrawn = Number((child.totalWithdrawn + amount).toFixed(2));

    const newTx: TransactionRecord = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      childId,
      type: 'WITHDRAW_CASH',
      totalAmount: -amount,
      postBalance: newCash,
      note,
    };

    const updatedProfiles = this.data.profiles.map((p) =>
      p.id === childId ? { ...p, cashBalance: newCash, totalWithdrawn: newTotalWithdrawn } : p
    );

    this.saveData({
      ...this.data,
      profiles: updatedProfiles,
      transactions: [newTx, ...this.data.transactions],
      lastSync: new Date().toISOString(),
    });

    return true;
  }

  // ================= STOCK TRADING (BATCH BUYS & SALES) =================
  /**
   * Executes a stock purchase for a child.
   * Can specify dollar amount (fractional share calculation) or share count.
   */
  public buyStock(
    childId: string,
    ticker: string,
    options: { dollarAmount?: number; shares?: number; note?: string }
  ): { success: boolean; lot?: BuyLot; error?: string } {
    const child = this.getChild(childId);
    if (!child) return { success: false, error: 'Child account not found' };

    const stock = marketService.getStock(ticker);
    if (!stock) return { success: false, error: 'Stock not found' };

    const price = stock.currentPrice;
    let shares = 0;
    let totalCost = 0;

    if (options.dollarAmount !== undefined) {
      totalCost = Number(options.dollarAmount.toFixed(2));
      shares = Number((totalCost / price).toFixed(4));
    } else if (options.shares !== undefined) {
      shares = Number(options.shares.toFixed(4));
      totalCost = Number((shares * price).toFixed(2));
    }

    if (totalCost <= 0 || shares <= 0) {
      return { success: false, error: 'Invalid order amount' };
    }

    if (child.cashBalance < totalCost) {
      return { success: false, error: 'Insufficient cash balance in piggy bank' };
    }

    const newCash = Number((child.cashBalance - totalCost).toFixed(2));

    // Create an immutable Buy Lot (tax lot)
    const newLot: BuyLot = {
      id: `lot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      childId,
      ticker: stock.ticker,
      buyDate: new Date().toISOString(),
      originalShares: shares,
      remainingShares: shares,
      buyPrice: price,
      totalCost,
      note: options.note || `Bought ${shares} shares of ${stock.name}`,
    };

    // Create Transaction Record
    const newTx: TransactionRecord = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      childId,
      type: 'BUY_STOCK',
      ticker: stock.ticker,
      shares,
      pricePerShare: price,
      totalAmount: -totalCost,
      postBalance: newCash,
      note: `Bought ${shares} sh @ $${price.toFixed(2)}`,
    };

    const updatedProfiles = this.data.profiles.map((p) =>
      p.id === childId ? { ...p, cashBalance: newCash } : p
    );

    this.saveData({
      ...this.data,
      profiles: updatedProfiles,
      buyLots: [newLot, ...this.data.buyLots],
      transactions: [newTx, ...this.data.transactions],
      lastSync: new Date().toISOString(),
    });

    return { success: true, lot: newLot };
  }

  /**
   * Sells a specific number of shares of a stock.
   * Uses FIFO (First-In, First-Out) across the child's buy lots.
   * Calculates realized profit or loss and credits proceeds to cash.
   */
  public sellStock(
    childId: string,
    ticker: string,
    sharesToSell: number,
    note?: string
  ): { success: boolean; proceeds?: number; realizedProfit?: number; error?: string } {
    const child = this.getChild(childId);
    if (!child) return { success: false, error: 'Child account not found' };

    const stock = marketService.getStock(ticker);
    if (!stock) return { success: false, error: 'Stock not found' };

    // Find all active lots for this child & ticker sorted oldest first (FIFO)
    const activeLots = this.data.buyLots
      .filter((l) => l.childId === childId && l.ticker === ticker && l.remainingShares > 0)
      .sort((a, b) => new Date(a.buyDate).getTime() - new Date(b.buyDate).getTime());

    const totalOwnedShares = activeLots.reduce((sum, l) => sum + l.remainingShares, 0);

    if (sharesToSell <= 0 || sharesToSell > totalOwnedShares + 0.0001) {
      return { success: false, error: `You only own ${totalOwnedShares.toFixed(4)} shares.` };
    }

    const currentPrice = stock.currentPrice;
    let remainingToSell = sharesToSell;
    let totalCostBasisOfSold = 0;

    const updatedLots = [...this.data.buyLots];

    for (let i = 0; i < updatedLots.length; i++) {
      const lot = updatedLots[i];
      if (lot.childId === childId && lot.ticker === ticker && lot.remainingShares > 0) {
        if (remainingToSell <= 0) break;

        if (lot.remainingShares <= remainingToSell) {
          // Sell entire remaining shares of this lot
          const soldFromLot = lot.remainingShares;
          totalCostBasisOfSold += soldFromLot * lot.buyPrice;
          remainingToSell -= soldFromLot;

          updatedLots[i] = {
            ...lot,
            remainingShares: 0,
            totalCost: 0,
          };
        } else {
          // Partial sell from this lot
          const soldFromLot = remainingToSell;
          totalCostBasisOfSold += soldFromLot * lot.buyPrice;
          const newRemaining = Number((lot.remainingShares - soldFromLot).toFixed(4));

          updatedLots[i] = {
            ...lot,
            remainingShares: newRemaining,
            totalCost: Number((newRemaining * lot.buyPrice).toFixed(2)),
          };
          remainingToSell = 0;
        }
      }
    }

    const proceeds = Number((sharesToSell * currentPrice).toFixed(2));
    const realizedGainLoss = Number((proceeds - totalCostBasisOfSold).toFixed(2));
    const newCash = Number((child.cashBalance + proceeds).toFixed(2));

    const newTx: TransactionRecord = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      childId,
      type: 'SELL_STOCK',
      ticker: stock.ticker,
      shares: sharesToSell,
      pricePerShare: currentPrice,
      totalAmount: proceeds,
      realizedGainLoss,
      postBalance: newCash,
      note: note || `Sold ${sharesToSell.toFixed(4)} sh @ $${currentPrice.toFixed(2)} (${realizedGainLoss >= 0 ? '+' : ''}$${realizedGainLoss.toFixed(2)} profit)`,
    };

    const updatedProfiles = this.data.profiles.map((p) =>
      p.id === childId ? { ...p, cashBalance: newCash } : p
    );

    this.saveData({
      ...this.data,
      profiles: updatedProfiles,
      buyLots: updatedLots,
      transactions: [newTx, ...this.data.transactions],
      lastSync: new Date().toISOString(),
    });

    return { success: true, proceeds, realizedProfit: realizedGainLoss };
  }

  // ================= AGGREGATED HOLDINGS & LOT INSPECTION =================
  /**
   * Returns aggregated holdings for a child, complete with nested buy batches (lots)
   */
  public getAggregatedHoldings(childId: string): AggregatedHolding[] {
    const childLots = this.data.buyLots.filter(
      (l) => l.childId === childId && l.remainingShares > 0
    );

    const holdingsMap: Map<string, BuyLot[]> = new Map();
    childLots.forEach((lot) => {
      const list = holdingsMap.get(lot.ticker) || [];
      list.push(lot);
      holdingsMap.set(lot.ticker, list);
    });

    const result: AggregatedHolding[] = [];

    holdingsMap.forEach((lots, ticker) => {
      const stock = marketService.getStock(ticker);
      const companyName = stock?.name || ticker;
      const category = stock?.category || 'tech';
      const emoji = stock?.emoji || '📈';
      const domain = stock?.domain;
      const currentPrice = stock?.currentPrice || 0;

      const totalShares = Number(lots.reduce((sum, l) => sum + l.remainingShares, 0).toFixed(4));
      const totalCost = Number(lots.reduce((sum, l) => sum + l.remainingShares * l.buyPrice, 0).toFixed(2));
      const avgBuyPrice = totalShares > 0 ? Number((totalCost / totalShares).toFixed(2)) : 0;
      const currentValue = Number((totalShares * currentPrice).toFixed(2));
      const unrealizedGainLoss = Number((currentValue - totalCost).toFixed(2));
      const gainLossPercent = totalCost > 0 ? Number(((unrealizedGainLoss / totalCost) * 100).toFixed(2)) : 0;

      result.push({
        ticker,
        companyName,
        category,
        emoji,
        domain,
        totalShares,
        avgBuyPrice,
        totalCost,
        currentPrice,
        currentValue,
        unrealizedGainLoss,
        gainLossPercent,
        lots: lots.sort((a, b) => new Date(b.buyDate).getTime() - new Date(a.buyDate).getTime()),
      });
    });

    return result.sort((a, b) => b.currentValue - a.currentValue);
  }

  // ================= ACCOUNT STATUS CALCULATOR =================
  public getAccountStatus(childId: string): AccountStatus {
    const child = this.getChild(childId);
    if (!child) {
      return {
        cashBalance: 0,
        investedValue: 0,
        totalNetWorth: 0,
        todayGainLoss: 0,
        todayReturnPercent: 0,
        lifetimeNetGainLoss: 0,
        lifetimeReturnPercent: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
      };
    }

    const holdings = this.getAggregatedHoldings(childId);
    const investedValue = Number(holdings.reduce((sum, h) => sum + h.currentValue, 0).toFixed(2));
    const totalNetWorth = Number((child.cashBalance + investedValue).toFixed(2));

    // Calculate today's gain/loss across all holdings
    let todayGain = 0;
    holdings.forEach((h) => {
      const stock = marketService.getStock(h.ticker);
      if (stock) {
        todayGain += h.totalShares * stock.dailyChange;
      }
    });
    const todayGainLoss = Number(todayGain.toFixed(2));
    const previousNetWorth = totalNetWorth - todayGainLoss;
    const todayReturnPercent = previousNetWorth > 0 ? Number(((todayGainLoss / previousNetWorth) * 100).toFixed(2)) : 0;

    // Lifetime profit = Total net worth - Net cash deposited by parent
    const netDeposited = Math.max(0, child.totalDeposited - child.totalWithdrawn);
    const lifetimeNetGainLoss = Number((totalNetWorth - netDeposited).toFixed(2));
    const lifetimeReturnPercent = netDeposited > 0 ? Number(((lifetimeNetGainLoss / netDeposited) * 100).toFixed(2)) : 0;

    return {
      cashBalance: child.cashBalance,
      investedValue,
      totalNetWorth,
      todayGainLoss,
      todayReturnPercent,
      lifetimeNetGainLoss,
      lifetimeReturnPercent,
      totalDeposited: child.totalDeposited,
      totalWithdrawn: child.totalWithdrawn,
    };
  }

  // ================= TRANSACTION HISTORY =================
  public getTransactions(childId?: string, filter?: string): TransactionRecord[] {
    let list = this.data.transactions;
    if (childId) {
      list = list.filter((tx) => tx.childId === childId);
    }
    if (filter === 'cash') {
      list = list.filter((tx) => tx.type === 'DEPOSIT_CASH' || tx.type === 'WITHDRAW_CASH');
    } else if (filter === 'buys') {
      list = list.filter((tx) => tx.type === 'BUY_STOCK');
    } else if (filter === 'sells') {
      list = list.filter((tx) => tx.type === 'SELL_STOCK');
    }
    return list;
  }

  public exportTransactionsCsv(childId?: string): string {
    const txs = this.getTransactions(childId);
    const headers = ['ID', 'Date', 'Child ID', 'Type', 'Ticker', 'Shares', 'Price', 'Total Amount', 'Realized Gain/Loss', 'Post Balance', 'Note'];
    const rows = txs.map((tx) => [
      tx.id,
      new Date(tx.timestamp).toLocaleString(),
      tx.childId,
      tx.type,
      tx.ticker || '',
      tx.shares?.toString() || '',
      tx.pricePerShare ? `$${tx.pricePerShare.toFixed(2)}` : '',
      `$${tx.totalAmount.toFixed(2)}`,
      tx.realizedGainLoss !== undefined ? `$${tx.realizedGainLoss.toFixed(2)}` : '',
      `$${tx.postBalance.toFixed(2)}`,
      `"${(tx.note || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public exportFamilyJson(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public importFamilyJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as FamilyData;
      if (Array.isArray(parsed.profiles) && Array.isArray(parsed.buyLots) && Array.isArray(parsed.transactions)) {
        this.saveData({
          ...parsed,
          lastSync: new Date().toISOString(),
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public updateFamilySettings(updates: Partial<FamilyData>) {
    this.saveData({
      ...this.data,
      ...updates,
      lastSync: new Date().toISOString(),
    });
  }

  public setSpreadsheetInfo(spreadsheetId: string, url: string) {
    this.saveData({
      ...this.data,
      spreadsheetId,
      spreadsheetUrl: url,
      lastSync: new Date().toISOString(),
    });
  }
}

export const portfolioEngine = new PortfolioEngine();
