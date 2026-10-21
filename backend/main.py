from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import engine, Base
from app.routes import products, users, orders, analytics, ai
import os

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StyleVerse API",
    description="🌟 AI-Powered Luxury Fashion Platform REST API",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers (all under /api/ prefix)
app.include_router(products.router)
app.include_router(users.router)
app.include_router(users.users_router)
app.include_router(orders.router)
app.include_router(analytics.router)
app.include_router(ai.router)


@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "StyleVerse API", "version": "2.0.0"}


# ─── Serve the entire app from one URL ───
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
PRODUCT_ASSETS = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets"))

# Catch-all route: serves frontend + static files
@app.get("/{full_path:path}")
async def serve_app(request: Request, full_path: str):
    # 1. Check if it's a product image in /assets/
    if full_path.startswith("assets/"):
        product_file = os.path.join(PRODUCT_ASSETS, full_path[len("assets/"):])
        if os.path.isfile(product_file):
            return FileResponse(product_file)

    # 2. Check if it's a built frontend file (JS, CSS, SVG, etc.)
    if full_path and os.path.exists(FRONTEND_DIR):
        dist_file = os.path.join(FRONTEND_DIR, full_path)
        if os.path.isfile(dist_file):
            return FileResponse(dist_file)

    # 3. Fallback: serve index.html for React Router
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.isfile(index_file):
        return FileResponse(index_file)

    return {"message": "StyleVerse API", "docs": "/api/docs"}
