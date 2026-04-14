# Real-Time Trading Dashboard

This project is a fullstack implementation of the MultiBank coding challenge using:
- **Frontend:** React + TypeScript + Vite + Recharts
- **Backend:** Node.js + TypeScript + Express + WebSocket (`ws`)
- **Containerization:** Docker + Docker Compose

## Features

- Live ticker list with price + 24h percentage change
- Real-time chart updates for selected instrument
- Ticker switching with historical REST backfill
- Backend REST API and WebSocket stream
- Basic backend unit tests for market data logic
- Responsive UI for desktop and mobile

## Architecture

- `backend/src/marketDataService.ts` encapsulates pricing simulation and history buffering.
- `backend/src/index.ts` exposes REST endpoints and pushes websocket updates.
- `frontend/src/hooks/useMarketStream.ts` owns data fetching, websocket handling, and UI state.
- Presentational components are split into `Header`, `TickerList`, and `PriceChart`.

## API Overview

### REST
- `GET /health`
- `GET /api/tickers`
- `GET /api/history/:symbol?limit=120`

### WebSocket
- Endpoint: `ws://localhost:4000/ws`
- Broadcast messages:
  - `snapshot`: initial per-client snapshot
  - `batch`: periodic updates for all symbols
- Client message:
  - `{ "type": "subscribe", "symbol": "BTC-USD" }`

## Run Locally

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`  
Backend default URL: `http://localhost:4000`

## Run with Docker

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Tests

Backend tests:

```bash
cd backend
npm test
```

## Assumptions and Trade-offs

- Price feed is simulated with deterministic constraints and random volatility.
- Historical prices are mocked in-memory, matching challenge requirements.
- No persistent storage is used to keep the solution lightweight.
- Authentication/caching/alerts are left as extension points.

## Bonus Notes

- Implemented clean separation between simulation logic and transport/API layers.
- Dockerized both services for reproducible execution.
