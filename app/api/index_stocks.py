from fastapi import APIRouter, HTTPException, Query
import aiohttp
import json
from typing import List, Optional
from pydantic import BaseModel
from ..config import settings
import logging
import os
import random
from pathlib import Path

router = APIRouter()

# Define models
class StockInIndex(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: str
    volume: int
    market_cap: float
    sector: str

# Dictionary mapping index symbols to their components
INDEX_COMPONENTS = {
    "^GSPC": "S&P 500",
    "^DJI": "Dow Jones",
    "^IXIC": "NASDAQ",
    "^RUT": "Russell 2000"
}

# Sample data for when API calls fail or are limited
SAMPLE_DATA_PATH = Path(__file__).parent / "sample_data"

async def fetch_index_stocks(index_symbol: str, limit: int = 20, sort_by: str = "market_cap", sort_order: str = "desc"):
    """Fetch stocks that are components of a specific index"""
    try:
        # In a real implementation, we would call Alpha Vantage API to get index components
        # For now, we'll use sample data since Alpha Vantage free tier doesn't provide index components
        
        # Check if we have sample data for this index
        sample_file = SAMPLE_DATA_PATH / f"{index_symbol.replace('^', '')}_components.json"
        
        if not os.path.exists(sample_file):
            # Generate sample data if it doesn't exist
            return generate_sample_index_components(index_symbol, limit)
        
        # Load sample data
        with open(sample_file, 'r') as f:
            stocks = json.load(f)
            
        # Apply sorting
        reverse = sort_order.lower() == "desc"
        if sort_by in ["price", "change", "change_percent", "volume", "market_cap"]:
            # For change_percent, convert to float first by removing % sign
            if sort_by == "change_percent":
                stocks = sorted(stocks, key=lambda x: float(x[sort_by].replace('%', '')), reverse=reverse)
            else:
                stocks = sorted(stocks, key=lambda x: x[sort_by], reverse=reverse)
        
        # Apply limit
        return stocks[:limit]
        
    except Exception as e:
        logging.error(f"Error fetching index components: {str(e)}")
        return generate_sample_index_components(index_symbol, limit)

def generate_sample_index_components(index_symbol: str, limit: int = 20):
    """Generate sample data for index components"""
    # Create sample directory if it doesn't exist
    os.makedirs(SAMPLE_DATA_PATH, exist_ok=True)
    
    # Define sectors for realistic data
    sectors = ["Technology", "Healthcare", "Financials", "Consumer Discretionary", 
               "Communication Services", "Industrials", "Consumer Staples", 
               "Energy", "Utilities", "Materials", "Real Estate"]
    
    # Sample company names and symbols based on the index
    if index_symbol == "^GSPC":  # S&P 500
        companies = [
            {"symbol": "AAPL", "name": "Apple Inc."},
            {"symbol": "MSFT", "name": "Microsoft Corporation"},
            {"symbol": "AMZN", "name": "Amazon.com Inc."},
            {"symbol": "NVDA", "name": "NVIDIA Corporation"},
            {"symbol": "GOOGL", "name": "Alphabet Inc."},
            {"symbol": "META", "name": "Meta Platforms Inc."},
            {"symbol": "TSLA", "name": "Tesla, Inc."},
            {"symbol": "BRK.B", "name": "Berkshire Hathaway Inc."},
            {"symbol": "UNH", "name": "UnitedHealth Group Inc."},
            {"symbol": "JNJ", "name": "Johnson & Johnson"},
            {"symbol": "JPM", "name": "JPMorgan Chase & Co."},
            {"symbol": "V", "name": "Visa Inc."},
            {"symbol": "PG", "name": "Procter & Gamble Co."},
            {"symbol": "MA", "name": "Mastercard Inc."},
            {"symbol": "HD", "name": "Home Depot Inc."},
            {"symbol": "CVX", "name": "Chevron Corporation"},
            {"symbol": "MRK", "name": "Merck & Co. Inc."},
            {"symbol": "ABBV", "name": "AbbVie Inc."},
            {"symbol": "PEP", "name": "PepsiCo Inc."},
            {"symbol": "KO", "name": "Coca-Cola Company"},
            {"symbol": "AVGO", "name": "Broadcom Inc."},
            {"symbol": "COST", "name": "Costco Wholesale Corp."},
            {"symbol": "TMO", "name": "Thermo Fisher Scientific"},
            {"symbol": "BAC", "name": "Bank of America Corp."},
            {"symbol": "LLY", "name": "Eli Lilly and Company"}
        ]
    elif index_symbol == "^DJI":  # Dow Jones
        companies = [
            {"symbol": "AAPL", "name": "Apple Inc."},
            {"symbol": "AMGN", "name": "Amgen Inc."},
            {"symbol": "AXP", "name": "American Express Co."},
            {"symbol": "BA", "name": "Boeing Co."},
            {"symbol": "CAT", "name": "Caterpillar Inc."},
            {"symbol": "CRM", "name": "Salesforce Inc."},
            {"symbol": "CSCO", "name": "Cisco Systems Inc."},
            {"symbol": "CVX", "name": "Chevron Corporation"},
            {"symbol": "DIS", "name": "Walt Disney Co."},
            {"symbol": "DOW", "name": "Dow Inc."},
            {"symbol": "GS", "name": "Goldman Sachs Group Inc."},
            {"symbol": "HD", "name": "Home Depot Inc."},
            {"symbol": "HON", "name": "Honeywell International Inc."},
            {"symbol": "IBM", "name": "International Business Machines"},
            {"symbol": "INTC", "name": "Intel Corporation"},
            {"symbol": "JNJ", "name": "Johnson & Johnson"},
            {"symbol": "JPM", "name": "JPMorgan Chase & Co."},
            {"symbol": "KO", "name": "Coca-Cola Company"},
            {"symbol": "MCD", "name": "McDonald's Corporation"},
            {"symbol": "MMM", "name": "3M Company"},
            {"symbol": "MRK", "name": "Merck & Co. Inc."},
            {"symbol": "MSFT", "name": "Microsoft Corporation"},
            {"symbol": "NKE", "name": "Nike Inc."},
            {"symbol": "PG", "name": "Procter & Gamble Co."},
            {"symbol": "TRV", "name": "Travelers Companies Inc."},
            {"symbol": "UNH", "name": "UnitedHealth Group Inc."},
            {"symbol": "V", "name": "Visa Inc."},
            {"symbol": "VZ", "name": "Verizon Communications Inc."},
            {"symbol": "WBA", "name": "Walgreens Boots Alliance Inc."},
            {"symbol": "WMT", "name": "Walmart Inc."}
        ]
    elif index_symbol == "^IXIC":  # NASDAQ
        companies = [
            {"symbol": "AAPL", "name": "Apple Inc."},
            {"symbol": "MSFT", "name": "Microsoft Corporation"},
            {"symbol": "AMZN", "name": "Amazon.com Inc."},
            {"symbol": "NVDA", "name": "NVIDIA Corporation"},
            {"symbol": "GOOGL", "name": "Alphabet Inc. Class A"},
            {"symbol": "GOOG", "name": "Alphabet Inc. Class C"},
            {"symbol": "META", "name": "Meta Platforms Inc."},
            {"symbol": "TSLA", "name": "Tesla, Inc."},
            {"symbol": "AVGO", "name": "Broadcom Inc."},
            {"symbol": "PEP", "name": "PepsiCo Inc."},
            {"symbol": "COST", "name": "Costco Wholesale Corp."},
            {"symbol": "ADBE", "name": "Adobe Inc."},
            {"symbol": "CSCO", "name": "Cisco Systems Inc."},
            {"symbol": "TMUS", "name": "T-Mobile US Inc."},
            {"symbol": "CMCSA", "name": "Comcast Corporation"},
            {"symbol": "NFLX", "name": "Netflix Inc."},
            {"symbol": "AMD", "name": "Advanced Micro Devices Inc."},
            {"symbol": "INTC", "name": "Intel Corporation"},
            {"symbol": "QCOM", "name": "Qualcomm Inc."},
            {"symbol": "INTU", "name": "Intuit Inc."},
            {"symbol": "AMAT", "name": "Applied Materials Inc."},
            {"symbol": "TXN", "name": "Texas Instruments Inc."},
            {"symbol": "PYPL", "name": "PayPal Holdings Inc."},
            {"symbol": "SBUX", "name": "Starbucks Corporation"},
            {"symbol": "ADI", "name": "Analog Devices Inc."}
        ]
    else:  # Russell 2000 or fallback
        companies = [
            {"symbol": "ENSG", "name": "The Ensign Group Inc."},
            {"symbol": "MEDP", "name": "Medpace Holdings Inc."},
            {"symbol": "TTEK", "name": "Tetra Tech Inc."},
            {"symbol": "PODD", "name": "Insulet Corporation"},
            {"symbol": "EXEL", "name": "Exelixis Inc."},
            {"symbol": "SAIA", "name": "Saia Inc."},
            {"symbol": "LSTR", "name": "Landstar System Inc."},
            {"symbol": "AXON", "name": "Axon Enterprise Inc."},
            {"symbol": "BLDR", "name": "Builders FirstSource Inc."},
            {"symbol": "CGNX", "name": "Cognex Corporation"},
            {"symbol": "PNFP", "name": "Pinnacle Financial Partners"},
            {"symbol": "HALO", "name": "Halozyme Therapeutics Inc."},
            {"symbol": "KNSL", "name": "Kinsale Capital Group Inc."},
            {"symbol": "EWBC", "name": "East West Bancorp Inc."},
            {"symbol": "PCTY", "name": "Paylocity Holding Corp."},
            {"symbol": "SYNH", "name": "Syneos Health Inc."},
            {"symbol": "NATI", "name": "National Instruments Corp."},
            {"symbol": "AZPN", "name": "Aspen Technology Inc."},
            {"symbol": "QLYS", "name": "Qualys Inc."},
            {"symbol": "FOXF", "name": "Fox Factory Holding Corp."},
            {"symbol": "HOMB", "name": "Home Bancshares Inc."},
            {"symbol": "CATY", "name": "Cathay General Bancorp"},
            {"symbol": "CVLT", "name": "Commvault Systems Inc."},
            {"symbol": "COLB", "name": "Columbia Banking System Inc."},
            {"symbol": "FORM", "name": "FormFactor Inc."}
        ]
    
    # Generate random data for each company
    stocks = []
    for i, company in enumerate(companies[:limit]):
        price = round(random.uniform(20, 500), 2)
        change = round(random.uniform(-20, 20), 2)
        change_percent = f"{round(change / price * 100, 2)}%"
        volume = random.randint(100000, 10000000)
        market_cap = round(price * random.randint(1000000, 1000000000) / 1000000000, 2)
        
        stocks.append({
            "symbol": company["symbol"],
            "name": company["name"],
            "price": price,
            "change": change,
            "change_percent": change_percent,
            "volume": volume,
            "market_cap": market_cap,
            "sector": random.choice(sectors)
        })
    
    # Save sample data
    sample_file = SAMPLE_DATA_PATH / f"{index_symbol.replace('^', '')}_components.json"
    with open(sample_file, 'w') as f:
        json.dump(stocks, f, indent=2)
    
    return stocks

@router.get("/{index_symbol}/stocks", response_model=List[StockInIndex])
async def get_index_stocks(
    index_symbol: str,
    limit: Optional[int] = Query(20, ge=1, le=100),
    sort_by: Optional[str] = Query("market_cap", regex="^(price|change|change_percent|volume|market_cap|symbol|name|sector)$"),
    sort_order: Optional[str] = Query("desc", regex="^(asc|desc)$")
):
    """
    Get stocks that are components of a specific market index.
    
    - **index_symbol**: Symbol of the index (e.g., ^GSPC for S&P 500)
    - **limit**: Maximum number of stocks to return (default: 20)
    - **sort_by**: Field to sort by (default: market_cap)
    - **sort_order**: Sort order (asc or desc, default: desc)
    """
    if index_symbol not in INDEX_COMPONENTS:
        raise HTTPException(status_code=404, detail=f"Index {index_symbol} not found")
    
    stocks = await fetch_index_stocks(index_symbol, limit, sort_by, sort_order)
    return stocks

@router.get("/indices")
async def get_available_indices():
    """Get a list of available market indices"""
    return [{"symbol": symbol, "name": name} for symbol, name in INDEX_COMPONENTS.items()]
