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


def _calculate_zones_for_session(session_df: pd.DataFrame, test_df: pd.DataFrame, session_date: str) -> List[Dict[str, Any]]:
    if session_df.empty or len(session_df) < 5:
        return []

    session_df = session_df.copy()
    session_df["time"] = session_df.index.time
    session_df["bracket"] = session_df["time"].apply(assign_tpo_letter)

    bracket_summary = []
    for bracket in TPO_BRACKETS:
        letter = bracket["letter"]
        b_df = session_df[session_df["bracket"] == letter]
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
        return []

    session_min = float(session_df["Low"].min())
    session_max = float(session_df["High"].max())
    price_range = session_max - session_min
    if price_range <= 0:
        return []

    num_bins = 200
    step = price_range / num_bins
    price_levels = [session_min + i * step for i in range(num_bins + 1)]

    level_brackets = []
    for p in price_levels:
        active = [b["letter"] for b in bracket_summary if b["low"] <= p <= b["high"]]
        level_brackets.append(active)

    raw_zones = []
    current_zone = None
    for i, (p, brackets) in enumerate(zip(price_levels, level_brackets)):
        if len(brackets) == 1:
            letter = brackets[0]
            if current_zone is None:
                current_zone = {"low": p, "high": p + step, "bracket": letter, "count": 1}
            elif current_zone["bracket"] == letter:
                current_zone["high"] = p + step
                current_zone["count"] += 1
            else:
                raw_zones.append(current_zone)
                current_zone = {"low": p, "high": p + step, "bracket": letter, "count": 1}
        else:
            if current_zone is not None:
                raw_zones.append(current_zone)
                current_zone = None

    if current_zone is not None:
        raw_zones.append(current_zone)

    meaningful_zones = [z for z in raw_zones if z["count"] >= 2]
    bracket_dict = {b["letter"]: b for b in bracket_summary}
    classified_zones = []

    session_start_ts = int(session_df.index[0].timestamp())
    session_end_ts = int(session_df.index[-1].timestamp())

    test_low = float(test_df["Low"].min()) if not test_df.empty else None
    test_high = float(test_df["High"].max()) if not test_df.empty else None

    for idx, zone in enumerate(meaningful_zones):
        b_info = bracket_dict.get(zone["bracket"])
        zone_mid = (zone["low"] + zone["high"]) / 2
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

        status = "UNFILLED (Active)"
        if test_low is not None and test_high is not None:
            if test_high >= zone["high"] and test_low <= zone["low"]:
                status = "FULLY FILLED (Mitigated)"
            elif (test_low <= zone["high"] and test_low >= zone["low"]) or (test_high >= zone["low"] and test_high <= zone["high"]):
                status = "TESTING / PARTIALLY FILLED"
            elif test_low > zone["high"]:
                status = "UNTESTED (Price Above)"
            elif test_high < zone["low"]:
                status = "UNTESTED (Price Below)"

        classified_zones.append({
            "id": f"sp-{session_date}-{idx+1}",
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
            "date": session_date,
            "startTime": session_start_ts,
            "endTime": session_end_ts,
            "bracketTime": f"{b_info['start']} - {b_info['end']}" if b_info else ""
        })

    return classified_zones


def calculate_single_prints(df: pd.DataFrame, target_date: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyzes intraday candle data.
    Computes single prints for all sessions and specifically classifies the selected target session.
    """
    if df.empty or len(df) < 5:
        return {"zones": [], "yesterday_date": None, "brackets": [], "available_dates": [], "all_zones": []}

    df = df.copy()
    if not isinstance(df.index, pd.DatetimeIndex):
        df.index = pd.to_datetime(df.index)

    # Group by trading date
    df["date"] = df.index.date
    unique_dates = sorted(df["date"].unique())
    available_date_strs = [str(d) for d in reversed(unique_dates)]

    today_date = unique_dates[-1]
    if target_date:
        matched = [d for d in unique_dates if str(d) == target_date]
        selected_date = matched[0] if matched else (unique_dates[-2] if len(unique_dates) > 1 else unique_dates[0])
    else:
        selected_date = unique_dates[-2] if len(unique_dates) > 1 else unique_dates[0]

    all_zones = []
    daily_map: Dict[str, List[Dict[str, Any]]] = {}

    for i, d in enumerate(unique_dates):
        d_str = str(d)
        session_df = df[df["date"] == d]
        # Test against subsequent days
        after_df = df[df["date"] > d]
        day_zones = _calculate_zones_for_session(session_df, after_df, d_str)
        daily_map[d_str] = day_zones
        all_zones.extend(day_zones)

    selected_zones = daily_map.get(str(selected_date), [])

    selected_df = df[df["date"] == selected_date]
    session_max = float(selected_df["High"].max()) if not selected_df.empty else 0.0
    session_min = float(selected_df["Low"].min()) if not selected_df.empty else 0.0

    return {
        "yesterday_date": str(selected_date),
        "selected_date": str(selected_date),
        "today_date": str(today_date),
        "available_dates": available_date_strs,
        "zones": selected_zones,
        "all_zones": all_zones,
        "yesterday_high": round(session_max, 2),
        "yesterday_low": round(session_min, 2)
    }

