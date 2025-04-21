from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..config import settings
import aiohttp
import asyncio

router = APIRouter()

async def fetch_stock_data(symbol: str):
    params = {
        "function": "GLOBAL_QUOTE",
        "symbol": symbol,
        "apikey": settings.alpha_vantage_api_key
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.get(settings.api_base_url, params=params) as response:
            return await response.json()

@router.get("/quote/{symbol}")
async def get_stock_quote(symbol: str):
    try:
        data = await fetch_stock_data(symbol)
        if "Global Quote" not in data:
            raise HTTPException(status_code=404, detail="Stock not found")
        return data["Global Quote"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending")
async def get_trending_stocks():
    # List of major tech and trending stocks
    trending_symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "NVDA", "META", "TSLA"]
    results = []
    
    for symbol in trending_symbols:
        try:
            data = await fetch_stock_data(symbol)
            if "Global Quote" in data:
                results.append(data["Global Quote"])
        except:
            continue
            
    return results

@router.get("/recommendations")
async def get_recommendations():
    # This would typically involve more sophisticated analysis
    # For now, returning a curated list of stocks
    recommendations = [
        {
            "symbol": "AMD",
            "reason": "Strong growth in AI and data center markets",
            "confidence": 0.85
        },
        {
            "symbol": "PLTR",
            "reason": "Expanding AI capabilities and government contracts",
            "confidence": 0.78
        },
        {
            "symbol": "SOFI",
            "reason": "Digital banking growth and expanding user base",
            "confidence": 0.72
        }
    ]
    return recommendations
