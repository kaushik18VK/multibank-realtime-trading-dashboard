import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./components/PriceChart', () => ({
  PriceChart: ({ symbol }: { symbol: string }) => <div>Chart for {symbol}</div>
}));

vi.mock('./hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: vi.fn()
  })
}));

vi.mock('./hooks/useMarketStream', () => ({
  useMarketStream: () => ({
    tickers: ['AAPL', 'BTC-USD'],
    selected: 'AAPL',
    selectedTick: {
      symbol: 'AAPL',
      price: 190,
      timestamp: new Date().toISOString(),
      change24hPct: 1.2
    },
    history: [
      { timestamp: new Date().toISOString(), price: 180 },
      { timestamp: new Date().toISOString(), price: 190 }
    ],
    ticksBySymbol: {
      AAPL: { symbol: 'AAPL', price: 190, timestamp: new Date().toISOString(), change24hPct: 1.2 },
      'BTC-USD': { symbol: 'BTC-USD', price: 68000, timestamp: new Date().toISOString(), change24hPct: -0.8 }
    },
    loading: false,
    error: null,
    connected: true,
    selectTicker: vi.fn()
  })
}));

describe('App navigation sections', () => {
  it('renders dashboard by default and switches to other sections', () => {
    render(<App />);

    expect(screen.getByText('Real-Time Trading Dashboard')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Markets' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Market Snapshot' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Insights' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Insights' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Settings' })).toBeInTheDocument();
  });
});
