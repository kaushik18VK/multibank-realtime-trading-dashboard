import { Header } from './components/Header';
import { PriceChart } from './components/PriceChart';
import { TickerList } from './components/TickerList';
import { useMarketStream } from './hooks/useMarketStream';

function App() {
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
      <Header selected={selected} selectedTick={selectedTick} connected={connected} />
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
