"""
Vidgen — AI Avatar Video Generator
FastAPI Backend Server
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routes.upload import router as upload_router
from routes.audio import router as audio_router
from routes.video import router as video_router
from routes.download import router as download_router
from routes.seo import router as seo_router

app = FastAPI(
    title="Vidgen API",
    description="AI-Powered Avatar Video Generator",
    version="1.0.0",
)

# CORS — allow frontend dev server and local network testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.0.105:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create storage directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)
os.makedirs("temp", exist_ok=True)

# Mount static file directories for serving generated content
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Register API routers
app.include_router(upload_router, prefix="/api", tags=["Upload"])
app.include_router(audio_router, prefix="/api", tags=["Audio"])
app.include_router(video_router, prefix="/api", tags=["Video"])
app.include_router(download_router, prefix="/api", tags=["Download"])
app.include_router(seo_router, prefix="/api", tags=["SEO"])


@app.get("/")
async def root():
    return {
        "app": "Vidgen",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
