from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import json
from pathlib import Path
from models.product import Product

router = APIRouter(prefix="/api/products", tags=["products"])

# Load products from JSON file
def load_products() -> List[Product]:
    """Load products from the JSON database"""
    data_file = Path(__file__).parent.parent / "data" / "products.json"
    with open(data_file, "r") as f:
        data = json.load(f)
        return [Product(**p) for p in data["products"]]

@router.get("", response_model=List[Product])
async def get_all_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    subcategory: Optional[str] = Query(None, description="Filter by subcategory"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    style: Optional[str] = Query(None, description="Filter by style tag"),
    search: Optional[str] = Query(None, description="Search products by name")
):
    """Get all products with optional filters"""
    products = load_products()
    
    if category:
        products = [p for p in products if p.category == category]
    
    if subcategory:
        products = [p for p in products if p.subcategory == subcategory]
    
    if min_price is not None:
        products = [p for p in products if p.price >= min_price]
    
    if max_price is not None:
        products = [p for p in products if p.price <= max_price]
    
    if style:
        products = [p for p in products if style.lower() in [s.lower() for s in p.style_tags]]
    
    if search:
        search_lower = search.lower()
        products = [
            p for p in products 
            if search_lower in p.name.lower() or search_lower in p.description.lower() or search_lower in p.brand.lower()
        ]
    
    return products

@router.get("/categories", response_model=dict)
async def get_categories():
    """Get all available categories and subcategories"""
    products = load_products()
    
    categories = {
        "menswear": {
            "shirts": [], "tshirts": [], "blazers": [], "hoodies": [], "sweatshirts": [],
            "pants": [], "footwear": [], "accessories": []
        },
        "womenswear": {
            "tops": [], "long_frocks": [], "sleeveless": [], "ethnic_wear": [],
            "bottoms": [], "footwear": [], "accessories": [], "jackets": []
        },
        "kidswear": {
            "boys": [], "girls": [], "accessories": []
        },
        "genz": {
            "oversized": [], "cargo": [], "hoodies": [], "pants": [], 
            "jackets": [], "footwear": [], "accessories": []
        },
        "jewelry": {
            "nose_piercing": [], "ear_piercing": [], "jhumkas": [],
            "necklaces": [], "chains": [], "designer_bangles": []
        }
    }
    
    for product in products:
        if product.category in categories:
            if product.subcategory in categories[product.category]:
                categories[product.category][product.subcategory].append({
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "image_url": product.image_url
                })
    
    return categories

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: int):
    """Get a single product by ID"""
    products = load_products()
    
    for product in products:
        if product.id == product_id:
            return product
    
    raise HTTPException(status_code=404, detail="Product not found")

@router.get("/category/{category}", response_model=List[Product])
async def get_products_by_category(category: str):
    """Get products by category"""
    products = load_products()
    
    valid_categories = ["menswear", "womenswear", "kidswear", "genz", "jewelry"]
    if category.lower() not in valid_categories:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}"
        )
    
    return [p for p in products if p.category == category.lower()]

@router.get("/subcategory/{subcategory}", response_model=List[Product])
async def get_products_by_subcategory(subcategory: str):
    """Get products by subcategory"""
    products = load_products()
    return [p for p in products if p.subcategory == subcategory.lower()]
