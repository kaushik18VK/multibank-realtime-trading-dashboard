import { useState } from 'react';
import type { ThemeMode } from '../hooks/useTheme';

type Props = {
  connected: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
};

const NAV_ITEMS = ['Dashboard', 'Markets', 'Insights', 'Settings'] as const;

export function TopNav({ connected, theme, onToggleTheme }: Props) {
  const [active, setActive] = useState<(typeof NAV_ITEMS)[number]>('Dashboard');

  return (
    <nav className="panel topnav">
      <div className="brand-block">
        <span className="brand-dot" />
        <div>
          <strong>MultiBank Terminal</strong>
          <p>Real-time execution view</p>
        </div>
      </div>

      <div className="nav-links" role="tablist" aria-label="Dashboard Sections">
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            className={`nav-link ${active === item ? 'active' : ''}`}
            onClick={() => setActive(item)}
            role="tab"
            aria-selected={active === item}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="nav-actions">
        <span className={`feed-state ${connected ? 'up' : 'down'}`}>{connected ? 'Feed Live' : 'Feed Offline'}</span>
        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </nav>
  );
}
