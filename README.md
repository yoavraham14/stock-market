# Stock Market Analysis Platform

A modern web application for stock market analysis and discovery, built with FastAPI and modern web technologies.

## Features

- Real-time stock market data
- Interactive price charts
- Stock discovery and recommendations
- Major market indices tracking
- Company information and financial reports
- Personalized watchlist
- AI-powered stock recommendations

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
Create a `.env` file with:
```
ALPHA_VANTAGE_API_KEY=your_api_key
```

3. Run the application:
```bash
uvicorn app.main:app --reload
```

## API Endpoints

- `/api/markets`: Get major market indices
- `/api/stocks/search`: Search for stocks
- `/api/stocks/{symbol}`: Get detailed stock information
- `/api/recommendations`: Get personalized stock recommendations

## Technologies Used

- Backend: FastAPI, SQLAlchemy
- Frontend: HTML5, CSS3, JavaScript
- Data Visualization: Chart.js
- UI Framework: Bootstrap 5
- API: Alpha Vantage

## Project Structure

```
stock-market/
├── app/
│   ├── api/         # API routes
│   ├── models/      # Database models
│   └── static/      # Frontend files
├── requirements.txt # Python dependencies
└── .env            # Environment variables
```
