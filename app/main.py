from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import os
from pathlib import Path
from .api import stocks
from .database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Stock Market Analysis Platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the absolute path to the static directory
static_dir = Path(__file__).parent / "static"

# Mount static files
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Include routers
app.include_router(stocks.router, prefix="/api/stocks", tags=["stocks"])

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    # Return the index.html file directly
    with open(static_dir / "index.html", "r") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)
