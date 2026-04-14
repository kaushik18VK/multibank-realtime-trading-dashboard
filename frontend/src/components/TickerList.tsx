import type { Tick, TickerSymbol } from '../types';
import { formatPrice } from '../lib/format';

type Props = {
  tickers: TickerSymbol[];
  selected: TickerSymbol | null;
  ticksBySymbol: Record<string, Tick>;
  onSelect: (symbol: TickerSymbol) => void;
};

export function TickerList({ tickers, selected, ticksBySymbol, onSelect }: Props) {
  return (
    <aside className="panel ticker-panel">
      <div className="panel-header">
        <h2>Instruments</h2>
      </div>
      <ul className="ticker-list">
        {tickers.map((ticker) => {
          const tick = ticksBySymbol[ticker];
          const isActive = selected === ticker;
          return (
            <li key={ticker}>
              <button className={`ticker-item ${isActive ? 'active' : ''}`} onClick={() => onSelect(ticker)}>
                <span className="ticker-symbol">
                  <span className="ticker-dot" />
                  {ticker}
                </span>
                <span className="ticker-price">{tick ? formatPrice(ticker, tick.price) : '--'}</span>
                <span className={`ticker-change ${(tick?.change24hPct ?? 0) >= 0 ? 'up' : 'down'}`}>
                  {tick ? `${tick.change24hPct >= 0 ? '+' : ''}${tick.change24hPct.toFixed(2)}%` : '--'}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
