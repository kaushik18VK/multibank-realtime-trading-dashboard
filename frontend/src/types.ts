export type TickerSymbol =
  | 'AAPL'
  | 'TSLA'
  | 'NVDA'
  | 'BTC-USD'
  | 'ETH-USD'
  | 'SOL-USD'
  | 'XRP-USD'
  | 'XAU-USD'
  | 'EUR-USD'
  | 'GBP-USD';

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
