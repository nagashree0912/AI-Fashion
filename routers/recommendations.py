from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from models.product import Product, OutfitRecommendation
import json
from pathlib import Path

from ai_services.gemini_service import gemini_service
from ai_services.huggingface_service import huggingface_service

router = APIRouter(prefix="/api/recommend", tags=["recommendations"])

# Load products from JSON file
def load_products() -> List[Product]:
    """Load products from the JSON database"""
    data_file = Path(__file__).parent.parent / "data" / "products.json"
    with open(data_file, "r") as f:
        data = json.load(f)
        return [Product(**p) for p in data["products"]]

class OutfitRequest(BaseModel):
    product_id: int
    style_preference: Optional[str] = None
    occasion: Optional[str] = None
    budget: Optional[float] = None

class MatchRequest(BaseModel):
    product_id: int
    category: Optional[str] = None

class PersonalizeRequest(BaseModel):
    style: Optional[str] = None
    colors: Optional[List[str]] = None
    budget: Optional[str] = None
    body_type: Optional[str] = None
    occasion: Optional[str] = None

@router.post("/outfit", response_model=OutfitRecommendation)
async def get_outfit_recommendations(request: OutfitRequest):
    """Get complete outfit recommendations based on selected product"""
    products = load_products()
    
    # Find the selected product
    selected_product = next((p for p in products if p.id == request.product_id), None)
    if not selected_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get AI recommendations from Gemini
    recommendation = await gemini_service.get_outfit_recommendations(
        selected_product, products
    )
    
    # Set the main item properly
    recommendation.main_item = selected_product
    
    # Filter by budget if specified
    if request.budget:
        recommendation.matching_items = [
            p for p in recommendation.matching_items 
            if p.price <= request.budget
        ]
    
    return recommendation

@router.post("/match", response_model=Dict[str, Any])
async def get_matching_items(request: MatchRequest):
    """Get items that match a specific product"""
    products = load_products()
    
    # Find the selected product
    selected_product = next((p for p in products if p.id == request.product_id), None)
    if not selected_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Determine what categories to match
    categories_to_match = []
    
    # Mapping of subcategories to complementary categories
    complement_map = {
        "shirts": ["pants", "footwear", "accessories", "jackets"],
        "tops": ["bottoms", "footwear", "accessories", "jackets"],
        "dresses": ["footwear", "accessories", "jackets"],
        "pants": ["shirts", "tops", "footwear", "accessories", "jackets"],
        "bottoms": ["tops", "shirts", "footwear", "accessories", "jackets"],
        "footwear": ["pants", "bottoms", "shirts", "tops"],
        "accessories": ["shirts", "tops", "pants", "bottoms", "dresses"],
        "jackets": ["shirts", "tops", "pants", "bottoms", "dresses"],
        "boys": ["accessories", "footwear"],
        "girls": ["accessories", "footwear"]
    }
    
    # Get complementary categories
    categories_to_match = complement_map.get(selected_product.subcategory, [])
    
    # Filter products
    matching_products = [
        p for p in products
        if p.id != selected_product.id and p.subcategory in categories_to_match
    ]
    
    # If category filter is specified, further filter
    if request.category:
        matching_products = [
            p for p in matching_products
            if p.category == request.category
        ]
    
    # Group by subcategory
    grouped = {}
    for p in matching_products:
        if p.subcategory not in grouped:
            grouped[p.subcategory] = []
        grouped[p.subcategory].append(p)
    
    return {
        "selected_product": selected_product,
        "matching_categories": grouped,
        "all_matching": matching_products[:10]
    }

@router.post("/personalize", response_model=Dict[str, Any])
async def get_personalized_recommendations(request: PersonalizeRequest):
    """Get personalized recommendations based on user preferences"""
    products = load_products()
    
    # Get personalized advice from AI
    user_prefs = {
        "style": request.style or "versatile",
        "colors": request.colors or ["neutral"],
        "budget": request.budget or "medium",
        "body_type": request.body_type
    }
    
    advice = await gemini_service.get_personalized_advice(
        user_prefs, 
        request.occasion or "casual",
        request.style or "versatile"
    )
    
    # Filter products based on preferences
    filtered = products
    
    if request.style:
        filtered = [
            p for p in filtered 
            if request.style.lower() in [s.lower() for s in p.style_tags]
        ]
    
    if request.colors:
        filtered = [
            p for p in filtered
            if any(c.lower() in [col.lower() for col in p.colors] for c in request.colors)
        ]
    
    # Get recommendations
    return {
        "advice": advice,
        "recommended_products": filtered[:12],
        "user_preferences": user_prefs
    }

@router.post("/analyze-image")
async def analyze_uploaded_image(
    image: UploadFile = File(...)
):
    """Analyze an uploaded clothing image"""
    # Read image data
    image_data = await image.read()
    
    # Get analysis from Hugging Face
    analysis = await huggingface_service.analyze_clothing_image(image_data)
    
    # Also try Gemini vision
    try:
        gemini_analysis = await gemini_service.analyze_image(image_data)
        analysis["gemini_analysis"] = gemini_analysis
    except Exception as e:
        print(f"Gemini analysis failed: {e}")
    
    # Find matching products
    products = load_products()
    category = analysis.get("category", "unisex")
    
    matching = [
        p for p in products 
        if p.category == category or category == "unisex"
    ][:8]
    
    analysis["matching_products"] = [
        {
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "image_url": p.image_url,
            "category": p.category,
            "subcategory": p.subcategory
        }
        for p in matching
    ]
    
    return analysis

@router.get("/trends/{category}")
async def get_trending(category: str):
    """Get trending items for a category"""
    products = load_products()
    
    # Get trend analysis from AI
    trends = await gemini_service.analyze_trends(category)
    
    # Filter products by category
    category_products = [
        p for p in products 
        if p.category == category.lower()
    ]
    
    # Sort by rating (as a proxy for popularity)
    trending = sorted(category_products, key=lambda p: p.rating, reverse=True)[:8]
    
    return {
        "trends": trends,
        "analysis": trends,
        "category": category
    }

@router.get("/similar/{product_id}")
async def get_similar_products(product_id: int):
    """Get similar products to the given product"""
    products = load_products()
    
    # Find the product
    product = next((p for p in products if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Find similar products based on style tags
    similar = [
        p for p in products
        if p.id != product_id and 
        any(style in p.style_tags for style in product.style_tags)
    ][:6]
    
    return {
        "product": product,
        "similar_products": similar
    }
