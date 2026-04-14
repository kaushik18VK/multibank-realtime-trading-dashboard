import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchHistory, fetchTickers, getWsUrl } from '../lib/api';
import type { HistoricalPoint, Tick, TickerSymbol } from '../types';

type StreamState = {
  tickers: TickerSymbol[];
  selected: TickerSymbol | null;
  ticksBySymbol: Record<string, Tick>;
  history: HistoricalPoint[];
  loading: boolean;
  error: string | null;
  connected: boolean;
};

const MAX_POINTS = 180;

export function useMarketStream() {
  const [state, setState] = useState<StreamState>({
    tickers: [],
    selected: null,
    ticksBySymbol: {},
    history: [],
    loading: true,
    error: null,
    connected: false
  });

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const tickers = await fetchTickers();
        if (cancelled) return;

        const selected = tickers[0] ?? null;
        const history = selected ? await fetchHistory(selected) : [];
        if (cancelled) return;

        setState((prev) => ({ ...prev, tickers, selected, history, loading: false, error: null }));
      } catch (error) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load market data'
        }));
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      setState((prev) => ({ ...prev, connected: true }));
    };

    ws.onclose = () => {
      setState((prev) => ({ ...prev, connected: false }));
    };

    ws.onerror = () => {
      setState((prev) => ({ ...prev, connected: false }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as { type: string; data?: Tick[] | Tick };
        if (!message.data) return;

        const updates = Array.isArray(message.data) ? message.data : [message.data];

        setState((prev) => {
          const nextTicks = { ...prev.ticksBySymbol };
          let nextHistory = prev.history;

          for (const tick of updates) {
            nextTicks[tick.symbol] = tick;

            if (tick.symbol === prev.selected) {
              const appended = [...nextHistory, { timestamp: tick.timestamp, price: tick.price }];
              nextHistory = appended.slice(Math.max(0, appended.length - MAX_POINTS));
            }
          }

          return { ...prev, ticksBySymbol: nextTicks, history: nextHistory };
        });
      } catch {
        // Ignore malformed websocket payloads
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  async function selectTicker(symbol: TickerSymbol) {
    const history = await fetchHistory(symbol);
    setState((prev) => ({ ...prev, selected: symbol, history }));

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }

  const selectedTick = useMemo(() => {
    if (!state.selected) return null;
    return state.ticksBySymbol[state.selected] ?? null;
  }, [state.selected, state.ticksBySymbol]);

  return {
    ...state,
    selectedTick,
    selectTicker
  };
}
