"""
SQLite Database module for Watchlist / Wishlist and Historical Market Data.
"""

import sqlite3
import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

DB_PATH = Path(__file__).parent / "market_data.db"


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes tables for wishlist, custom universe stocks, and historical candles."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Watchlist / Wishlist Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS watchlist (
            symbol TEXT PRIMARY KEY,
            name TEXT,
            sector TEXT,
            added_at TEXT
        )
    """)

    # 2. Universe Stocks Table (all discovered/imported stocks)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS universe_stocks (
            symbol TEXT PRIMARY KEY,
            name TEXT,
            sector TEXT,
            lot_size INTEGER DEFAULT 100,
            is_fno INTEGER DEFAULT 1
        )
    """)

    # 3. Historical Data Cache / Storage (prepared for historical bars)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS historical_data (
            symbol TEXT,
            session_date TEXT,
            timestamp INTEGER,
            open REAL,
            high REAL,
            low REAL,
            close REAL,
            volume INTEGER,
            PRIMARY KEY (symbol, timestamp)
        )
    """)

    conn.commit()

    # Seed default watchlist if empty
    cursor.execute("SELECT COUNT(*) as count FROM watchlist")
    row = cursor.fetchone()
    if row and row["count"] == 0:
        default_seed = [
            ("RELIANCE", "Reliance Industries Ltd.", "Energy"),
            ("TCS", "Tata Consultancy Services Ltd.", "IT"),
            ("HDFCBANK", "HDFC Bank Ltd.", "Financial Services"),
            ("INFY", "Infosys Ltd.", "IT"),
            ("ICICIBANK", "ICICI Bank Ltd.", "Financial Services"),
            ("SBIN", "State Bank of India", "Financial Services"),
            ("BHARTIARTL", "Bharti Airtel Ltd.", "Telecom"),
            ("ITC", "ITC Ltd.", "FMCG"),
            ("TATAMOTORS", "Tata Motors Ltd.", "Automobile"),
            ("BAJFINANCE", "Bajaj Finance Ltd.", "Financial Services"),
        ]
        now = datetime.datetime.now().isoformat()
        cursor.executemany(
            "INSERT OR IGNORE INTO watchlist (symbol, name, sector, added_at) VALUES (?, ?, ?, ?)",
            [(s[0], s[1], s[2], now) for s in default_seed]
        )
        conn.commit()

    conn.close()


def get_all_watchlist() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT symbol, name, sector, added_at FROM watchlist ORDER BY added_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [{"symbol": r["symbol"], "name": r["name"], "sector": r["sector"], "addedAt": r["added_at"]} for r in rows]


def add_to_watchlist(symbol: str, name: str = "", sector: str = "") -> Dict[str, Any]:
    clean_sym = symbol.strip().upper().replace("NSE:", "").replace("BSE:", "")
    if not clean_sym:
        return {}
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.datetime.now().isoformat()
    cursor.execute(
        "INSERT OR REPLACE INTO watchlist (symbol, name, sector, added_at) VALUES (?, ?, ?, ?)",
        (clean_sym, name or clean_sym, sector or "NSE Equities", now)
    )
    cursor.execute(
        "INSERT OR IGNORE INTO universe_stocks (symbol, name, sector) VALUES (?, ?, ?)",
        (clean_sym, name or clean_sym, sector or "NSE Equities")
    )
    conn.commit()
    conn.close()
    return {"symbol": clean_sym, "name": name or clean_sym, "sector": sector or "NSE Equities", "addedAt": now}


def remove_from_watchlist(symbol: str) -> bool:
    clean_sym = symbol.strip().upper().replace("NSE:", "").replace("BSE:", "")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM watchlist WHERE symbol = ?", (clean_sym,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


def is_in_watchlist(symbol: str) -> bool:
    clean_sym = symbol.strip().upper().replace("NSE:", "").replace("BSE:", "")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM watchlist WHERE symbol = ?", (clean_sym,))
    exists = cursor.fetchone() is not None
    conn.close()
    return exists


def import_watchlist_from_text(raw_text: str) -> List[Dict[str, Any]]:
    """
    Parses TradingView watchlist export text format.
    Accepts comma-separated or line-separated symbols like:
    NSE:RELIANCE, NSE:TCS, INFY, BSE:HDFCBANK
    """
    import re
    # Split by commas, newlines, semicolons, tabs
    tokens = re.split(r"[\r\n,;\t]+", raw_text)
    imported = []
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.datetime.now().isoformat()

    for token in tokens:
        cleaned = token.strip()
        if not cleaned or cleaned.startswith("###"):
            continue
        # Remove exchange prefixes
        cleaned = re.sub(r"^(NSE|BSE):", "", cleaned, flags=re.IGNORECASE).strip().upper()
        if not cleaned or len(cleaned) > 20:
            continue

        cursor.execute(
            "INSERT OR REPLACE INTO watchlist (symbol, name, sector, added_at) VALUES (?, ?, ?, ?)",
            (cleaned, cleaned, "Imported Watchlist", now)
        )
        cursor.execute(
            "INSERT OR IGNORE INTO universe_stocks (symbol, name, sector) VALUES (?, ?, ?)",
            (cleaned, cleaned, "Imported Universe")
        )
        imported.append({"symbol": cleaned, "name": cleaned, "sector": "Imported Watchlist", "addedAt": now})

    conn.commit()
    conn.close()
    return imported
