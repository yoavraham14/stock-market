from fastapi import APIRouter, HTTPException
import aiohttp
from ..config import settings

router = APIRouter()

@router.get("/status")
async def get_api_status():
    """
    Check the status of the Alpha Vantage API key, including usage limits and remaining credits.
    """
    try:
        # Make a simple request to check API status
        params = {
            "function": "TIME_SERIES_INTRADAY",
            "symbol": "IBM",
            "interval": "1min",
            "apikey": settings.alpha_vantage_api_key,
            "datatype": "json"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(settings.api_base_url, params=params) as response:
                data = await response.json()
                
                # Check for API limit messages
                if "Note" in data:
                    return {
                        "status": "active",
                        "message": data["Note"],
                        "api_key": settings.alpha_vantage_api_key[:5] + "..." + settings.alpha_vantage_api_key[-5:],
                        "usage_info": "Standard API call frequency is 5 calls per minute and 500 calls per day"
                    }
                elif "Error Message" in data:
                    return {
                        "status": "error",
                        "message": data["Error Message"],
                        "api_key": settings.alpha_vantage_api_key[:5] + "..." + settings.alpha_vantage_api_key[-5:],
                    }
                else:
                    return {
                        "status": "active",
                        "message": "API key is valid and working",
                        "api_key": settings.alpha_vantage_api_key[:5] + "..." + settings.alpha_vantage_api_key[-5:],
                        "usage_info": "Standard API call frequency is 5 calls per minute and 500 calls per day"
                    }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking API status: {str(e)}")
