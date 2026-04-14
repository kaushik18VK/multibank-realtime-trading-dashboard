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

type Props = {
  symbol: TickerSymbol;
  history: HistoricalPoint[];
};

export function PriceChart({ symbol, history }: Props) {
  return (
    <section className="panel chart-panel">
      <div className="panel-header">
        <h2>{symbol} Live Chart</h2>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16a34a" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0.02} />
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
                background: '#0f172a',
                border: '1px solid rgba(148,163,184,0.35)',
                borderRadius: '10px'
              }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#priceFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
