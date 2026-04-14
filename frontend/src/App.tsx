import { useState } from 'react';
import { Header } from './components/Header';
import { MarketOverview } from './components/MarketOverview';
import { PriceChart } from './components/PriceChart';
import { TickerList } from './components/TickerList';
import { type NavSection, TopNav } from './components/TopNav';
import { useMarketStream } from './hooks/useMarketStream';
import { useTheme } from './hooks/useTheme';
import { formatPrice } from './lib/format';
import type { Tick } from './types';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<NavSection>('Dashboard');
  const { tickers, selected, selectedTick, history, ticksBySymbol, loading, error, connected, selectTicker } =
    useMarketStream();

  if (loading) {
    return <div className="state-message">Loading market data...</div>;
  }

  if (error) {
    return <div className="state-message error">{error}</div>;
  }

  return (
    <main className="layout">
      <TopNav
        connected={connected}
        theme={theme}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onToggleTheme={toggleTheme}
      />
      {activeSection === 'Dashboard' && (
        <>
          <Header selected={selected} selectedTick={selectedTick} connected={connected} />
          <MarketOverview tickers={tickers} ticksBySymbol={ticksBySymbol} connected={connected} />
          <div className="grid">
            <TickerList tickers={tickers} selected={selected} ticksBySymbol={ticksBySymbol} onSelect={selectTicker} />
            {selected ? (
              <PriceChart symbol={selected} history={history} />
            ) : (
              <section className="panel chart-panel empty">No ticker selected</section>
            )}
          </div>
        </>
      )}
      {activeSection === 'Markets' && (
        <section className="panel section-panel">
          <div className="panel-header">
            <h2>Market Snapshot</h2>
          </div>
          <div className="section-table">
            <div className="section-row head">
              <span>Symbol</span>
              <span>Last</span>
              <span>24h</span>
            </div>
            {tickers.map((symbol) => {
              const tick = ticksBySymbol[symbol];
              return (
                <button className="section-row data" key={symbol} onClick={() => selectTicker(symbol)}>
                  <span>{symbol}</span>
                  <span>{tick ? formatPrice(symbol, tick.price) : '--'}</span>
                  <span className={(tick?.change24hPct ?? 0) >= 0 ? 'up' : 'down'}>
                    {tick ? `${tick.change24hPct >= 0 ? '+' : ''}${tick.change24hPct.toFixed(2)}%` : '--'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
      {activeSection === 'Insights' && (
        <section className="panel section-panel">
          <div className="panel-header">
            <h2>Insights</h2>
          </div>
          <div className="insight-grid">
            {getInsightCards(tickers, ticksBySymbol).map((card) => (
              <article className="insight-card" key={card.label}>
                <span>{card.label}</span>
                <strong className={card.trend}>{card.value}</strong>
                <p>{card.note}</p>
              </article>
            ))}
          </div>
        </section>
      )}
      {activeSection === 'Settings' && (
        <section className="panel section-panel">
          <div className="panel-header">
            <h2>Settings</h2>
          </div>
          <div className="settings-grid">
            <article className="setting-card">
              <span>Theme</span>
              <strong>{theme === 'dark' ? 'Dark' : 'Light'} Mode</strong>
              <button className="theme-toggle" onClick={toggleTheme}>
                Toggle Theme
              </button>
            </article>
            <article className="setting-card">
              <span>Connection</span>
              <strong className={connected ? 'up' : 'down'}>{connected ? 'Live Feed Active' : 'Feed Offline'}</strong>
              <p>WebSocket stream updates every 1.5 seconds.</p>
            </article>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;

function getInsightCards(tickers: string[], ticksBySymbol: Record<string, Tick>) {
  const liveTicks = tickers
    .map((symbol) => ticksBySymbol[symbol])
    .filter((tick): tick is Tick => Boolean(tick));

  if (liveTicks.length === 0) {
    return [
      { label: 'Momentum', value: '--', trend: '', note: 'Waiting for stream data' },
      { label: 'Volatility', value: '--', trend: '', note: 'Waiting for stream data' },
      { label: 'Breadth', value: '--', trend: '', note: 'Waiting for stream data' }
    ];
  }

  const sorted = [...liveTicks].sort((a, b) => b.change24hPct - a.change24hPct);
  const momentum = sorted[0];
  const volatility = liveTicks.reduce((sum, tick) => sum + Math.abs(tick.change24hPct), 0) / liveTicks.length;
  const upCount = liveTicks.filter((tick) => tick.change24hPct >= 0).length;

  return [
    {
      label: 'Momentum Leader',
      value: `${momentum.symbol} ${momentum.change24hPct >= 0 ? '+' : ''}${momentum.change24hPct.toFixed(2)}%`,
      trend: momentum.change24hPct >= 0 ? 'up' : 'down',
      note: 'Best performer over the rolling 24h window'
    },
    {
      label: 'Average Volatility',
      value: `${volatility.toFixed(2)}%`,
      trend: volatility > 1 ? 'down' : 'up',
      note: 'Mean absolute move across all tracked instruments'
    },
    {
      label: 'Market Breadth',
      value: `${upCount}/${liveTicks.length} Up`,
      trend: upCount >= liveTicks.length / 2 ? 'up' : 'down',
      note: 'Advancers relative to total active symbols'
    }
  ];
}
