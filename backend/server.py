from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'namestrings')]

# JWT Config
SECRET_KEY = os.environ.get('JWT_SECRET', secrets.token_hex(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer(auto_error=False)

# Create the main app
app = FastAPI(title="Name Strings API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: str = "user"  # user, admin, staff
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "admin"

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: Optional[str] = None
    price: float
    original_price: float
    discount: int = 0
    image: str
    hover_image: Optional[str] = None
    category: str
    metal_types: List[str] = ["gold", "rose-gold", "silver"]
    is_featured: bool = False
    is_active: bool = True
    in_stock: bool = True
    stock_quantity: int = 100
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    price: float
    original_price: float
    discount: int = 0
    image: str
    hover_image: Optional[str] = None
    category: str
    metal_types: List[str] = ["gold", "rose-gold", "silver"]
    is_featured: bool = False
    in_stock: bool = True
    stock_quantity: int = 100

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    discount: Optional[int] = None
    image: Optional[str] = None
    hover_image: Optional[str] = None
    category: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    in_stock: Optional[bool] = None
    stock_quantity: Optional[int] = None

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    image: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CartItem(BaseModel):
    product_id: str
    quantity: int
    customization: Dict[str, Any] = {}

class ShippingAddress(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    address: str
    apartment: Optional[str] = None
    city: str
    state: str
    pincode: str

class OrderCreate(BaseModel):
    items: List[CartItem]
    shipping_address: ShippingAddress
    payment_method: str  # razorpay, stripe, upi, cod
    coupon_code: Optional[str] = None

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: f"NS{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}")
    user_id: Optional[str] = None
    items: List[Dict[str, Any]]
    shipping_address: Dict[str, Any]
    payment_method: str
    payment_status: str = "pending"  # pending, paid, failed, refunded
    order_status: str = "pending"  # pending, confirmed, processing, shipped, delivered, cancelled
    subtotal: float
    shipping_cost: float
    discount_amount: float = 0
    total: float
    coupon_code: Optional[str] = None
    payment_id: Optional[str] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Coupon(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    discount_type: str = "percentage"  # percentage, fixed
    discount_value: float
    min_order_amount: float = 0
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    used_count: int = 0
    is_active: bool = True
    valid_from: datetime = Field(default_factory=datetime.utcnow)
    valid_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CouponCreate(BaseModel):
    code: str
    discount_type: str = "percentage"
    discount_value: float
    min_order_amount: float = 0
    max_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    valid_until: Optional[datetime] = None

class SiteSettings(BaseModel):
    id: str = "site_settings"
    site_name: str = "Name Strings"
    tagline: str = "Make it memorable"
    top_bar_text: str = "India's most loved brand with over 1L+ orders delivered"
    currency: str = "INR"
    currency_symbol: str = "₹"
    sale_active: bool = True
    sale_title: str = "VALENTINE SALE"
    sale_discount: str = "40% OFF"
    sale_end_date: Optional[datetime] = None
    free_shipping_threshold: float = 1000
    shipping_cost: float = 99
    contact_email: str = "support@namestrings.in"
    contact_phone: str = "+91 98765 43210"
    razorpay_enabled: bool = True
    stripe_enabled: bool = True
    upi_enabled: bool = True
    cod_enabled: bool = True
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ==================== AUTH HELPERS ====================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            return None
        user = await db.users.find_one({"id": user_id})
        return user
    except:
        return None

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = await get_current_user(credentials)
    if not user or user.get("role") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone
    )
    user_dict = user.dict()
    user_dict["password_hash"] = get_password_hash(user_data.password)
    
    await db.users.insert_one(user_dict)
    token = create_access_token({"sub": user.id, "role": user.role})
    
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role}}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is disabled")
    
    token = create_access_token({"sub": user["id"], "role": user.get("role", "user")})
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user.get("role", "user")}}

@api_router.get("/auth/me")
async def get_me(user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"id": user["id"], "email": user["email"], "name": user["name"], "role": user.get("role", "user")}

# ==================== PRODUCT ROUTES ====================

@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=100),
    skip: int = 0
):
    query = {"is_active": True}
    if category:
        query["category"] = category
    if featured is not None:
        query["is_featured"] = featured
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.products.count_documents(query)
    
    return {"products": products, "total": total}

@api_router.get("/products/{slug}")
async def get_product(slug: str):
    product = await db.products.find_one({"slug": slug, "is_active": True}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# ==================== CATEGORY ROUTES ====================

@api_router.get("/categories")
async def get_categories():
    categories = await db.categories.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return categories

# ==================== ORDER ROUTES ====================

@api_router.post("/orders")
async def create_order(order_data: OrderCreate, user = Depends(get_current_user)):
    # Calculate totals
    subtotal = 0
    order_items = []
    
    for item in order_data.items:
        product = await db.products.find_one({"id": item.product_id})
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
        
        item_total = product["price"] * item.quantity
        subtotal += item_total
        order_items.append({
            "product_id": product["id"],
            "name": product["name"],
            "price": product["price"],
            "quantity": item.quantity,
            "image": product["image"],
            "customization": item.customization
        })
    
    # Get settings for shipping
    settings = await db.settings.find_one({"id": "site_settings"})
    if not settings:
        settings = SiteSettings().dict()
    
    shipping_cost = 0 if subtotal >= settings.get("free_shipping_threshold", 1000) else settings.get("shipping_cost", 99)
    
    # Apply coupon if provided
    discount_amount = 0
    if order_data.coupon_code:
        coupon = await db.coupons.find_one({"code": order_data.coupon_code.upper(), "is_active": True})
        if coupon and subtotal >= coupon.get("min_order_amount", 0):
            if coupon["discount_type"] == "percentage":
                discount_amount = subtotal * (coupon["discount_value"] / 100)
                if coupon.get("max_discount"):
                    discount_amount = min(discount_amount, coupon["max_discount"])
            else:
                discount_amount = coupon["discount_value"]
            
            # Update coupon usage
            await db.coupons.update_one({"id": coupon["id"]}, {"$inc": {"used_count": 1}})
    
    total = subtotal + shipping_cost - discount_amount
    
    order = Order(
        user_id=user["id"] if user else None,
        items=order_items,
        shipping_address=order_data.shipping_address.dict(),
        payment_method=order_data.payment_method,
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        discount_amount=discount_amount,
        total=total,
        coupon_code=order_data.coupon_code
    )
    
    await db.orders.insert_one(order.dict())
    
    return order.dict()

@api_router.get("/orders")
async def get_user_orders(user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    orders = await db.orders.find({"user_id": user["id"]}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, user = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if user and order.get("user_id") != user["id"] and user.get("role") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return order

# ==================== COUPON ROUTES ====================

@api_router.post("/coupons/validate")
async def validate_coupon(code: str, subtotal: float):
    coupon = await db.coupons.find_one({"code": code.upper(), "is_active": True})
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    
    if coupon.get("valid_until") and datetime.fromisoformat(str(coupon["valid_until"])) < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Coupon has expired")
    
    if coupon.get("usage_limit") and coupon.get("used_count", 0) >= coupon["usage_limit"]:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")
    
    if subtotal < coupon.get("min_order_amount", 0):
        raise HTTPException(status_code=400, detail=f"Minimum order amount is ₹{coupon['min_order_amount']}")
    
    if coupon["discount_type"] == "percentage":
        discount = subtotal * (coupon["discount_value"] / 100)
        if coupon.get("max_discount"):
            discount = min(discount, coupon["max_discount"])
    else:
        discount = coupon["discount_value"]
    
    return {"valid": True, "discount": discount, "code": coupon["code"]}

# ==================== SETTINGS ROUTES ====================

@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        settings = SiteSettings().dict()
        await db.settings.insert_one(settings)
    return settings

# ==================== ADMIN ROUTES ====================

@api_router.post("/admin/setup")
async def setup_admin(admin_data: AdminCreate):
    # Check if any admin exists
    existing_admin = await db.users.find_one({"role": "admin"})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    user = User(
        email=admin_data.email,
        name=admin_data.name,
        role="admin"
    )
    user_dict = user.dict()
    user_dict["password_hash"] = get_password_hash(admin_data.password)
    
    await db.users.insert_one(user_dict)
    token = create_access_token({"sub": user.id, "role": user.role})
    
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role}}

@api_router.get("/admin/dashboard")
async def admin_dashboard(admin = Depends(get_admin_user)):
    # Get stats
    total_orders = await db.orders.count_documents({})
    total_users = await db.users.count_documents({"role": "user"})
    total_products = await db.products.count_documents({})
    
    # Revenue
    pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Recent orders
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    # Order stats by status
    status_pipeline = [
        {"$group": {"_id": "$order_status", "count": {"$sum": 1}}}
    ]
    status_stats = await db.orders.aggregate(status_pipeline).to_list(10)
    
    return {
        "stats": {
            "total_orders": total_orders,
            "total_users": total_users,
            "total_products": total_products,
            "total_revenue": total_revenue
        },
        "recent_orders": recent_orders,
        "order_status_stats": {s["_id"]: s["count"] for s in status_stats}
    }

@api_router.get("/admin/orders")
async def admin_get_orders(
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    admin = Depends(get_admin_user)
):
    query = {}
    if status:
        query["order_status"] = status
    if payment_status:
        query["payment_status"] = payment_status
    
    orders = await db.orders.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.orders.count_documents(query)
    
    return {"orders": orders, "total": total}

@api_router.put("/admin/orders/{order_id}")
async def admin_update_order(
    order_id: str,
    order_status: Optional[str] = None,
    payment_status: Optional[str] = None,
    tracking_number: Optional[str] = None,
    notes: Optional[str] = None,
    admin = Depends(get_admin_user)
):
    update = {"updated_at": datetime.utcnow()}
    if order_status:
        update["order_status"] = order_status
    if payment_status:
        update["payment_status"] = payment_status
    if tracking_number:
        update["tracking_number"] = tracking_number
    if notes:
        update["notes"] = notes
    
    result = await db.orders.update_one({"id": order_id}, {"$set": update})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"success": True}

@api_router.get("/admin/products")
async def admin_get_products(
    limit: int = 50,
    skip: int = 0,
    admin = Depends(get_admin_user)
):
    products = await db.products.find().sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.products.count_documents({})
    return {"products": products, "total": total}

@api_router.post("/admin/products")
async def admin_create_product(product_data: ProductCreate, admin = Depends(get_admin_user)):
    product = Product(**product_data.dict())
    await db.products.insert_one(product.dict())
    return product.dict()

@api_router.put("/admin/products/{product_id}")
async def admin_update_product(product_id: str, product_data: ProductUpdate, admin = Depends(get_admin_user)):
    update = {k: v for k, v in product_data.dict().items() if v is not None}
    update["updated_at"] = datetime.utcnow()
    
    result = await db.products.update_one({"id": product_id}, {"$set": update})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"success": True}

@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str, admin = Depends(get_admin_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True}

@api_router.get("/admin/users")
async def admin_get_users(limit: int = 50, skip: int = 0, admin = Depends(get_admin_user)):
    users = await db.users.find({}, {"password_hash": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents({})
    return {"users": users, "total": total}

@api_router.put("/admin/users/{user_id}")
async def admin_update_user(
    user_id: str,
    is_active: Optional[bool] = None,
    role: Optional[str] = None,
    admin = Depends(get_admin_user)
):
    update = {}
    if is_active is not None:
        update["is_active"] = is_active
    if role:
        update["role"] = role
    
    if not update:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.users.update_one({"id": user_id}, {"$set": update})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True}

@api_router.get("/admin/coupons")
async def admin_get_coupons(admin = Depends(get_admin_user)):
    coupons = await db.coupons.find().sort("created_at", -1).to_list(100)
    return coupons

@api_router.post("/admin/coupons")
async def admin_create_coupon(coupon_data: CouponCreate, admin = Depends(get_admin_user)):
    coupon = Coupon(**coupon_data.dict())
    coupon.code = coupon.code.upper()
    await db.coupons.insert_one(coupon.dict())
    return coupon.dict()

@api_router.delete("/admin/coupons/{coupon_id}")
async def admin_delete_coupon(coupon_id: str, admin = Depends(get_admin_user)):
    result = await db.coupons.delete_one({"id": coupon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"success": True}

@api_router.get("/admin/settings")
async def admin_get_settings(admin = Depends(get_admin_user)):
    settings = await db.settings.find_one({"id": "site_settings"})
    if not settings:
        settings = SiteSettings().dict()
    return settings

@api_router.put("/admin/settings")
async def admin_update_settings(settings_data: Dict[str, Any], admin = Depends(get_admin_user)):
    settings_data["updated_at"] = datetime.utcnow()
    settings_data["id"] = "site_settings"
    
    await db.settings.update_one(
        {"id": "site_settings"},
        {"$set": settings_data},
        upsert=True
    )
    return {"success": True}

@api_router.get("/admin/categories")
async def admin_get_categories(admin = Depends(get_admin_user)):
    categories = await db.categories.find().sort("order", 1).to_list(100)
    return categories

@api_router.post("/admin/categories")
async def admin_create_category(category_data: Dict[str, Any], admin = Depends(get_admin_user)):
    category = Category(**category_data)
    await db.categories.insert_one(category.dict())
    return category.dict()

@api_router.put("/admin/categories/{category_id}")
async def admin_update_category(category_id: str, category_data: Dict[str, Any], admin = Depends(get_admin_user)):
    result = await db.categories.update_one({"id": category_id}, {"$set": category_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"success": True}

@api_router.delete("/admin/categories/{category_id}")
async def admin_delete_category(category_id: str, admin = Depends(get_admin_user)):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"success": True}

# ==================== SEED DATA ====================

@api_router.post("/admin/seed")
async def seed_data(admin = Depends(get_admin_user)):
    """Seed initial data"""
    # Seed categories
    categories = [
        {"name": "Her", "slug": "for-her", "order": 1},
        {"name": "Him", "slug": "for-him", "order": 2},
        {"name": "Kids", "slug": "kids", "order": 3},
        {"name": "Couple", "slug": "couple", "order": 4},
        {"name": "Cultural", "slug": "cultural", "order": 5},
        {"name": "Express Ship", "slug": "express-ship", "order": 6},
    ]
    
    for cat in categories:
        existing = await db.categories.find_one({"slug": cat["slug"]})
        if not existing:
            category = Category(**cat)
            await db.categories.insert_one(category.dict())
    
    # Seed products
    products = [
        {"name": "Men Circle Bracelet", "slug": "men-circle-bracelet", "price": 1499, "original_price": 2499, "discount": 40, "image": "https://images.pexels.com/photos/3634366/pexels-photo-3634366.jpeg?w=533", "hover_image": "https://images.pexels.com/photos/32039109/pexels-photo-32039109.jpeg?w=533", "category": "for-him", "is_featured": True},
        {"name": "Rainbow Kids Name Necklace", "slug": "rainbow-kids-necklace", "price": 1499, "original_price": 1899, "discount": 21, "image": "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=533&q=80", "hover_image": "https://images.unsplash.com/photo-1600862754152-80a263dd564f?w=533&q=80", "category": "kids", "is_featured": True},
        {"name": "Chic Signature Name Necklace", "slug": "chic-signature-necklace", "price": 1499, "original_price": 1899, "discount": 21, "image": "https://images.unsplash.com/photo-1623321673989-830eff0fd59f?w=533&q=80", "hover_image": "https://images.pexels.com/photos/4550854/pexels-photo-4550854.jpeg?w=533", "category": "for-her", "is_featured": True},
        {"name": "Heart Name Necklace", "slug": "heart-name-necklace", "price": 1499, "original_price": 1899, "discount": 21, "image": "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?w=533&q=80", "hover_image": "https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?w=533&q=80", "category": "for-her", "is_featured": True},
        {"name": "Zirconia Bar Necklace", "slug": "zirconia-bar-necklace", "price": 1799, "original_price": 2499, "discount": 28, "image": "https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=533&q=80", "hover_image": "https://images.pexels.com/photos/3674231/pexels-photo-3674231.jpeg?w=533", "category": "for-her", "is_featured": True},
        {"name": "Dainty Name Necklace", "slug": "dainty-name-necklace", "price": 1499, "original_price": 1899, "discount": 21, "image": "https://images.pexels.com/photos/13924051/pexels-photo-13924051.jpeg?w=533", "hover_image": "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=533&q=80", "category": "for-her", "is_featured": True},
        {"name": "Men Legacy Bracelet", "slug": "men-legacy-bracelet", "price": 1499, "original_price": 2499, "discount": 40, "image": "https://images.pexels.com/photos/3070012/pexels-photo-3070012.jpeg?w=533", "hover_image": "https://images.pexels.com/photos/3634366/pexels-photo-3634366.jpeg?w=533", "category": "for-him", "is_featured": True},
        {"name": "Preserved Rose Box & Necklace", "slug": "rose-box-necklace", "price": 1999, "original_price": 3499, "discount": 43, "image": "https://images.pexels.com/photos/10582459/pexels-photo-10582459.jpeg?w=533", "hover_image": "https://images.pexels.com/photos/11952260/pexels-photo-11952260.jpeg?w=533", "category": "for-her", "is_featured": True},
        {"name": "Circle of Love Bead Necklace", "slug": "circle-love-necklace", "price": 1499, "original_price": 2499, "discount": 40, "image": "https://images.unsplash.com/photo-1600862754152-80a263dd564f?w=533&q=80", "hover_image": "https://images.unsplash.com/photo-1623321673989-830eff0fd59f?w=533&q=80", "category": "for-her", "is_featured": False},
        {"name": "Bond of Love Bracelets Set", "slug": "bond-love-bracelets", "price": 1499, "original_price": 2199, "discount": 32, "image": "https://images.pexels.com/photos/121848/pexels-photo-121848.jpeg?w=533", "hover_image": "https://images.pexels.com/photos/3634366/pexels-photo-3634366.jpeg?w=533", "category": "couple", "is_featured": False},
        {"name": "Couple Name Ring", "slug": "couple-name-ring", "price": 1499, "original_price": 1899, "discount": 21, "image": "https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=533&q=80", "hover_image": "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?w=533&q=80", "category": "couple", "is_featured": False},
    ]
    
    for prod in products:
        existing = await db.products.find_one({"slug": prod["slug"]})
        if not existing:
            product = Product(**prod)
            await db.products.insert_one(product.dict())
    
    # Seed settings
    settings = await db.settings.find_one({"id": "site_settings"})
    if not settings:
        await db.settings.insert_one(SiteSettings().dict())
    
    return {"success": True, "message": "Data seeded successfully"}

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "Name Strings API"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
