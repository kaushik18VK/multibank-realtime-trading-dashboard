import { Header } from './components/Header';
import { MarketOverview } from './components/MarketOverview';
import { PriceChart } from './components/PriceChart';
import { TickerList } from './components/TickerList';
import { TopNav } from './components/TopNav';
import { useMarketStream } from './hooks/useMarketStream';
import { useTheme } from './hooks/useTheme';

function App() {
  const { theme, toggleTheme } = useTheme();
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
      <TopNav connected={connected} theme={theme} onToggleTheme={toggleTheme} />
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
    </main>
  );
}

export default App;
