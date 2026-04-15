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
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 10_000;

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
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);

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
    shouldReconnectRef.current = true;

    function clearReconnectTimer() {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }

    function scheduleReconnect() {
      if (!shouldReconnectRef.current || reconnectTimerRef.current !== null) {
        return;
      }

      const delay = Math.min(
        RECONNECT_BASE_DELAY_MS * 2 ** reconnectAttemptsRef.current,
        RECONNECT_MAX_DELAY_MS
      );
      reconnectAttemptsRef.current += 1;

      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null;
        connectSocket();
      }, delay);
    }

    function connectSocket() {
      if (!shouldReconnectRef.current) {
        return;
      }

      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setState((prev) => ({ ...prev, connected: true }));
      };

      ws.onclose = () => {
        setState((prev) => ({ ...prev, connected: false }));
        scheduleReconnect();
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
    }

    connectSocket();

    return () => {
      shouldReconnectRef.current = false;
      clearReconnectTimer();
      wsRef.current?.close();
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
