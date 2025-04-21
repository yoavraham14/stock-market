from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/indices")
async def get_market_indices():
    """
    Returns sample market indices data with fixed values to avoid NaN issues
    """
    # Hardcoded sample data for market indices
    indices_data = {
        "S&P 500": {
            "symbol": "^GSPC",
            "price": "4,514.02",
            "change": "+67.89",
            "change_percent": "+1.53%",
            "volume": "2.5B"
        },
        "Dow Jones": {
            "symbol": "^DJI",
            "price": "35,390.15",
            "change": "+391.16",
            "change_percent": "+1.12%",
            "volume": "356.2M"
        },
        "NASDAQ": {
            "symbol": "^IXIC",
            "price": "14,176.32",
            "change": "+215.44",
            "change_percent": "+1.54%",
            "volume": "5.1B"
        },
        "Russell 2000": {
            "symbol": "^RUT",
            "price": "1,792.55",
            "change": "+24.01",
            "change_percent": "+1.36%",
            "volume": "2.3B"
        }
    }
    
    return indices_data
