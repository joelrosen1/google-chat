from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from .api import search

load_dotenv()

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",")

app = FastAPI(
    title="Google Search Clone API",
    description="Backend API for Google Search Clone using SerpAPI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router, prefix="/api/v1", tags=["search"])

@app.get("/")
async def root():
    return {"message": "Welcome to Google Search Clone API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 