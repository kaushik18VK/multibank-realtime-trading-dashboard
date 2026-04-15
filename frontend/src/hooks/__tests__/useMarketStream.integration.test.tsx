import { act, renderHook, waitFor } from '@testing-library/react';
import { useMarketStream } from '../useMarketStream';
import type { HistoricalPoint, Tick } from '../../types';

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  static instances: MockWebSocket[] = [];

  readonly url: string;
  readyState = MockWebSocket.CONNECTING;
  sent: string[] = [];

  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(payload: string) {
    this.sent.push(payload);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({} as CloseEvent);
  }

  emitOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.({} as Event);
  }

  emitMessage(payload: unknown) {
    this.onmessage?.({ data: JSON.stringify(payload) } as MessageEvent);
  }
}

function jsonResponse<T>(body: T, ok = true): Response {
  return {
    ok,
    json: async () => body
  } as Response;
}

describe('useMarketStream integration flow', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    MockWebSocket.instances = [];
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('bootstraps from REST and consumes websocket updates', async () => {
    const initialHistory: HistoricalPoint[] = [
      { timestamp: '2026-04-15T10:00:00.000Z', price: 180 },
      { timestamp: '2026-04-15T10:01:00.000Z', price: 182 }
    ];

    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/api/tickers')) {
        return jsonResponse({ tickers: ['AAPL', 'BTC-USD'] });
      }
      if (url.includes('/api/history/AAPL')) {
        return jsonResponse({ points: initialHistory });
      }
      return jsonResponse({ points: [] });
    });

    const { result } = renderHook(() => useMarketStream());

    expect(MockWebSocket.instances).toHaveLength(1);
    const ws = MockWebSocket.instances[0];

    act(() => {
      ws.emitOpen();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.connected).toBe(true);
      expect(result.current.selected).toBe('AAPL');
      expect(result.current.history).toHaveLength(2);
    });

    const batchTick: Tick = {
      symbol: 'AAPL',
      price: 185,
      timestamp: '2026-04-15T10:02:00.000Z',
      change24hPct: 1.64
    };

    act(() => {
      ws.emitMessage({ type: 'batch', data: [batchTick] });
    });

    await waitFor(() => {
      expect(result.current.ticksBySymbol['AAPL']?.price).toBe(185);
      expect(result.current.history.at(-1)?.price).toBe(185);
    });
  });

  it('loads new history and sends subscribe message on ticker switch', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/api/tickers')) {
        return jsonResponse({ tickers: ['AAPL', 'BTC-USD'] });
      }
      if (url.includes('/api/history/AAPL')) {
        return jsonResponse({ points: [{ timestamp: '2026-04-15T10:00:00.000Z', price: 180 }] });
      }
      if (url.includes('/api/history/BTC-USD')) {
        return jsonResponse({ points: [{ timestamp: '2026-04-15T10:05:00.000Z', price: 68000 }] });
      }
      return jsonResponse({ points: [] });
    });

    const { result } = renderHook(() => useMarketStream());
    const ws = MockWebSocket.instances[0];

    act(() => {
      ws.emitOpen();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.selectTicker('BTC-USD');
    });

    expect(result.current.selected).toBe('BTC-USD');
    expect(result.current.history[0]?.price).toBe(68000);
    expect(ws.sent).toContain(JSON.stringify({ type: 'subscribe', symbol: 'BTC-USD' }));
  });
});
