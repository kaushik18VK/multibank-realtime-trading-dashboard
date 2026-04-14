import type { HistoricalPoint, TickerSymbol } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000';

export async function fetchTickers(): Promise<TickerSymbol[]> {
  const response = await fetch(`${API_BASE}/api/tickers`);
  if (!response.ok) {
    throw new Error('Failed to load tickers');
  }
  const payload = (await response.json()) as { tickers: TickerSymbol[] };
  return payload.tickers;
}

export async function fetchHistory(symbol: TickerSymbol, limit = 120): Promise<HistoricalPoint[]> {
  const response = await fetch(`${API_BASE}/api/history/${symbol}?limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to load history for ${symbol}`);
  }
  const payload = (await response.json()) as { points: HistoricalPoint[] };
  return payload.points;
}

export function getWsUrl(): string {
  const base = import.meta.env.VITE_WS_URL ?? 'ws://localhost:4000/ws';
  return base;
}
