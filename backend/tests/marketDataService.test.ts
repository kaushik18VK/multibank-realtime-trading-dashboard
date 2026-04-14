import { describe, expect, it } from 'vitest';
import { MarketDataService } from '../src/marketDataService.js';

describe('MarketDataService', () => {
  it('returns configured tickers', () => {
    const service = new MarketDataService();
    expect(service.getAvailableTickers()).toContain('BTC-USD');
    expect(service.getAvailableTickers().length).toBeGreaterThan(3);
  });

  it('generates ticks with valid shape', () => {
    const service = new MarketDataService();
    const tick = service.generateNextTick('AAPL');

    expect(tick.symbol).toBe('AAPL');
    expect(typeof tick.price).toBe('number');
    expect(typeof tick.change24hPct).toBe('number');
    expect(new Date(tick.timestamp).toISOString()).toBe(tick.timestamp);
  });

  it('retains recent history up to limit', () => {
    const service = new MarketDataService(10);
    for (let i = 0; i < 50; i++) {
      service.generateNextTick('TSLA');
    }

    const history = service.getHistory('TSLA', 999);
    expect(history.length).toBeLessThanOrEqual(10);
  });
});
