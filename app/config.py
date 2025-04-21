from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    alpha_vantage_api_key: str = os.getenv("ALPHA_VANTAGE_API_KEY")
    database_url: str = "sqlite:///./stocks.db"
    api_base_url: str = "https://www.alphavantage.co/query"

settings = Settings()
