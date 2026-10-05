# NSE F&O Volume Scanner & TradingView Single Prints Platform

A high-performance trading platform that merges **NSE F&O Volume-at-Price analysis** around previous session opens with an interactive **TradingView Candlestick & Market Profile Single Prints** engine.

Powered by a **Python (FastAPI + `uv`)** real-market backend and a modern **React (Vite + TypeScript)** frontend using TradingView's official **Lightweight Charts**.

---

## 🚀 Quick Start

### 1. Requirements
* [Python 3.10+](https://www.python.org/) with [`uv`](https://github.com/astral-sh/uv)
* [Node.js 20+](https://nodejs.org/) with `npm`

### 2. Run the Unified Application (One Command)
Run the backend with `uv` (it serves both the real market API and the built React SPA):
```bash
uv run python main.py
```
Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser!

### 3. Development Mode (Hot Reloading)
To run frontend and backend with hot-reloading:

* **Backend**:
  ```bash
  uv run python main.py
  ```
* **Frontend** (in a separate terminal):
  ```bash
  npm run dev:frontend
  ```
  Vite will launch on **http://localhost:5173** and automatically proxy API calls to the FastAPI backend.

---

## 📁 Project Architecture

```
trading_view/
├── backend/                  # Python FastAPI Backend (powered by uv)
│   ├── app.py                # REST API, SSE streaming, static SPA mount
│   ├── market_engine.py      # Volume-at-Price bucketing, above/below levels, F&O universe
│   ├── single_print.py       # Market Profile 30-min TPO Single Prints detector
│   └── data_service.py       # Real NSE intraday data pipeline with in-memory cache
│
├── frontend/                 # React 18 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts.tsx    # TradingView Candlestick + Volume + Single Prints overlays
│   │   │   ├── layout.tsx    # Top navigation & sidebar
│   │   │   └── ui.tsx        # Badges, cards, tables, breadcrumbs
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx # Market summary, gaps, active instruments
│   │   │   ├── Scanner.tsx   # Live table with Above/Below reference levels
│   │   │   ├── Profile.tsx   # TradingView Candlestick chart + Volume-by-Price audit
│   │   │   ├── Monitor.tsx   # Feed health, connection quality, diagnostics
│   │   │   └── Stocks.tsx    # F&O universe search and lot sizes
│   │   ├── api.ts            # Typed client API
│   │   └── types.ts          # Complete domain types
│   ├── dist/                 # Production-built bundle served by backend
│   └── package.json
│
├── main.py                   # Root entrypoint (uv run python main.py)
├── package.json              # Workspace scripts
├── pyproject.toml            # uv dependencies (fastapi, uvicorn, yfinance, pandas)
└── ARCHITECTURE.md           # Detailed architecture and data pipeline docs
```

---

## 🎯 Key Features

1. **Real NSE Market Data**:
   * Pulls real intraday trades and candles for the 22 core NSE F&O equities and indices (RELIANCE, TCS, HDFCBANK, INFY, ICICIBANK, SBIN, AIRTEL, NIFTY 50, etc.).
2. **Previous Open Volume Analysis**:
   * Automatically extracts the previous session's opening price.
   * Determines up to 3 highest-volume price levels strictly above and strictly below that open.
   * Computes point distance and signed gap percentages.
3. **Interactive TradingView Candlestick Chart**:
   * Built with official **TradingView Lightweight Charts v5**.
   * Real candlesticks with green (`#089981`) and red (`#f23645`) bodies and wicks.
   * Volume histogram at the bottom with buy/sell color matching.
   * Interactive reference lines: Previous Open, Above Levels (A1, A2, A3), Below Levels (B1, B2, B3), and Current Price.
4. **Market Profile Single Prints (TPO)**:
   * Discretizes yesterday's session into 30-minute brackets (`A` to `M`).
   * Detects single print price bands left by rapid institutional buying or selling.
   * Displays support / resistance zones on the chart with a dedicated checkbox toggle.
