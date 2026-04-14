import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { MarketDataService } from './marketDataService.js';
import type { TickerSymbol } from './types.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

const marketData = new MarketDataService();

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'trading-dashboard-backend' });
});

app.get('/api/tickers', (_req, res) => {
  res.json({ tickers: marketData.getAvailableTickers() });
});

app.get('/api/history/:symbol', (req, res) => {
  const symbol = req.params.symbol as TickerSymbol;
  const tickers = marketData.getAvailableTickers();

  if (!tickers.includes(symbol)) {
    res.status(404).json({ error: 'Unknown ticker symbol' });
    return;
  }

  const limit = Number(req.query.limit ?? 120);
  res.json({ symbol, points: marketData.getHistory(symbol, Number.isNaN(limit) ? 120 : limit) });
});

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (socket) => {
  const snapshot = marketData.generateBatchTick();
  socket.send(JSON.stringify({ type: 'snapshot', data: snapshot }));

  socket.on('message', (raw) => {
    try {
      const message = JSON.parse(raw.toString()) as { type?: string; symbol?: TickerSymbol };
      if (message.type === 'subscribe' && message.symbol) {
        const tick = marketData.generateNextTick(message.symbol);
        socket.send(JSON.stringify({ type: 'tick', data: tick }));
      }
    } catch {
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });
});

setInterval(() => {
  const ticks = marketData.generateBatchTick();
  const payload = JSON.stringify({ type: 'batch', data: ticks });
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  }
}, 1500);

server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
