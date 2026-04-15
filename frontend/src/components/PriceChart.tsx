import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { HistoricalPoint, TickerSymbol } from '../types';
import { formatPrice, formatTime } from '../lib/format';
import { getSymbolColor } from '../lib/theme';

type Props = {
  symbol: TickerSymbol;
  history: HistoricalPoint[];
};

export function PriceChart({ symbol, history }: Props) {
  const color = getSymbolColor(symbol);
  const gradientId = `priceFill-${symbol}`;
  const chartData = history.map((point) => ({
    ...point,
    price: Number(point.price)
  }));
  const hasData = chartData.length > 1;

  return (
    <section className="panel chart-panel">
      <div className="panel-header">
        <h2>{symbol} Live Chart</h2>
      </div>
      <div className="chart-wrap">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.42} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                minTickGap={26}
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={['auto', 'auto']} width={72} />
              <Tooltip
                formatter={(value: number) => formatPrice(symbol, value)}
                labelFormatter={(value) => formatTime(String(value))}
                contentStyle={{
                  background: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '10px'
                }}
                labelStyle={{ color: 'var(--tooltip-text)' }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">Waiting for enough points to render chart...</div>
        )}
      </div>
    </section>
  );
}
