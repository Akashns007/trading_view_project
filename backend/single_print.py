"""
Single Print (TPO / Market Profile) Calculation Engine
Identifies single prints on yesterday's trading session and tracks today's price interaction.
"""

from datetime import datetime, time
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np


# Standard Indian Market 30-minute TPO Brackets (09:15 to 15:30 IST)
TPO_BRACKETS = [
    {"letter": "A", "start": time(9, 15), "end": time(9, 45)},
    {"letter": "B", "start": time(9, 45), "end": time(10, 15)},
    {"letter": "C", "start": time(10, 15), "end": time(10, 45)},
    {"letter": "D", "start": time(10, 45), "end": time(11, 15)},
    {"letter": "E", "start": time(11, 15), "end": time(11, 45)},
    {"letter": "F", "start": time(11, 45), "end": time(12, 15)},
    {"letter": "G", "start": time(12, 15), "end": time(12, 45)},
    {"letter": "H", "start": time(12, 45), "end": time(13, 15)},
    {"letter": "I", "start": time(13, 15), "end": time(13, 45)},
    {"letter": "J", "start": time(13, 45), "end": time(14, 15)},
    {"letter": "K", "start": time(14, 15), "end": time(14, 45)},
    {"letter": "L", "start": time(14, 45), "end": time(15, 15)},
    {"letter": "M", "start": time(15, 15), "end": time(15, 30)},
]


def assign_tpo_letter(candle_time: time) -> Optional[str]:
    """Finds which 30-min bracket a candle timestamp belongs to."""
    for bracket in TPO_BRACKETS:
        if bracket["start"] <= candle_time < bracket["end"]:
            return bracket["letter"]
    if candle_time >= time(15, 15):
        return "M"
    if candle_time < time(9, 15):
        return "A"
    return None


def calculate_single_prints(df: pd.DataFrame, target_date: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyzes intraday candle data.
    Finds the requested date's (or yesterday's) 30-min brackets,
    computes single prints, and determines if current price has tested/filled them.
    """
    if df.empty or len(df) < 5:
        return {"zones": [], "yesterday_date": None, "brackets": [], "available_dates": []}

    df = df.copy()
    if not isinstance(df.index, pd.DatetimeIndex):
        df.index = pd.to_datetime(df.index)

    # Group by trading date
    df["date"] = df.index.date
    unique_dates = sorted(df["date"].unique())
    available_date_strs = [str(d) for d in reversed(unique_dates)]

    # Determine which date to analyze
    today_date = unique_dates[-1]
    if target_date:
        matched = [d for d in unique_dates if str(d) == target_date]
        if matched:
            selected_date = matched[0]
        else:
            selected_date = unique_dates[-2] if len(unique_dates) > 1 else unique_dates[0]
    else:
        # Default to previous session (yesterday)
        selected_date = unique_dates[-2] if len(unique_dates) > 1 else unique_dates[0]

    yesterday_df = df[df["date"] == selected_date]
    today_df = df[df["date"] == today_date]

    if yesterday_df.empty:
        return {"zones": [], "yesterday_date": str(selected_date), "brackets": [], "available_dates": available_date_strs}

    # Assign bracket to each candle in yesterday's session
    yesterday_df = yesterday_df.copy()
    yesterday_df["time"] = yesterday_df.index.time
    yesterday_df["bracket"] = yesterday_df["time"].apply(assign_tpo_letter)

    # Compute high, low, open, close per bracket
    bracket_summary = []
    for bracket in TPO_BRACKETS:
        letter = bracket["letter"]
        b_df = yesterday_df[yesterday_df["bracket"] == letter]
        if not b_df.empty:
            b_high = float(b_df["High"].max())
            b_low = float(b_df["Low"].min())
            b_open = float(b_df["Open"].iloc[0])
            b_close = float(b_df["Close"].iloc[-1])
            bracket_summary.append({
                "letter": letter,
                "start": bracket["start"].strftime("%H:%M"),
                "end": bracket["end"].strftime("%H:%M"),
                "high": b_high,
                "low": b_low,
                "open": b_open,
                "close": b_close
            })

    if len(bracket_summary) < 2:
        return {"zones": [], "yesterday_date": str(yesterday_date), "brackets": bracket_summary}

    session_min = float(yesterday_df["Low"].min())
    session_max = float(yesterday_df["High"].max())

    # Step size for price discretization
    price_range = session_max - session_min
    if price_range <= 0:
        return {"zones": [], "yesterday_date": str(yesterday_date), "brackets": bracket_summary}

    # Use reasonable resolution (approx 150-250 price bins)
    num_bins = 200
    step = price_range / num_bins
    price_levels = [session_min + i * step for i in range(num_bins + 1)]

    # For each price level, record which brackets traded at this price
    level_brackets = []
    for p in price_levels:
        active = [b["letter"] for b in bracket_summary if b["low"] <= p <= b["high"]]
        level_brackets.append(active)

    # Identify contiguous blocks where exactly ONE bracket traded (Single Prints)
    raw_zones = []
    current_zone = None

    for i, (p, brackets) in enumerate(zip(price_levels, level_brackets)):
        if len(brackets) == 1:
            letter = brackets[0]
            if current_zone is None:
                current_zone = {
                    "low": p,
                    "high": p + step,
                    "bracket": letter,
                    "count": 1
                }
            elif current_zone["bracket"] == letter:
                current_zone["high"] = p + step
                current_zone["count"] += 1
            else:
                raw_zones.append(current_zone)
                current_zone = {
                    "low": p,
                    "high": p + step,
                    "bracket": letter,
                    "count": 1
                }
        else:
            if current_zone is not None:
                raw_zones.append(current_zone)
                current_zone = None

    if current_zone is not None:
        raw_zones.append(current_zone)

    # Filter out tiny noise (require at least 2 consecutive price bins)
    meaningful_zones = [z for z in raw_zones if z["count"] >= 2]

    # Classify as Buying vs Selling Single Print
    bracket_dict = {b["letter"]: b for b in bracket_summary}
    classified_zones = []

    for idx, zone in enumerate(meaningful_zones):
        b_info = bracket_dict.get(zone["bracket"])
        zone_mid = (zone["low"] + zone["high"]) / 2

        # Buying Single Print: Price surged upward leaving single prints below
        # Selling Single Print: Price collapsed downward leaving single prints above
        if b_info and b_info["close"] >= b_info["open"]:
            sp_type = "BUYING"
            role = "Support Zone (Bullish Defense)"
            color = "rgba(38, 166, 154, 0.25)"
            border_color = "#26a69a"
        else:
            sp_type = "SELLING"
            role = "Resistance Zone (Bearish Defense)"
            color = "rgba(239, 83, 80, 0.25)"
            border_color = "#ef5350"

        # Check today's price action against this single print zone
        today_low = float(today_df["Low"].min()) if not today_df.empty else None
        today_high = float(today_df["High"].max()) if not today_df.empty else None
        status = "UNFILLED (Active)"

        if today_low is not None and today_high is not None:
            if today_high >= zone["high"] and today_low <= zone["low"]:
                status = "FULLY FILLED (Mitigated)"
            elif (today_low <= zone["high"] and today_low >= zone["low"]) or \
                 (today_high >= zone["low"] and today_high <= zone["high"]):
                status = "TESTING / PARTIALLY FILLED"
            elif today_low > zone["high"]:
                status = "UNTESTED (Price Above)"
            elif today_high < zone["low"]:
                status = "UNTESTED (Price Below)"

        classified_zones.append({
            "id": f"sp-{idx+1}",
            "bracket": zone["bracket"],
            "low": round(zone["low"], 2),
            "high": round(zone["high"], 2),
            "mid": round(zone_mid, 2),
            "width": round(zone["high"] - zone["low"], 2),
            "type": sp_type,
            "role": role,
            "status": status,
            "color": color,
            "borderColor": border_color,
            "date": str(selected_date),
            "bracketTime": f"{b_info['start']} - {b_info['end']}" if b_info else ""
        })

    return {
        "yesterday_date": str(selected_date),
        "selected_date": str(selected_date),
        "today_date": str(today_date),
        "available_dates": available_date_strs,
        "zones": classified_zones,
        "brackets": bracket_summary,
        "yesterday_high": round(session_max, 2),
        "yesterday_low": round(session_min, 2)
    }
