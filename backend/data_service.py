"""
Market Data Service for Indian Equities and Indices
Fetches and standardizes intraday candles for TradingView charting.
"""

from typing import List, Dict, Any, Tuple
import time
import pandas as pd
import yfinance as yf

# In-memory cache to avoid repeated yahoo requests: {cache_key: (timestamp, data)}
_CACHE: Dict[str, Tuple[float, Any]] = {}
CACHE_TTL_SECONDS = 60


INDIAN_SYMBOL_ALIASES = {
    "NIFTY": "^NSEI",
    "NIFTY50": "^NSEI",
    "NIFTY 50": "^NSEI",
    "BANKNIFTY": "^NSEBANK",
    "BANK NIFTY": "^NSEBANK",
    "FINNIFTY": "NIFTY_FIN_SERVICE.NS",
}


def normalize_symbol(symbol: str) -> str:
    """Standardizes user input symbol to Yahoo Finance ticker format for Indian market."""
    clean = symbol.strip().upper()
    if clean in INDIAN_SYMBOL_ALIASES:
        return INDIAN_SYMBOL_ALIASES[clean]
    if clean.startswith("^"):
        return clean
    if ":" in clean:
        clean = clean.split(":")[-1].strip()
    if not (clean.endswith(".NS") or clean.endswith(".BO")):
        clean = f"{clean}.NS"
    return clean


def get_display_name(symbol: str) -> str:
    """Returns clean human-readable name without exchange suffix."""
    s = symbol.upper()
    if s == "^NSEI":
        return "NIFTY 50"
    if s == "^NSEBANK":
        return "BANK NIFTY"
    return s.replace(".NS", "").replace(".BO", "")


def fetch_intraday_candles(symbol: str, interval: str = "5m", period: str = "5d") -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Fetches intraday historical candles for the given symbol.
    Returns clean DataFrame and metadata.
    """
    norm_sym = normalize_symbol(symbol)
    cache_key = f"{norm_sym}_{interval}_{period}"
    now = time.time()

    if cache_key in _CACHE:
        cached_time, cached_df = _CACHE[cache_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            return cached_df, {"symbol": norm_sym, "display": get_display_name(norm_sym), "cached": True}

    try:
        # Download from yfinance
        df = yf.download(
            tickers=norm_sym,
            period=period,
            interval=interval,
            progress=False,
            auto_adjust=True
        )

        if df.empty:
            # Try without .NS if failed, or try with .BO
            alt_sym = norm_sym.replace(".NS", ".BO") if ".NS" in norm_sym else norm_sym
            if alt_sym != norm_sym:
                df = yf.download(tickers=alt_sym, period=period, interval=interval, progress=False, auto_adjust=True)
                if not df.empty:
                    norm_sym = alt_sym

        if df.empty:
            raise ValueError(f"No data returned for symbol {symbol}")

        # Flatten multi-index columns if present (recent yfinance change)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = [col[0] for col in df.columns]

        # Ensure datetime index is localized and sorted
        df.sort_index(inplace=True)
        _CACHE[cache_key] = (now, df)
        return df, {"symbol": norm_sym, "display": get_display_name(norm_sym), "cached": False}

    except Exception as e:
        # If cache exists even if expired, return it as fallback
        if cache_key in _CACHE:
            return _CACHE[cache_key][1], {"symbol": norm_sym, "display": get_display_name(norm_sym), "cached": True, "error_fallback": str(e)}
        raise e


def format_candles_for_lightweight_charts(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Formats DataFrame rows to TradingView Lightweight Charts format:
    [{ time: timestamp_seconds, open, high, low, close, volume }]
    """
    candles = []
    if df.empty:
        return candles

    for dt, row in df.iterrows():
        # Convert pandas timestamp to unix timestamp in seconds
        ts = int(dt.timestamp())
        o = float(row.get("Open", 0.0))
        h = float(row.get("High", 0.0))
        l = float(row.get("Low", 0.0))
        c = float(row.get("Close", 0.0))
        v = float(row.get("Volume", 0.0))

        # Check for NaNs
        if pd.isna(o) or pd.isna(h) or pd.isna(l) or pd.isna(c):
            continue

        candles.append({
            "time": ts,
            "open": round(o, 2),
            "high": round(h, 2),
            "low": round(l, 2),
            "close": round(c, 2),
            "volume": round(v, 2)
        })

    return candles
