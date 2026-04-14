import type { TickerSymbol } from '../types';

const SYMBOL_COLOR: Record<TickerSymbol, string> = {
  AAPL: '#2dd4bf',
  TSLA: '#fb7185',
  NVDA: '#84cc16',
  'BTC-USD': '#f59e0b',
  'ETH-USD': '#8b5cf6',
  'SOL-USD': '#22d3ee',
  'XRP-USD': '#60a5fa',
  'XAU-USD': '#fbbf24',
  'EUR-USD': '#34d399',
  'GBP-USD': '#38bdf8'
};

export function getSymbolColor(symbol: TickerSymbol): string {
  return SYMBOL_COLOR[symbol] ?? '#22c55e';
}
