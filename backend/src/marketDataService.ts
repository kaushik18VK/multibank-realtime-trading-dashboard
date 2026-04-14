import type { HistoricalPoint, Tick, TickerSymbol } from './types.js';

const TICKERS: Array<{ symbol: TickerSymbol; base: number; drift: number; volatility: number }> = [
  { symbol: 'AAPL', base: 187.4, drift: 0.01, volatility: 0.8 },
  { symbol: 'TSLA', base: 171.8, drift: 0.015, volatility: 1.5 },
  { symbol: 'NVDA', base: 924.2, drift: 0.03, volatility: 3.8 },
  { symbol: 'BTC-USD', base: 68250, drift: 1.5, volatility: 145 },
  { symbol: 'ETH-USD', base: 3320, drift: 0.5, volatility: 35 },
  { symbol: 'SOL-USD', base: 167.4, drift: 0.22, volatility: 4.2 },
  { symbol: 'XRP-USD', base: 0.62, drift: 0.001, volatility: 0.018 },
  { symbol: 'XAU-USD', base: 2341.7, drift: 0.14, volatility: 7.2 },
  { symbol: 'EUR-USD', base: 1.08, drift: 0, volatility: 0.002 },
  { symbol: 'GBP-USD', base: 1.27, drift: 0.0004, volatility: 0.0027 }
];

export class MarketDataService {
  private latestPrices = new Map<TickerSymbol, number>();
  private open24h = new Map<TickerSymbol, number>();
  private history = new Map<TickerSymbol, HistoricalPoint[]>();

  constructor(private readonly maxHistoryPoints = 500) {
    for (const ticker of TICKERS) {
      this.latestPrices.set(ticker.symbol, ticker.base);
      this.open24h.set(ticker.symbol, ticker.base * (0.98 + Math.random() * 0.04));
      this.history.set(ticker.symbol, this.seedHistory(ticker.symbol, ticker.base));
    }
  }

  getAvailableTickers(): TickerSymbol[] {
    return TICKERS.map((t) => t.symbol);
  }

  getHistory(symbol: TickerSymbol, limit = 100): HistoricalPoint[] {
    const points = this.history.get(symbol) ?? [];
    return points.slice(Math.max(0, points.length - limit));
  }

  generateNextTick(symbol: TickerSymbol): Tick {
    const spec = TICKERS.find((t) => t.symbol === symbol);
    if (!spec) {
      throw new Error(`Unknown symbol: ${symbol}`);
    }

    const current = this.latestPrices.get(symbol) ?? spec.base;
    const randomShock = (Math.random() - 0.5) * spec.volatility;
    const next = Math.max(0.0001, current + spec.drift + randomShock);

    this.latestPrices.set(symbol, next);

    const entry: HistoricalPoint = { timestamp: new Date().toISOString(), price: this.roundPrice(symbol, next) };
    const history = this.history.get(symbol) ?? [];
    history.push(entry);
    if (history.length > this.maxHistoryPoints) {
      history.shift();
    }
    this.history.set(symbol, history);

    const open24h = this.open24h.get(symbol) ?? next;
    const change24hPct = ((next - open24h) / open24h) * 100;

    return {
      symbol,
      price: this.roundPrice(symbol, next),
      timestamp: entry.timestamp,
      change24hPct: Number(change24hPct.toFixed(2))
    };
  }

  generateBatchTick(): Tick[] {
    return this.getAvailableTickers().map((symbol) => this.generateNextTick(symbol));
  }

  private seedHistory(symbol: TickerSymbol, base: number): HistoricalPoint[] {
    const seeded: HistoricalPoint[] = [];
    let value = base;
    const now = Date.now();

    const seedCount = Math.min(120, this.maxHistoryPoints);
    for (let i = seedCount; i >= 1; i--) {
      value = Math.max(0.0001, value + (Math.random() - 0.5) * (base * 0.0025));
      seeded.push({
        timestamp: new Date(now - i * 60_000).toISOString(),
        price: this.roundPrice(symbol, value)
      });
    }

    return seeded;
  }

  private roundPrice(symbol: TickerSymbol, value: number): number {
    if (symbol.includes('USD') && value < 10) {
      return Number(value.toFixed(4));
    }
    if (symbol.includes('USD') && value > 1000) {
      return Number(value.toFixed(2));
    }
    return Number(value.toFixed(2));
  }
}
