from sqlalchemy import Column, Integer, String, Float, DateTime
from ..database import Base
from datetime import datetime

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)
    name = Column(String)
    current_price = Column(Float)
    change_percent = Column(Float)
    market_cap = Column(Float)
    volume = Column(Integer)
    sector = Column(String)
    last_updated = Column(DateTime, default=datetime.utcnow)

class WatchlistItem(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    added_date = Column(DateTime, default=datetime.utcnow)
