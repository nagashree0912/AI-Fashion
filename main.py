"""
StyleSai - AI-Powered Fashion Platform
Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import uvicorn

from routers import products, cart, recommendations

# Create FastAPI app
app = FastAPI(
    title="StyleSai API",
    description="AI-Powered Personal Fashion Stylist API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(recommendations.router)

# Serve static files (for frontend)
frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="frontend")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "StyleSai API",
        "version": "1.0.0",
        "description": "AI-Powered Personal Fashion Stylist",
        "docs": "/api/docs",
        "endpoints": {
            "products": "/api/products",
            "cart": "/api/cart",
            "recommendations": "/api/recommend"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "StyleSai API"}

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 StyleSai - AI Fashion Platform Starting...")
    print("=" * 60)
    print("\n📍 API Endpoints:")
    print("   - Main API: http://localhost:8000")
    print("   - Docs: http://localhost:8000/api/docs")
    print("   - Products: http://localhost:8000/api/products")
    print("   - Cart: http://localhost:8000/api/cart")
    print("   - AI Recommendations: http://localhost:8000/api/recommend")
    print("\n" + "=" * 60)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
