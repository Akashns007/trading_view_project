"""
NSE F&O Market Engine
Calculates Volume-at-Price profiles, strictly above/below levels around previous open,
and integrates real NSE market feeds.
"""

from typing import List, Dict, Any, Optional, Tuple
import datetime
import math
import pandas as pd

from backend.data_service import (
    fetch_intraday_candles,
    format_candles_for_lightweight_charts,
    normalize_symbol,
    get_display_name
)
from backend.single_print import calculate_single_prints

from backend.universe_data import COMPREHENSIVE_NSE_UNIVERSE

# Comprehensive NSE F&O Universe with Sectors and Lot Sizes
NSE_FNO_UNIVERSE = COMPREHENSIVE_NSE_UNIVERSE



def to_paise(price: float) -> int:
    """Converts price float to integer paise."""
    return int(round(price * 100))


def from_paise(paise: int) -> float:
    """Converts integer paise back to rupee float."""
    return round(paise / 100.0, 2)


def calculate_volume_levels_from_df(
    df: pd.DataFrame,
    bucket: float = 1.0,
    top_levels: int = 3,
    previous_open: Optional[float] = None
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]], float, int]:
    """
    Computes volume-at-price levels, strictly above and strictly below previous open.
    Returns: (all_levels, above_levels, below_levels, total_volume, trade_count)
    """
    if df.empty:
        return [], [], [], 0.0, 0

    bucket_paise = max(5, int(round(bucket * 100)))
    ref_paise = to_paise(previous_open) if previous_open is not None else None

    # Group volume by bucketed price
    volume_by_bucket: Dict[int, float] = {}
    trade_count_by_bucket: Dict[int, int] = {}
    total_volume = 0.0

    for _, row in df.iterrows():
        c_open = float(row.get("Open", 0.0))
        c_high = float(row.get("High", 0.0))
        c_low = float(row.get("Low", 0.0))
        c_close = float(row.get("Close", 0.0))
        c_vol = float(row.get("Volume", 0.0))

        if pd.isna(c_open) or pd.isna(c_close) or c_vol <= 0:
            continue

        # Typical price for candle
        typ_price = (c_high + c_low + c_close) / 3.0
        p_paise = to_paise(typ_price)
        bucket_key = int(round(p_paise / bucket_paise)) * bucket_paise

        volume_by_bucket[bucket_key] = volume_by_bucket.get(bucket_key, 0.0) + c_vol
        trade_count_by_bucket[bucket_key] = trade_count_by_bucket.get(bucket_key, 0) + 1
        total_volume += c_vol

    # Format all levels
    levels = []
    for p_key, vol in sorted(volume_by_bucket.items(), key=lambda x: x[0]):
        price = from_paise(p_key)
        vol_pct = (vol / total_volume * 100.0) if total_volume > 0 else 0.0
        levels.append({
            "price": price,
            "volume": int(round(vol)),
            "tradeCount": trade_count_by_bucket.get(p_key, 1),
            "volumePercent": round(vol_pct, 2)
        })

    # Rank levels by volume descending
    def rank_key(lvl):
        dist = abs(to_paise(lvl["price"]) - ref_paise) if ref_paise is not None else 0
        return (-lvl["volume"], dist, lvl["price"])

    ranked = sorted(levels, key=rank_key)

    # Directional levels: strictly above and strictly below previous open
    above_levels = []
    below_levels = []

    if ref_paise is not None:
        ref_price = from_paise(ref_paise)
        above_candidates = [lvl for lvl in ranked if to_paise(lvl["price"]) > ref_paise][:top_levels]
        below_candidates = [lvl for lvl in ranked if to_paise(lvl["price"]) < ref_paise][:top_levels]

        for i, lvl in enumerate(above_candidates):
            signed_gap = round(lvl["price"] - ref_price, 2)
            gap_pct = round((signed_gap / ref_price) * 100.0, 2) if ref_price > 0 else 0.0
            above_levels.append({
                **lvl,
                "rank": i + 1,
                "side": "ABOVE",
                "signedGap": signed_gap,
                "pointGap": abs(signed_gap),
                "gapPercent": gap_pct
            })

        for i, lvl in enumerate(below_candidates):
            signed_gap = round(lvl["price"] - ref_price, 2)
            gap_pct = round((abs(signed_gap) / ref_price) * 100.0, 2) if ref_price > 0 else 0.0
            below_levels.append({
                **lvl,
                "rank": i + 1,
                "side": "BELOW",
                "signedGap": signed_gap,
                "pointGap": abs(signed_gap),
                "gapPercent": gap_pct
            })

    total_trade_count = sum(trade_count_by_bucket.values())
    return levels, above_levels, below_levels, total_volume, total_trade_count


def build_volume_profile(symbol: str, bucket: float = 1.0, top_levels: int = 3, date: Optional[str] = None) -> Dict[str, Any]:
    """
    Builds the full VolumeProfile payload for a symbol, including
    candlesticks, single prints, previous open, and above/below volume levels.
    """
    df, meta = fetch_intraday_candles(symbol, interval="5m", period="5d")
    sp_data = calculate_single_prints(df, target_date=date)

    # Extract sessions
    df_copy = df.copy()
    if not isinstance(df_copy.index, pd.DatetimeIndex):
        df_copy.index = pd.to_datetime(df_copy.index)
    df_copy["date"] = df_copy.index.date
    dates = sorted(df_copy["date"].unique())

    if len(dates) >= 2:
        prev_date = str(dates[-2])
        curr_date = str(dates[-1])
        prev_df = df_copy[df_copy["date"] == dates[-2]]
        curr_df = df_copy[df_copy["date"] == dates[-1]]
    elif len(dates) == 1:
        prev_date = str(dates[0])
        curr_date = str(dates[0])
        prev_df = df_copy
        curr_df = df_copy
    else:
        prev_date = "N/A"
        curr_date = "N/A"
        prev_df = pd.DataFrame()
        curr_df = pd.DataFrame()

    # Previous session's open
    prev_open = float(prev_df["Open"].iloc[0]) if not prev_df.empty else None
    current_price = float(curr_df["Close"].iloc[-1]) if not curr_df.empty else (prev_open or 0.0)

    # Compute volume profile on current session (or overall period)
    target_df = curr_df if not curr_df.empty else df_copy
    levels, above_levels, below_levels, total_vol, trade_count = calculate_volume_levels_from_df(
        target_df, bucket=bucket, top_levels=top_levels, previous_open=prev_open
    )

    # Current vs Previous Open
    curr_vs_prev = round(current_price - prev_open, 2) if prev_open is not None else None

    # Price series for simple sparklines
    price_series = []
    for dt, row in target_df.iterrows():
        price_series.append({
            "time": dt.strftime("%H:%M"),
            "price": round(float(row.get("Close", 0.0)), 2),
            "volume": int(row.get("Volume", 0))
        })

    # High-resolution candles for TradingView chart
    tv_candles = format_candles_for_lightweight_charts(df_copy)

    # Top levels by volume
    sorted_by_vol = sorted(levels, key=lambda x: -x["volume"])[:top_levels]
    hvtp = sorted_by_vol[0]["price"] if sorted_by_vol else None

    # Find stock info
    norm = meta["symbol"]
    clean_sym = meta["display"]
    stk = next((s for s in NSE_FNO_UNIVERSE if s["symbol"] == clean_sym), None)

    return {
        "symbol": clean_sym,
        "name": stk["name"] if stk else clean_sym,
        "sector": stk["sector"] if stk else "NSE F&O",
        "previousDayOpen": round(prev_open, 2) if prev_open else None,
        "previousOpen": round(prev_open, 2) if prev_open else None,
        "aboveLevels": above_levels,
        "belowLevels": below_levels,
        "currentPrice": round(current_price, 2),
        "currentVsPreviousOpen": curr_vs_prev,
        "currentPriceTime": datetime.datetime.now().strftime("%H:%M:%S"),
        "totalVolume": int(total_vol),
        "tradeCount": trade_count,
        "bucket": bucket,
        "date": curr_date,
        "previousSessionDate": prev_date,
        "status": "ok",
        "dataMode": "real",
        "calculationMode": "exact",
        "dataQuality": {"status": "complete", "state": "COMPLETE", "label": "Real Exchange Data"},
        "levels": levels,
        "topLevels": sorted_by_vol,
        "hvtp": hvtp,
        "hvtpVolume": sorted_by_vol[0]["volume"] if sorted_by_vol else 0,
        "hvtpLevels": [lvl["price"] for lvl in sorted_by_vol],
        "signedGap": curr_vs_prev,
        "pointGap": abs(curr_vs_prev) if curr_vs_prev is not None else None,
        "gapPercent": round((abs(curr_vs_prev) / prev_open) * 100.0, 2) if (curr_vs_prev and prev_open) else None,
        "currentVsHvtp": round(current_price - hvtp, 2) if hvtp else None,
        "priceSeries": price_series,
        "candles": tv_candles,
        "singlePrints": sp_data.get("zones", []),
        "availableDates": sp_data.get("available_dates", []),
        "selectedDate": sp_data.get("selected_date", curr_date)
    }
