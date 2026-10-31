import { StockInfo } from '../types';
import { CURATED_STOCKS } from '../data/curatedStocks';

export interface ChartPoint {
  timeLabel: string;
  price: number;
}

class MarketService {
  private stocks: Map<string, StockInfo> = new Map();
  private subscribers: Array<(stocks: StockInfo[]) => void> = [];
  private tickInterval: number | null = null;

  constructor() {
    // Initialize stock catalog
    CURATED_STOCKS.forEach((stock) => {
      this.stocks.set(stock.ticker, { ...stock });
    });

    // Start live micro-tick simulation (small subtle fluctuations simulating real market activity)
    this.startLiveSimulation();
  }

  public getAllStocks(): StockInfo[] {
    return Array.from(this.stocks.values());
  }

  public getStock(ticker: string): StockInfo | undefined {
    return this.stocks.get(ticker.toUpperCase());
  }

  public searchStocks(query: string, category?: string): StockInfo[] {
    const q = query.trim().toLowerCase();
    return this.getAllStocks().filter((stock) => {
      const matchesCategory = !category || category === 'all' || stock.category === category;
      if (!matchesCategory) return false;

      if (!q) return true;
      return (
        stock.ticker.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q) ||
        stock.kidDescription.en.toLowerCase().includes(q) ||
        stock.kidDescription.he.toLowerCase().includes(q)
      );
    });
  }

  public getStocksByCategory(category: string): StockInfo[] {
    return this.getAllStocks().filter((s) => s.category === category);
  }

  public subscribe(callback: (stocks: StockInfo[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    const list = this.getAllStocks();
    this.subscribers.forEach((cb) => cb(list));
  }

  /**
   * Generates realistic chart history points based on chosen timeframe
   */
  public getChartData(ticker: string, timeframe: '1D' | '1W' | '1M' | '1Y' | '5Y'): ChartPoint[] {
    const stock = this.getStock(ticker);
    if (!stock) return [];

    const basePrice = stock.currentPrice;
    const points: ChartPoint[] = [];

    let count = 20;
    let volatility = 0.015;

    switch (timeframe) {
      case '1D': {
        count = 14;
        volatility = 0.008;
        const times = [
          '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
          '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM',
          '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
        ];
        let curr = stock.previousClose;
        times.forEach((time, i) => {
          if (i === times.length - 1) {
            points.push({ timeLabel: time, price: basePrice });
          } else {
            const shift = (Math.sin(i * 0.8) + (Math.random() - 0.48)) * curr * volatility;
            curr = Math.max(0.5, curr + shift);
            points.push({ timeLabel: time, price: Number(curr.toFixed(2)) });
          }
        });
        return points;
      }

      case '1W': {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        let curr = basePrice * (1 - (stock.dailyChangePercent / 100) * 2);
        days.forEach((day, i) => {
          if (i === days.length - 1) {
            points.push({ timeLabel: day, price: basePrice });
          } else {
            const shift = (Math.sin(i * 1.2) + (Math.random() - 0.45)) * curr * 0.02;
            curr = Math.max(0.5, curr + shift);
            points.push({ timeLabel: day, price: Number(curr.toFixed(2)) });
          }
        });
        return points;
      }

      case '1M': {
        count = 12;
        volatility = 0.035;
        let curr = basePrice * 0.94;
        for (let i = 0; i < count; i++) {
          if (i === count - 1) {
            points.push({ timeLabel: `Day ${i * 2 + 1}`, price: basePrice });
          } else {
            const shift = (Math.sin(i * 0.9) + (Math.random() - 0.46)) * curr * volatility;
            curr = Math.max(0.5, curr + shift);
            points.push({ timeLabel: `Day ${i * 2 + 1}`, price: Number(curr.toFixed(2)) });
          }
        }
        return points;
      }

      case '1Y': {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let curr = stock.fiftyTwoWeekLow + (stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow) * 0.3;
        months.forEach((m, i) => {
          if (i === months.length - 1) {
            points.push({ timeLabel: m, price: basePrice });
          } else {
            const shift = (Math.sin(i * 0.7) + (Math.random() - 0.42)) * curr * 0.06;
            curr = Math.max(stock.fiftyTwoWeekLow, Math.min(stock.fiftyTwoWeekHigh, curr + shift));
            points.push({ timeLabel: m, price: Number(curr.toFixed(2)) });
          }
        });
        return points;
      }

      case '5Y': {
        const years = ['2022', '2023', '2024', '2025', '2026'];
        let curr = basePrice * 0.55;
        years.forEach((yr, i) => {
          if (i === years.length - 1) {
            points.push({ timeLabel: yr, price: basePrice });
          } else {
            curr = curr * (1 + 0.15 + (Math.random() - 0.4) * 0.1);
            points.push({ timeLabel: yr, price: Number(curr.toFixed(2)) });
          }
        });
        return points;
      }
    }
  }

  /**
   * Live simulation engine: gently fluctuates prices every 5 seconds
   * so kids can watch the live green/red tickers change!
   */
  private startLiveSimulation() {
    if (this.tickInterval) return;

    this.tickInterval = window.setInterval(() => {
      // Pick 2-3 random stocks to fluctuate slightly
      const allTickers = Array.from(this.stocks.keys());
      const chosenCount = 3;

      for (let i = 0; i < chosenCount; i++) {
        const randomIndex = Math.floor(Math.random() * allTickers.length);
        const ticker = allTickers[randomIndex];
        const stock = this.stocks.get(ticker);
        if (!stock) continue;

        // Subtle micro-tick between -0.3% and +0.3%
        const deltaPercent = (Math.random() - 0.49) * 0.006;
        const newPrice = Number((stock.currentPrice * (1 + deltaPercent)).toFixed(2));
        const newDailyChange = Number((newPrice - stock.previousClose).toFixed(2));
        const newDailyPercent = Number(((newDailyChange / stock.previousClose) * 100).toFixed(2));

        const newSparkline = [...stock.sparkline.slice(1), newPrice];

        this.stocks.set(ticker, {
          ...stock,
          currentPrice: newPrice,
          dailyChange: newDailyChange,
          dailyChangePercent: newDailyPercent,
          sparkline: newSparkline,
        });
      }

      this.notify();
    }, 5000);
  }

  public stopLiveSimulation() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }
}

export const marketService = new MarketService();
