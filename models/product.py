from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class Category(str, Enum):
    MENS_WEAR = "menswear"
    WOMENS_WEAR = "womenswear"
    KIDS_WEAR = "kidswear"

class SubCategory(str, Enum):
    # Men's
    MENS_SHIRTS = "shirts"
    MENS_PANTS = "pants"
    MENS_ACCESSORIES = "accessories"
    MENS_FOOTWEAR = "footwear"
    MENS_JACKETS = "jackets"
    
    # Women's
    WOMENS_DRESSES = "dresses"
    WOMENS_TOPS = "tops"
    WOMENS_BOTTOMS = "bottoms"
    WOMENS_ACCESSORIES = "accessories"
    WOMENS_FOOTWEAR = "footwear"
    WOMENS_JACKETS = "jackets"
    
    # Kids
    KIDS_BOYS = "boys"
    KIDS_GIRLS = "girls"
    KIDS_ACCESSORIES = "accessories"

class Product(BaseModel):
    id: int
    name: str
    description: str
    price: float
    category: str
    subcategory: str
    image_url: str
    colors: List[str]
    sizes: List[str]
    style_tags: List[str]
    brand: str
    material: str
    rating: float = 0.0
    in_stock: bool = True
    delivery_days: int = 5
    discount: int = 0

class CartItem(BaseModel):
    product_id: int
    quantity: int = 1
    size: str = "M"
    color: str = "Black"

class OutfitRecommendation(BaseModel):
    main_item: Product
    matching_items: List[Product]
    style_score: float
    reasoning: str

class ImageAnalysisResult(BaseModel):
    detected_items: List[str]
    colors: List[str]
    style_tags: List[str]
    confidence_scores: dict
