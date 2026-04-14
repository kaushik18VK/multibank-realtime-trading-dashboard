export type TickerSymbol = 'AAPL' | 'TSLA' | 'BTC-USD' | 'ETH-USD' | 'EUR-USD';

export interface Tick {
  symbol: TickerSymbol;
  price: number;
  timestamp: string;
  change24hPct: number;
}

export interface HistoricalPoint {
  timestamp: string;
  price: number;
}
