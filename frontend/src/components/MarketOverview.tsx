import type { Tick, TickerSymbol } from '../types';

type Props = {
  tickers: TickerSymbol[];
  ticksBySymbol: Record<string, Tick>;
  connected: boolean;
};

function formatSigned(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function MarketOverview({ tickers, ticksBySymbol, connected }: Props) {
  const liveTicks = tickers
    .map((symbol) => ticksBySymbol[symbol])
    .filter((tick): tick is Tick => Boolean(tick));

  const advancers = liveTicks.filter((tick) => tick.change24hPct >= 0).length;
  const decliners = liveTicks.filter((tick) => tick.change24hPct < 0).length;
  const avgMove =
    liveTicks.length > 0
      ? liveTicks.reduce((sum, tick) => sum + Math.abs(tick.change24hPct), 0) / liveTicks.length
      : 0;

  const sortedByMove = [...liveTicks].sort((a, b) => b.change24hPct - a.change24hPct);
  const topGainer = sortedByMove[0] ?? null;
  const topLoser = sortedByMove[sortedByMove.length - 1] ?? null;

  return (
    <section className="panel overview-panel">
      <div className="overview-grid">
        <article className="overview-card">
          <span className="overview-label">Market Feed</span>
          <strong className={connected ? 'up' : 'down'}>{connected ? 'Live' : 'Disconnected'}</strong>
          <p>{tickers.length} instruments tracked</p>
        </article>

        <article className="overview-card">
          <span className="overview-label">Breadth</span>
          <strong>
            {advancers} / {decliners}
          </strong>
          <p>Advancers vs decliners</p>
        </article>

        <article className="overview-card">
          <span className="overview-label">Average Move</span>
          <strong>{avgMove.toFixed(2)}%</strong>
          <p>Absolute 24h move across feed</p>
        </article>

        <article className="overview-card movers">
          <span className="overview-label">Top Movers</span>
          <div className="movers-row">
            <div>
              <small>Gainer</small>
              <strong className="up">{topGainer ? `${topGainer.symbol} ${formatSigned(topGainer.change24hPct)}` : '--'}</strong>
            </div>
            <div>
              <small>Loser</small>
              <strong className="down">{topLoser ? `${topLoser.symbol} ${formatSigned(topLoser.change24hPct)}` : '--'}</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
