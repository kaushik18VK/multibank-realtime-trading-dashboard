import type { ThemeMode } from '../hooks/useTheme';

export const NAV_ITEMS = ['Dashboard', 'Markets', 'Insights', 'Settings'] as const;
export type NavSection = (typeof NAV_ITEMS)[number];

type Props = {
  connected: boolean;
  theme: ThemeMode;
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
  onToggleTheme: () => void;
};

export function TopNav({ connected, theme, activeSection, onSectionChange, onToggleTheme }: Props) {
  return (
    <nav className="panel topnav">
      <div className="brand-block">
        <span className="brand-mark" aria-hidden>
          MB
        </span>
        <div className="brand-copy">
          <strong>MultiBank Terminal</strong>
          <p>Institutional multi-asset monitoring</p>
        </div>
      </div>

      <div className="nav-links" role="tablist" aria-label="Dashboard Sections">
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            className={`nav-link ${activeSection === item ? 'active' : ''}`}
            onClick={() => onSectionChange(item)}
            role="tab"
            aria-selected={activeSection === item}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="nav-actions">
        <span className="nav-chip">Global Markets</span>
        <span className={`feed-state ${connected ? 'up' : 'down'}`}>{connected ? 'Feed Live' : 'Feed Offline'}</span>
        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </nav>
  );
}
