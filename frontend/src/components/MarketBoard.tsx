import { useMemo, useState } from 'react';
import { formatPrice } from '../lib/format';
import type { Tick, TickerSymbol } from '../types';

type Props = {
  tickers: TickerSymbol[];
  ticksBySymbol: Record<string, Tick>;
  onSelect: (symbol: TickerSymbol) => void;
};

type MarketRow = {
  symbol: TickerSymbol;
  name: string;
  price: number;
  change24hPct: number;
  volume24h: string;
  marketCap: string;
};

const SYMBOL_NAMES: Record<TickerSymbol, string> = {
  AAPL: 'Apple',
  TSLA: 'Tesla',
  NVDA: 'NVIDIA',
  'BTC-USD': 'Bitcoin',
  'ETH-USD': 'Ethereum',
  'SOL-USD': 'Solana',
  'XRP-USD': 'XRP',
  'XAU-USD': 'Gold Spot',
  'EUR-USD': 'Euro / Dollar',
  'GBP-USD': 'Pound / Dollar'
};

const OVERVIEW_TABS = ['Overview', 'Trading Data', 'Signal Desk', 'Token Unlock'] as const;
const MARKET_TABS = ['Favorites', 'Cryptos', 'Spot', 'Futures', 'Macro', 'New', 'Sectors'] as const;
const CATEGORY_CHIPS = [
  'All',
  'Layer 1',
  'Payments',
  'AI',
  'RWA',
  'Metals',
  'FX',
  'High Vol',
  'Low Vol'
] as const;
type MarketTab = (typeof MARKET_TABS)[number];
type MarketChip = (typeof CATEGORY_CHIPS)[number];

function humanizeMoney(value: number): string {
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function symbolSeed(symbol: string): number {
  return symbol.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function toMarketRows(tickers: TickerSymbol[], ticksBySymbol: Record<string, Tick>): MarketRow[] {
  return tickers.map((symbol) => {
    const tick = ticksBySymbol[symbol];
    const price = tick?.price ?? 0;
    const seed = symbolSeed(symbol);

    const volumeBase = Math.max(price, 1) * (seed % 37) * 95_000;
    const capBase = volumeBase * ((seed % 9) + 8);

    return {
      symbol,
      name: SYMBOL_NAMES[symbol],
      price,
      change24hPct: tick?.change24hPct ?? 0,
      volume24h: humanizeMoney(volumeBase),
      marketCap: humanizeMoney(capBase)
    };
  });
}

export function MarketBoard({ tickers, ticksBySymbol, onSelect }: Props) {
  const [activeMarketTab, setActiveMarketTab] = useState<MarketTab>('Cryptos');
  const [activeChip, setActiveChip] = useState<MarketChip>('All');

  const rows = toMarketRows(tickers, ticksBySymbol);
  const liveRows = rows.filter((row) => row.price > 0);
  const filteredRows = useMemo(() => {
    const byTab = liveRows.filter((row) => {
      switch (activeMarketTab) {
        case 'Favorites':
          return ['BTC-USD', 'ETH-USD', 'XAU-USD'].includes(row.symbol);
        case 'Cryptos':
          return ['BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD'].includes(row.symbol);
        case 'Spot':
          return true;
        case 'Futures':
          return Math.abs(row.change24hPct) >= 2;
        case 'Macro':
          return ['XAU-USD', 'EUR-USD', 'GBP-USD', 'BTC-USD'].includes(row.symbol);
        case 'New':
          return ['SOL-USD', 'XRP-USD', 'XAU-USD'].includes(row.symbol);
        case 'Sectors':
          return ['AAPL', 'TSLA', 'NVDA', 'BTC-USD', 'ETH-USD'].includes(row.symbol);
        default:
          return true;
      }
    });

    return byTab.filter((row) => {
      switch (activeChip) {
        case 'All':
          return true;
        case 'Layer 1':
          return ['ETH-USD', 'SOL-USD'].includes(row.symbol);
        case 'Payments':
          return ['XRP-USD', 'BTC-USD'].includes(row.symbol);
        case 'AI':
          return ['NVDA'].includes(row.symbol);
        case 'RWA':
          return ['XAU-USD'].includes(row.symbol);
        case 'Metals':
          return ['XAU-USD'].includes(row.symbol);
        case 'FX':
          return ['EUR-USD', 'GBP-USD'].includes(row.symbol);
        case 'High Vol':
          return Math.abs(row.change24hPct) >= 2;
        case 'Low Vol':
          return Math.abs(row.change24hPct) < 2;
        default:
          return true;
      }
    });
  }, [activeChip, activeMarketTab, liveRows]);

  const topGainers = [...filteredRows].sort((a, b) => b.change24hPct - a.change24hPct).slice(0, 3);
  const topVolume = [...filteredRows]
    .sort((a, b) => Number(b.volume24h.replace(/[^\d.]/g, '')) - Number(a.volume24h.replace(/[^\d.]/g, '')))
    .slice(0, 3);
  const hot = [...filteredRows].slice(0, 3);

  return (
    <section className="exchange-shell section-fade">
      <div className="mini-tabs" role="tablist" aria-label="Overview tabs">
        {OVERVIEW_TABS.map((tab, i) => (
          <span className={`mini-tab ${i === 0 ? 'active' : ''}`} key={tab}>
            {tab}
          </span>
        ))}
      </div>

      <div className="insight-cards">
        <Card title="Hot" rows={hot} onSelect={onSelect} />
        <Card title="New" rows={[...filteredRows].reverse().slice(0, 3)} onSelect={onSelect} />
        <Card title="Top Gainer" rows={topGainers} onSelect={onSelect} />
        <Card title="Top Volume" rows={topVolume} onSelect={onSelect} />
      </div>

      <div className="market-tabs">
        {MARKET_TABS.map((tab) => (
          <button
            className={`market-tab ${activeMarketTab === tab ? 'active' : ''}`}
            key={tab}
            onClick={() => setActiveMarketTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="chip-row">
        {CATEGORY_CHIPS.map((chip) => (
          <button className={`chip ${activeChip === chip ? 'active' : ''}`} key={chip} onClick={() => setActiveChip(chip)}>
            {chip}
          </button>
        ))}
      </div>

      <section className="market-table-wrap panel">
        <div className="table-header">
          <div>
            <h2>Top Tokens by Market Capitalization</h2>
            <p>Real-time market snapshot with 24h change, liquidity, and cap metrics.</p>
          </div>
        </div>

        <div className="table-grid head">
          <span>Name</span>
          <span>Price</span>
          <span>24h</span>
          <span>24h Volume</span>
          <span>Market Cap</span>
          <span>Actions</span>
        </div>

        {filteredRows.map((row) => (
          <button className="table-grid row" key={row.symbol} onClick={() => onSelect(row.symbol)}>
            <span className="name-cell">
              <strong>{row.symbol}</strong>
              <small>{row.name}</small>
            </span>
            <span className="mono">{row.price ? formatPrice(row.symbol, row.price) : '--'}</span>
            <span className={`mono ${row.change24hPct >= 0 ? 'up' : 'down'}`}>
              {row.change24hPct >= 0 ? '+' : ''}
              {row.change24hPct.toFixed(2)}%
            </span>
            <span className="mono">{row.volume24h}</span>
            <span className="mono">{row.marketCap}</span>
            <span className="action-icons" aria-label="actions">
              <i>◻</i>
              <i>⋮</i>
            </span>
          </button>
        ))}
      </section>

      <section className="panel market-tail-note">
        <strong>Risk note:</strong> Demo feed uses simulated market data for assessment purposes.
      </section>
    </section>
  );
}

type CardProps = {
  title: string;
  rows: MarketRow[];
  onSelect: (symbol: TickerSymbol) => void;
};

function Card({ title, rows, onSelect }: CardProps) {
  return (
    <article className="panel quick-card">
      <div className="quick-card-head">
        <span>{title}</span>
        <small>Live</small>
      </div>
      <div className="quick-card-body">
        {rows.map((row) => (
          <button className="quick-row" key={row.symbol} onClick={() => onSelect(row.symbol)}>
            <span>{row.symbol}</span>
            <span className="mono">{formatPrice(row.symbol, row.price)}</span>
            <span className={row.change24hPct >= 0 ? 'up mono' : 'down mono'}>
              {row.change24hPct >= 0 ? '+' : ''}
              {row.change24hPct.toFixed(2)}%
            </span>
          </button>
        ))}
      </div>
    </article>
  );
}
