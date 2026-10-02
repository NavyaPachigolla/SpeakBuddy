import logging
from contextlib import asynccontextmanager
from pathlib import Path
import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.database import init_db
from backend.api.scenarios import router as scenarios_router
from backend.api.chat import router as chat_router
from backend.api.audio import router as audio_router
from backend.api.sessions import router as sessions_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("speakbuddy")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SpeakBuddy SQLite database...")
    init_db()
    logger.info("Database initialized successfully.")
    yield
    logger.info("SpeakBuddy backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SpeakBuddy: AI-Powered English Speaking Practice Partner",
    lifespan=lifespan
)

# CORS setup for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please check that Ollama and the backend services are running."}
    )

# Health & Diagnosis Endpoint
@app.get("/api/health")
async def health_check():
    ollama_ok = False
    available_models = []
    
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/tags")
            if resp.status_code == 200:
                ollama_ok = True
                data = resp.json()
                available_models = [m.get("name") for m in data.get("models", [])]
    except Exception:
        ollama_ok = False

    return {
        "status": "healthy",
        "version": settings.VERSION,
        "database": "sqlite_connected",
        "ollama": {
            "connected": ollama_ok,
            "url": settings.OLLAMA_BASE_URL,
            "target_model": settings.OLLAMA_MODEL,
            "available_models": available_models
        },
        "whisper": {
            "model_size": settings.WHISPER_MODEL_SIZE,
            "device": settings.WHISPER_DEVICE
        }
    }

# Include API Routers under /api
app.include_router(scenarios_router, prefix=settings.API_PREFIX)
app.include_router(chat_router, prefix=settings.API_PREFIX)
app.include_router(audio_router, prefix=settings.API_PREFIX)
app.include_router(sessions_router, prefix=settings.API_PREFIX)

# Static files & SPA mounting for seamless single-port hosting
DIST_DIR = settings.BASE_DIR / "frontend" / "dist"
if (DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="API route not found")
    if DIST_DIR.exists():
        file_path = DIST_DIR / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        index_file = DIST_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
    return {"message": "SpeakBuddy API running. Build frontend or run Vite dev server at port 5173."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
