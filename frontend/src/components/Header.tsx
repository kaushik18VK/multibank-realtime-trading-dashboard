import type { Tick, TickerSymbol } from '../types';
import { formatPrice, formatTime } from '../lib/format';

type Props = {
  selected: TickerSymbol | null;
  selectedTick: Tick | null;
  connected: boolean;
};

export function Header({ selected, selectedTick, connected }: Props) {
  return (
    <header className="panel topbar">
      <div>
        <h1>Real-Time Trading Dashboard</h1>
        <p>Live websocket stream + REST history</p>
      </div>
      <div className="topbar-metrics">
        <div className="pill">
          <span>Status</span>
          <strong className={connected ? 'up' : 'down'}>{connected ? 'Connected' : 'Disconnected'}</strong>
        </div>
        <div className="pill">
          <span>{selected ?? 'Ticker'}</span>
          <strong>{selectedTick ? formatPrice(selected ?? selectedTick.symbol, selectedTick.price) : '--'}</strong>
        </div>
        <div className="pill">
          <span>Updated</span>
          <strong>{selectedTick ? formatTime(selectedTick.timestamp) : '--'}</strong>
        </div>
      </div>
    </header>
  );
}
