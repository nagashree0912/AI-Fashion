from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict
from pydantic import BaseModel
from models.product import Product
import json
from pathlib import Path

router = APIRouter(prefix="/api/cart", tags=["cart"])

# In-memory cart storage (in production, use a database)
cart_storage: Dict[int, Dict] = {}

class CartItem(BaseModel):
    product_id: int
    quantity: int = 1
    size: str = "M"
    color: str = "Black"

class CartResponse(BaseModel):
    items: List[Dict]
    total: float
    item_count: int
    subtotal: float = 0
    discount: float = 0
    delivery_charge: float = 0

# Checkout models
class DeliveryAddress(BaseModel):
    full_name: str
    phone: str
    address_line1: str
    address_line2: str = ""
    city: str
    state: str
    pincode: str
    landmark: str = ""

class CheckoutRequest(BaseModel):
    delivery_address: DeliveryAddress
    payment_method: str  # COD, Card, UPI, NetBanking
    coupon_code: str = ""

class OrderResponse(BaseModel):
    order_id: str
    items: List[Dict]
    subtotal: float
    discount: float
    delivery_charge: float
    total: float
    delivery_address: Dict
    payment_method: str
    estimated_delivery: str

class CouponRequest(BaseModel):
    code: str

# Coupon codes (in production, use database)
COUPONS = {
    "STYLE10": 10,
    "STYLE20": 20,
    "NEWUSER": 15,
    "FASHION25": 25
}

def load_products() -> List[Product]:
    """Load products from the JSON database"""
    data_file = Path(__file__).parent.parent / "data" / "products.json"
    with open(data_file, "r") as f:
        data = json.load(f)
        return [Product(**p) for p in data["products"]]

@router.get("", response_model=CartResponse)
async def get_cart():
    """Get all items in the cart"""
    products = load_products()
    
    items = []
    subtotal = 0
    total_discount = 0
    
    for product_id, item_data in cart_storage.items():
        product = next((p for p in products if p.id == product_id), None)
        if product:
            item_subtotal = product.price * item_data["quantity"]
            # Apply product discount
            item_discount = (item_subtotal * product.discount / 100) if hasattr(product, 'discount') else 0
            item_total = item_subtotal - item_discount
            
            items.append({
                "product": product,
                "quantity": item_data["quantity"],
                "size": item_data["size"],
                "color": item_data["color"],
                "item_subtotal": item_subtotal,
                "item_discount": item_discount,
                "item_total": item_total
            })
            subtotal += item_subtotal
            total_discount += item_discount
    
    # Calculate delivery charge (free above ₹999)
    delivery_charge = 0 if subtotal >= 999 else 99
    final_total = subtotal - total_discount + delivery_charge
    
    return CartResponse(
        items=items,
        subtotal=round(subtotal, 2),
        discount=round(total_discount, 2),
        delivery_charge=delivery_charge,
        total=round(final_total, 2),
        item_count=len(items)
    )

@router.post("", response_model=CartResponse)
async def add_to_cart(item: CartItem):
    """Add an item to the cart"""
    products = load_products()
    
    # Check if product exists
    product = next((p for p in products if p.id == item.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    if item.product_id in cart_storage:
        cart_storage[item.product_id]["quantity"] += item.quantity
    else:
        cart_storage[item.product_id] = {
            "quantity": item.quantity,
            "size": item.size,
            "color": item.color
        }
    
    return await get_cart()

@router.delete("/{product_id}", response_model=CartResponse)
async def remove_from_cart(product_id: int):
    """Remove an item from the cart"""
    if product_id not in cart_storage:
        raise HTTPException(status_code=404, detail="Item not in cart")
    
    del cart_storage[product_id]
    return await get_cart()

@router.put("/{product_id}", response_model=CartResponse)
async def update_cart_item(product_id: int, item: CartItem):
    """Update quantity of an item in the cart"""
    if product_id not in cart_storage:
        raise HTTPException(status_code=404, detail="Item not in cart")
    
    cart_storage[product_id] = {
        "quantity": item.quantity,
        "size": item.size,
        "color": item.color
    }
    
    return await get_cart()

@router.delete("", response_model=CartResponse)
async def clear_cart():
    """Clear all items from the cart"""
    cart_storage.clear()
    return CartResponse(items=[], subtotal=0, discount=0, delivery_charge=0, total=0.0, item_count=0)

@router.post("/checkout", response_model=OrderResponse)
async def checkout(checkout_req: CheckoutRequest):
    """Process checkout and create order"""
    if not cart_storage:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Get cart with calculations
    cart = await get_cart()
    
    # Apply coupon discount if valid
    coupon_discount = 0
    coupon_code = checkout_req.coupon_code.upper() if checkout_req.coupon_code else ""
    if coupon_code in COUPONS:
        coupon_discount = cart.subtotal * COUPONS[coupon_code] / 100
    
    # Calculate final total
    final_total = cart.total - coupon_discount
    if final_total < 0:
        final_total = 0
    
    # Generate order ID
    import time
    order_id = f"ORD{int(time.time())}"
    
    # Calculate estimated delivery (5-7 business days)
    estimated_delivery = f"{5}-{7} business days"
    
    # Create order response
    order = OrderResponse(
        order_id=order_id,
        items=cart.items,
        subtotal=cart.subtotal,
        discount=cart.discount + coupon_discount,
        delivery_charge=cart.delivery_charge,
        total=final_total,
        delivery_address=checkout_req.delivery_address.dict(),
        payment_method=checkout_req.payment_method,
        estimated_delivery=estimated_delivery
    )
    
    # Clear cart after successful order
    cart_storage.clear()
    
    return order

@router.get("/coupons")
async def get_coupons():
    """Get available coupon codes"""
    return {
        "coupons": [
            {"code": code, "discount": f"{discount}%" }
            for code, discount in COUPONS.items()
        ]
    }

@router.post("/apply-coupon")
async def apply_coupon(code: str | None = None, payload: CouponRequest | None = Body(default=None)):
    """Apply a coupon code and get discount"""
    raw_code = code or (payload.code if payload else "")
    coupon_code = raw_code.upper()
    if coupon_code in COUPONS:
        return {
            "valid": True,
            "code": coupon_code,
            "discount": COUPONS[coupon_code],
            "message": f"Coupon applied! {COUPONS[coupon_code]}% discount"
        }
    return {"valid": False, "message": "Invalid coupon code"}
