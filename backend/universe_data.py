"""
Comprehensive NSE Stock Universe (Nifty 100 & Major F&O Equities).
"""

from typing import List, Dict, Any

COMPREHENSIVE_NSE_UNIVERSE: List[Dict[str, Any]] = [
    # Energy & Utilities
    {"symbol": "RELIANCE", "name": "Reliance Industries Ltd.", "sector": "Energy", "lotSize": 250, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "NTPC", "name": "NTPC Ltd.", "sector": "Energy", "lotSize": 1500, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "ONGC", "name": "Oil & Natural Gas Corporation Ltd.", "sector": "Energy", "lotSize": 3850, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "POWERGRID", "name": "Power Grid Corporation of India Ltd.", "sector": "Energy", "lotSize": 2700, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "BPCL", "name": "Bharat Petroleum Corporation Ltd.", "sector": "Energy", "lotSize": 1800, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "IOC", "name": "Indian Oil Corporation Ltd.", "sector": "Energy", "lotSize": 4875, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "COALINDIA", "name": "Coal India Ltd.", "sector": "Energy", "lotSize": 2100, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "TATAPOWER", "name": "Tata Power Company Ltd.", "sector": "Energy", "lotSize": 1350, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "ADANIGREEN", "name": "Adani Green Energy Ltd.", "sector": "Energy", "lotSize": 500, "instrumentType": "EQUITY", "isFno": False},
    {"symbol": "ADANIPOWER", "name": "Adani Power Ltd.", "sector": "Energy", "lotSize": 1000, "instrumentType": "EQUITY", "isFno": False},
    {"symbol": "GAIL", "name": "GAIL (India) Ltd.", "sector": "Energy", "lotSize": 2650, "instrumentType": "EQUITY", "isFno": True},

    # IT & Technology
    {"symbol": "TCS", "name": "Tata Consultancy Services Ltd.", "sector": "IT", "lotSize": 175, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "INFY", "name": "Infosys Ltd.", "sector": "IT", "lotSize": 400, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "HCLTECH", "name": "HCL Technologies Ltd.", "sector": "IT", "lotSize": 350, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "WIPRO", "name": "Wipro Ltd.", "sector": "IT", "lotSize": 1500, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "TECHM", "name": "Tech Mahindra Ltd.", "sector": "IT", "lotSize": 600, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "LTIM", "name": "LTIMindtree Ltd.", "sector": "IT", "lotSize": 150, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "PERSISTENT", "name": "Persistent Systems Ltd.", "sector": "IT", "lotSize": 100, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "COFORGE", "name": "Coforge Ltd.", "sector": "IT", "lotSize": 150, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "MPHASIS", "name": "Mphasis Ltd.", "sector": "IT", "lotSize": 275, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "LTTS", "name": "L&T Technology Services Ltd.", "sector": "IT", "lotSize": 200, "instrumentType": "EQUITY", "isFno": True},

    # Financial Services & Banking
    {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd.", "sector": "Financial Services", "lotSize": 550, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "ICICIBANK", "name": "ICICI Bank Ltd.", "sector": "Financial Services", "lotSize": 700, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "SBIN", "name": "State Bank of India", "sector": "Financial Services", "lotSize": 750, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "KOTAKBANK", "name": "Kotak Mahindra Bank Ltd.", "sector": "Financial Services", "lotSize": 400, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "AXISBANK", "name": "Axis Bank Ltd.", "sector": "Financial Services", "lotSize": 625, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "BAJFINANCE", "name": "Bajaj Finance Ltd.", "sector": "Financial Services", "lotSize": 125, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "BAJAJFINSV", "name": "Bajaj Finserv Ltd.", "sector": "Financial Services", "lotSize": 500, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "INDUSINDBK", "name": "IndusInd Bank Ltd.", "sector": "Financial Services", "lotSize": 500, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "SBILIFE", "name": "SBI Life Insurance Company Ltd.", "sector": "Financial Services", "lotSize": 750, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "HDFCLIFE", "name": "HDFC Life Insurance Company Ltd.", "sector": "Financial Services", "lotSize": 1100, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "CHOLAFIN", "name": "Cholamandalam Investment and Finance Co Ltd.", "sector": "Financial Services", "lotSize": 625, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "MUTHOOTFIN", "name": "Muthoot Finance Ltd.", "sector": "Financial Services", "lotSize": 550, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "SHRIRAMFIN", "name": "Shriram Finance Ltd.", "sector": "Financial Services", "lotSize": 300, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "PFC", "name": "Power Finance Corporation Ltd.", "sector": "Financial Services", "lotSize": 1300, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "RECLTD", "name": "REC Ltd.", "sector": "Financial Services", "lotSize": 2000, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "JIOFIN", "name": "Jio Financial Services Ltd.", "sector": "Financial Services", "lotSize": 1000, "instrumentType": "EQUITY", "isFno": True},

    # Automobile & Auto Ancillary
    {"symbol": "TATAMOTORS", "name": "Tata Motors Ltd.", "sector": "Automobile", "lotSize": 1425, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "MARUTI", "name": "Maruti Suzuki India Ltd.", "sector": "Automobile", "lotSize": 100, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "M&M", "name": "Mahindra & Mahindra Ltd.", "sector": "Automobile", "lotSize": 350, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "BAJAJ-AUTO", "name": "Bajaj Auto Ltd.", "sector": "Automobile", "lotSize": 75, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "HEROMOTOCO", "name": "Hero MotoCorp Ltd.", "sector": "Automobile", "lotSize": 150, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "EICHERMOT", "name": "Eicher Motors Ltd.", "sector": "Automobile", "lotSize": 175, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "TVSMOTOR", "name": "TVS Motor Company Ltd.", "sector": "Automobile", "lotSize": 350, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "BHARATFORG", "name": "Bharat Forge Ltd.", "sector": "Automobile", "lotSize": 500, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "MOTHERSON", "name": "Samvardhana Motherson International Ltd.", "sector": "Automobile", "lotSize": 3100, "instrumentType": "EQUITY", "isFno": True},

    # Consumer Goods & Retail
    {"symbol": "ITC", "name": "ITC Ltd.", "sector": "FMCG", "lotSize": 1600, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "HINDUNILVR", "name": "Hindustan Unilever Ltd.", "sector": "FMCG", "lotSize": 300, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "NESTLEIND", "name": "Nestle India Ltd.", "sector": "FMCG", "lotSize": 200, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "BRITANNIA", "name": "Britannia Industries Ltd.", "sector": "FMCG", "lotSize": 200, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "DABUR", "name": "Dabur India Ltd.", "sector": "FMCG", "lotSize": 1250, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "GODREJCP", "name": "Godrej Consumer Products Ltd.", "sector": "FMCG", "lotSize": 500, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "MARICO", "name": "Marico Ltd.", "sector": "FMCG", "lotSize": 1200, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "TITAN", "name": "Titan Company Ltd.", "sector": "Consumer Goods", "lotSize": 175, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "ASIANPAINT", "name": "Asian Paints Ltd.", "sector": "Consumer Goods", "lotSize": 200, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "TRENT", "name": "Trent Ltd.", "sector": "Consumer Goods", "lotSize": 200, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "ZOMATO", "name": "Zomato Ltd.", "sector": "Consumer Goods", "lotSize": 2000, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "BERGEPAINT", "name": "Berger Paints India Ltd.", "sector": "Consumer Goods", "lotSize": 1100, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "PIDILITIND", "name": "Pidilite Industries Ltd.", "sector": "Consumer Goods", "lotSize": 250, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "HAVELLS", "name": "Havells India Ltd.", "sector": "Consumer Goods", "lotSize": 500, "instrumentType": "EQUITY", "isFno": True},

    # Metals & Mining
    {"symbol": "TATASTEEL", "name": "Tata Steel Ltd.", "sector": "Metals", "lotSize": 5500, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "JSWSTEEL", "name": "JSW Steel Ltd.", "sector": "Metals", "lotSize": 675, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "HINDALCO", "name": "Hindalco Industries Ltd.", "sector": "Metals", "lotSize": 1400, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "VEDL", "name": "Vedanta Ltd.", "sector": "Metals", "lotSize": 2000, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "JINDALSTEL", "name": "Jindal Steel & Power Ltd.", "sector": "Metals", "lotSize": 625, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "NMDC", "name": "NMDC Ltd.", "sector": "Metals", "lotSize": 4500, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "SAIL", "name": "Steel Authority of India Ltd.", "sector": "Metals", "lotSize": 8000, "instrumentType": "EQUITY", "isFno": True},

    # Healthcare & Pharma
    {"symbol": "SUNPHARMA", "name": "Sun Pharmaceutical Industries Ltd.", "sector": "Healthcare", "lotSize": 700, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "CIPLA", "name": "Cipla Ltd.", "sector": "Healthcare", "lotSize": 650, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "DRREDDY", "name": "Dr. Reddy's Laboratories Ltd.", "sector": "Healthcare", "lotSize": 125, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "DIVISLAB", "name": "Divi's Laboratories Ltd.", "sector": "Healthcare", "lotSize": 200, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "APOLLOHOSP", "name": "Apollo Hospitals Enterprise Ltd.", "sector": "Healthcare", "lotSize": 125, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "LUPIN", "name": "Lupin Ltd.", "sector": "Healthcare", "lotSize": 425, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "AUROPHARMA", "name": "Aurobindo Pharma Ltd.", "sector": "Healthcare", "lotSize": 1100, "instrumentType": "EQUITY", "isFno": True},

    # Infrastructure & Construction
    {"symbol": "LT", "name": "Larsen & Toubro Ltd.", "sector": "Construction", "lotSize": 150, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "ULTRACEMCO", "name": "UltraTech Cement Ltd.", "sector": "Construction", "lotSize": 100, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "GRASIM", "name": "Grasim Industries Ltd.", "sector": "Construction", "lotSize": 250, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "AMBUJACEM", "name": "Ambuja Cements Ltd.", "sector": "Construction", "lotSize": 900, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "DLF", "name": "DLF Ltd.", "sector": "Construction", "lotSize": 825, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "GODREJPROP", "name": "Godrej Properties Ltd.", "sector": "Construction", "lotSize": 225, "instrumentType": "EQUITY", "isFno": True},

    # Telecom, Capital Goods & Defense
    {"symbol": "BHARTIARTL", "name": "Bharti Airtel Ltd.", "sector": "Telecom", "lotSize": 950, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "BEL", "name": "Bharat Electronics Ltd.", "sector": "Defense", "lotSize": 2700, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "HAL", "name": "Hindustan Aeronautics Ltd.", "sector": "Defense", "lotSize": 300, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "SIEMENS", "name": "Siemens Ltd.", "sector": "Capital Goods", "lotSize": 75, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "ABB", "name": "ABB India Ltd.", "sector": "Capital Goods", "lotSize": 125, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "ADANIENT", "name": "Adani Enterprises Ltd.", "sector": "Diversified", "lotSize": 300, "instrumentType": "EQUITY", "isFno": True},
    {"symbol": "ADANIPORTS", "name": "Adani Ports and Special Economic Zone Ltd.", "sector": "Diversified", "lotSize": 400, "instrumentType": "EQUITY", "isFno": True},

    # Major Indices
    {"symbol": "^NSEI", "name": "Nifty 50 Index", "sector": "Indices", "lotSize": 50, "instrumentType": "INDEX", "isFno": True},
    {"symbol": "^NSEBANK", "name": "Nifty Bank Index", "sector": "Indices", "lotSize": 15, "instrumentType": "INDEX", "isFno": True}
]
