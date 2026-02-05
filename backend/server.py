from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query, UploadFile, File, BackgroundTasks, Request
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
import base64
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import razorpay
import hmac
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'namestrings')]

# JWT Config - Use fixed secret from env or a stable default for consistent token validation
JWT_SECRET = os.environ.get('JWT_SECRET', 'namecraft-secure-jwt-secret-key-2024')
SECRET_KEY = JWT_SECRET
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer(auto_error=False)

# Create the main app
app = FastAPI(title="Name Craft API")

# Health check endpoint for Kubernetes - MUST be at root level
@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes liveness/readiness probes"""
    return {"status": "healthy", "service": "name-craft-api"}

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
    role: str = "user"
    is_active: bool = True
    address: Optional[Dict[str, Any]] = None
    orders_count: int = 0
    total_spent: float = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

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
    gallery: List[str] = []
    category: str
    metal_types: List[str] = ["gold", "rose-gold", "silver"]
    is_featured: bool = False
    is_active: bool = True
    in_stock: bool = True
    stock_quantity: int = 100
    sku: Optional[str] = None
    weight: Optional[str] = None
    dimensions: Optional[str] = None
    tags: List[str] = []
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
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
    gallery: List[str] = []
    category: str
    metal_types: List[str] = ["gold", "rose-gold", "silver"]
    is_featured: bool = False
    in_stock: bool = True
    stock_quantity: int = 100
    tags: List[str] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    discount: Optional[int] = None
    image: Optional[str] = None
    hover_image: Optional[str] = None
    gallery: Optional[List[str]] = None
    category: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    in_stock: Optional[bool] = None
    stock_quantity: Optional[int] = None
    tags: Optional[List[str]] = None

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
    name: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None

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
    payment_method: str
    coupon_code: Optional[str] = None

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: f"NC{datetime.now().strftime('%Y%m%d')}{secrets.token_hex(3).upper()}")
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    items: List[Dict[str, Any]]
    shipping_address: Dict[str, Any]
    payment_method: str
    payment_status: str = "pending"
    order_status: str = "pending"
    subtotal: float
    shipping_cost: float
    discount_amount: float = 0
    total: float
    coupon_code: Optional[str] = None
    utr_number: Optional[str] = None
    payment_id: Optional[str] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Coupon(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    discount_type: str = "percentage"
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
    # Branding
    site_name: str = "Name Craft"
    tagline: str = "Make it memorable"
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    top_bar_text: str = "India's most loved brand with over 1L+ orders delivered"
    # Contact
    contact_email: str = "support@namecraft.shop"
    contact_phone: str = "+91 98765 43210"
    whatsapp_number: str = "+91 98765 43210"
    address: str = "Mumbai, Maharashtra, India"
    # Currency
    currency: str = "INR"
    currency_symbol: str = "₹"
    # Sale
    sale_active: bool = True
    sale_title: str = "VALENTINE SALE"
    sale_discount: str = "40% OFF"
    sale_subtitle: str = "Storewide"
    sale_end_date: Optional[datetime] = None
    # Shipping
    free_shipping_threshold: float = 1000
    shipping_cost: float = 99
    express_shipping_cost: float = 199
    # Payment Methods
    upi_enabled: bool = True
    upi_id: str = "namecraft@upi"
    razorpay_enabled: bool = True
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    stripe_enabled: bool = True
    stripe_public_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    cod_enabled: bool = True
    cod_extra_charge: float = 0
    # Email Settings
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    email_from_name: str = "Name Craft"
    email_from_address: Optional[str] = None
    send_order_confirmation: bool = True
    send_shipping_notification: bool = True
    send_delivery_notification: bool = True
    # Social Links
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    twitter_url: Optional[str] = None
    youtube_url: Optional[str] = None
    pinterest_url: Optional[str] = None
    # SEO
    meta_title: str = "Name Craft | Personalized Jewelry"
    meta_description: str = "India's #1 personalized jewelry brand. Custom necklaces, bracelets, and rings."
    google_analytics_id: Optional[str] = None
    facebook_pixel_id: Optional[str] = None
    # Hero Section
    hero_title: str = "100% Real Rose Box + Necklace"
    hero_cta: str = "GET YOURS NOW"
    hero_image: Optional[str] = None
    hero_link: str = "/products/rose-box-necklace"
    # Policies
    return_policy: Optional[str] = None
    privacy_policy: Optional[str] = None
    terms_of_service: Optional[str] = None
    shipping_policy: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MediaItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    url: str
    type: str = "image"
    size: int = 0
    folder: str = "general"
    alt_text: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ==================== EMAIL HELPERS ====================

async def send_email(to_email: str, subject: str, html_content: str):
    """Send email using SMTP"""
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        settings = SiteSettings().dict()
    
    if not settings.get("smtp_user") or not settings.get("smtp_password"):
        logger.warning("SMTP not configured, skipping email")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{settings.get('email_from_name', 'Name Craft')} <{settings.get('email_from_address', settings['smtp_user'])}>"
        msg['To'] = to_email
        
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        with smtplib.SMTP(settings.get('smtp_host', 'smtp.gmail.com'), settings.get('smtp_port', 587)) as server:
            server.starttls()
            server.login(settings['smtp_user'], settings['smtp_password'])
            server.sendmail(msg['From'], to_email, msg.as_string())
        
        logger.info(f"Email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False

def generate_order_email(order: dict, settings: dict) -> str:
    """Generate order confirmation email HTML"""
    items_html = ""
    for item in order.get('items', []):
        items_html += f"""
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <img src="{item.get('image', '')}" alt="{item.get('name', '')}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <strong>{item.get('name', '')}</strong><br>
                <small style="color: #666;">Name: {item.get('customization', {}).get('name', 'N/A')}</small>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">{item.get('quantity', 1)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹{item.get('price', 0) * item.get('quantity', 1):,.0f}</td>
        </tr>
        """
    
    shipping = order.get('shipping_address', {})
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #8B0000;">
            <h1 style="font-family: Georgia, serif; font-style: italic; margin: 0; color: #333;">
                {settings.get('site_name', 'Name Craft')}
            </h1>
        </div>
        
        <div style="padding: 30px 0;">
            <h2 style="color: #8B0000; margin-bottom: 5px;">Thank You for Your Order! 🎉</h2>
            <p style="color: #666; margin-top: 0;">Your order has been received and is being processed.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Order Number:</strong> {order.get('order_number', 'N/A')}</p>
                <p style="margin: 5px 0;"><strong>Order Date:</strong> {order.get('created_at', datetime.utcnow()).strftime('%B %d, %Y')}</p>
                <p style="margin: 5px 0;"><strong>Payment Method:</strong> {order.get('payment_method', 'N/A').upper()}</p>
            </div>
            
            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th style="padding: 12px; text-align: left;">Image</th>
                        <th style="padding: 12px; text-align: left;">Product</th>
                        <th style="padding: 12px; text-align: center;">Qty</th>
                        <th style="padding: 12px; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 20px; padding: 20px; background: #f9f9f9; border-radius: 10px;">
                <p style="margin: 5px 0;">Subtotal: <strong>₹{order.get('subtotal', 0):,.0f}</strong></p>
                <p style="margin: 5px 0;">Shipping: <strong>{'FREE' if order.get('shipping_cost', 0) == 0 else f"₹{order.get('shipping_cost', 0):,.0f}"}</strong></p>
                {f'<p style="margin: 5px 0; color: #22c55e;">Discount: <strong>-₹{order.get("discount_amount", 0):,.0f}</strong></p>' if order.get('discount_amount', 0) > 0 else ''}
                <p style="margin: 10px 0 0 0; font-size: 1.2em; border-top: 2px solid #8B0000; padding-top: 10px;">
                    Total: <strong style="color: #8B0000;">₹{order.get('total', 0):,.0f}</strong>
                </p>
            </div>
            
            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Shipping Address</h3>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 10px;">
                <p style="margin: 5px 0;"><strong>{shipping.get('first_name', '')} {shipping.get('last_name', '')}</strong></p>
                <p style="margin: 5px 0;">{shipping.get('address', '')}</p>
                {f"<p style='margin: 5px 0;'>{shipping.get('apartment', '')}</p>" if shipping.get('apartment') else ''}
                <p style="margin: 5px 0;">{shipping.get('city', '')}, {shipping.get('state', '')} - {shipping.get('pincode', '')}</p>
                <p style="margin: 5px 0;">Phone: {shipping.get('phone', '')}</p>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #fff8f0; border-radius: 10px; border-left: 4px solid #8B0000;">
                <p style="margin: 0; font-size: 0.9em;">
                    <strong>📦 What's Next?</strong><br>
                    Your personalized jewelry will be handcrafted with care. You'll receive a shipping notification with tracking details once your order is on its way!
                </p>
            </div>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666; font-size: 0.85em;">
            <p>Need help? Contact us at <a href="mailto:{settings.get('contact_email', '')}" style="color: #8B0000;">{settings.get('contact_email', '')}</a></p>
            <p style="margin-top: 10px;">
                <a href="#" style="color: #666; text-decoration: none; margin: 0 10px;">Instagram</a>
                <a href="#" style="color: #666; text-decoration: none; margin: 0 10px;">Facebook</a>
            </p>
            <p style="margin-top: 15px;">© {datetime.now().year} {settings.get('site_name', 'Name Craft')}. All rights reserved.</p>
        </div>
    </body>
    </html>
    """

def generate_shipping_email(order: dict, settings: dict) -> str:
    """Generate shipping notification email"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Your Order Has Shipped!</title></head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #8B0000;">
            <h1 style="font-family: Georgia, serif; font-style: italic; margin: 0;">{settings.get('site_name', 'Name Craft')}</h1>
        </div>
        <div style="padding: 30px 0; text-align: center;">
            <h2 style="color: #8B0000;">🚚 Your Order Has Shipped!</h2>
            <p>Great news! Your order <strong>#{order.get('order_number', '')}</strong> is on its way.</p>
            {f'<div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;"><p style="margin: 0;"><strong>Tracking Number:</strong> {order.get("tracking_number", "N/A")}</p></div>' if order.get('tracking_number') else ''}
            <p style="color: #666;">You can track your package using the tracking number above.</p>
        </div>
        <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666; font-size: 0.85em;">
            <p>© {datetime.now().year} {settings.get('site_name', 'Name Craft')}</p>
        </div>
    </body>
    </html>
    """

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
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
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
    logging.info(f"Login attempt for email: {credentials.email}")
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        logging.warning(f"User not found: {credentials.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    password_valid = verify_password(credentials.password, user.get("password_hash", ""))
    logging.info(f"Password verification for {credentials.email}: {password_valid}")
    
    if not password_valid:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is disabled")
    
    # Update last login
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_login": datetime.utcnow()}})
    
    token = create_access_token({"sub": user["id"], "role": user.get("role", "user")})
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user.get("role", "user")}}

@api_router.get("/auth/me")
async def get_me(user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"id": user["id"], "email": user["email"], "name": user["name"], "role": user.get("role", "user")}

@api_router.post("/auth/forgot-password")
async def forgot_password(data: dict, background_tasks: BackgroundTasks):
    """Send password reset email"""
    email = data.get("email", "").lower().strip()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    user = await db.users.find_one({"email": email})
    if not user:
        # Don't reveal if email exists or not for security
        return {"success": True, "message": "If an account exists, you will receive a reset email"}
    
    # Generate reset token
    reset_token = str(uuid.uuid4())
    reset_expiry = datetime.utcnow() + timedelta(hours=1)
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"reset_token": reset_token, "reset_token_expiry": reset_expiry}}
    )
    
    # Get site settings
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        settings = {}
    
    # Send email
    reset_link = f"{settings.get('site_url', 'https://namecraft.shop')}/reset-password?token={reset_token}"
    email_html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Reset Your Password</title></head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #0ea5e9;">
            <h1 style="font-family: Georgia, serif; margin: 0; color: #0ea5e9;">Name Craft</h1>
        </div>
        <div style="padding: 30px 0;">
            <h2 style="color: #333;">Reset Your Password</h2>
            <p>Hi {user.get('name', 'there')},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 0.9em;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666; font-size: 0.85em;">
            <p>© {datetime.now().year} Name Craft. All rights reserved.</p>
        </div>
    </body>
    </html>
    """
    
    background_tasks.add_task(send_email, email, "Reset Your Password - Name Craft", email_html)
    
    return {"success": True, "message": "If an account exists, you will receive a reset email"}

@api_router.post("/auth/reset-password")
async def reset_password(data: dict):
    """Reset password with token"""
    token = data.get("token", "")
    new_password = data.get("password", "")
    
    if not token or not new_password:
        raise HTTPException(status_code=400, detail="Token and password are required")
    
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    user = await db.users.find_one({
        "reset_token": token,
        "reset_token_expiry": {"$gt": datetime.utcnow()}
    })
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Update password
    await db.users.update_one(
        {"id": user["id"]},
        {
            "$set": {"password_hash": get_password_hash(new_password)},
            "$unset": {"reset_token": "", "reset_token_expiry": ""}
        }
    )
    
    return {"success": True, "message": "Password reset successfully"}

@api_router.put("/auth/profile")
async def update_profile(profile_data: dict, user = Depends(get_current_user)):
    """Update user profile"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    allowed_fields = ["name", "phone", "address", "city", "state", "pincode"]
    update_data = {k: v for k, v in profile_data.items() if k in allowed_fields}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return updated_user

@api_router.get("/orders/my-orders")
async def get_my_orders(user = Depends(get_current_user)):
    """Get orders for logged in user"""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find orders by user_id OR by email
    orders = await db.orders.find(
        {"$or": [{"user_id": user["id"]}, {"user_email": user["email"]}]}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return orders

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
async def create_order(order_data: OrderCreate, background_tasks: BackgroundTasks, user = Depends(get_current_user)):
    # Calculate totals
    subtotal = 0
    order_items = []
    
    for item in order_data.items:
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not product:
            # If product not found by ID, create a placeholder
            order_items.append({
                "product_id": item.product_id,
                "name": item.name if hasattr(item, 'name') else "Product",
                "price": item.price if hasattr(item, 'price') else 0,
                "quantity": item.quantity,
                "image": item.image if hasattr(item, 'image') else "",
                "customization": item.customization
            })
            subtotal += (item.price if hasattr(item, 'price') else 0) * item.quantity
            continue
        
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
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        settings = SiteSettings().dict()
    
    shipping_cost = 0 if subtotal >= settings.get("free_shipping_threshold", 1000) else settings.get("shipping_cost", 99)
    
    # Apply coupon if provided
    discount_amount = 0
    if order_data.coupon_code:
        coupon = await db.coupons.find_one({"code": order_data.coupon_code.upper(), "is_active": True}, {"_id": 0})
        if coupon and subtotal >= coupon.get("min_order_amount", 0):
            if coupon["discount_type"] == "percentage":
                discount_amount = subtotal * (coupon["discount_value"] / 100)
                if coupon.get("max_discount"):
                    discount_amount = min(discount_amount, coupon["max_discount"])
            else:
                discount_amount = coupon["discount_value"]
            
            await db.coupons.update_one({"id": coupon["id"]}, {"$inc": {"used_count": 1}})
    
    total = subtotal + shipping_cost - discount_amount
    
    # Get user email from shipping address
    user_email = order_data.shipping_address.email
    
    # If not logged in, try to find user by email and link the order
    user_id = None
    if user:
        user_id = user["id"]
    else:
        existing_user = await db.users.find_one({"email": user_email}, {"_id": 0})
        if existing_user:
            user_id = existing_user["id"]
    
    order = Order(
        user_id=user_id,
        user_email=user_email,
        items=order_items,
        shipping_address=order_data.shipping_address.dict(),
        payment_method=order_data.payment_method,
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        discount_amount=discount_amount,
        total=total,
        coupon_code=order_data.coupon_code
    )
    
    order_dict = order.dict()
    await db.orders.insert_one(order_dict)
    
    # Remove MongoDB _id from response
    order_dict.pop('_id', None)
    
    # Update user stats if user found
    if user_id:
        await db.users.update_one(
            {"id": user_id},
            {"$inc": {"orders_count": 1, "total_spent": total}}
        )
    
    # Send order confirmation email in background
    if settings.get("send_order_confirmation", True):
        email_html = generate_order_email(order_dict, settings)
        background_tasks.add_task(
            send_email,
            order_data.shipping_address.email,
            f"Order Confirmed! #{order.order_number}",
            email_html
        )
    
    return order_dict

@api_router.get("/orders")
async def get_user_orders(user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.post("/orders/{order_id}/submit-payment")
async def submit_payment(order_id: str, payment_data: dict):
    """Submit UTR number for manual payment verification"""
    # Find order by order_number or id
    order = await db.orders.find_one({"$or": [{"order_number": order_id}, {"id": order_id}]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    utr_number = payment_data.get("utr_number", "")
    payment_method = payment_data.get("payment_method", "upi")
    
    # Update order with UTR and set payment status to pending_verification
    await db.orders.update_one(
        {"_id": order["_id"]},
        {"$set": {
            "utr_number": utr_number,
            "payment_method": payment_method,
            "payment_status": "pending_verification",
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"success": True, "message": "Payment submitted for verification"}

@api_router.post("/admin/orders/{order_id}/approve-payment")
async def approve_payment(order_id: str, admin = Depends(get_admin_user)):
    """Admin approves a payment"""
    order = await db.orders.find_one({"$or": [{"order_number": order_id}, {"id": order_id}]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await db.orders.update_one(
        {"_id": order["_id"]},
        {"$set": {
            "payment_status": "paid",
            "order_status": "confirmed",
            "payment_verified_at": datetime.utcnow(),
            "payment_verified_by": admin["id"],
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"success": True, "message": "Payment approved successfully"}

@api_router.post("/admin/orders/{order_id}/reject-payment")
async def reject_payment(order_id: str, reason: str = "Payment verification failed", admin = Depends(get_admin_user)):
    """Admin rejects a payment"""
    order = await db.orders.find_one({"$or": [{"order_number": order_id}, {"id": order_id}]})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await db.orders.update_one(
        {"_id": order["_id"]},
        {"$set": {
            "payment_status": "rejected",
            "payment_rejection_reason": reason,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"success": True, "message": "Payment rejected"}

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, user = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if user and order.get("user_id") != user["id"] and user.get("role") not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return order

# ==================== RAZORPAY PAYMENT ROUTES ====================

def get_razorpay_client():
    """Get Razorpay client with keys from settings"""
    # Get keys from database settings
    import asyncio
    loop = asyncio.new_event_loop()
    settings = loop.run_until_complete(db.settings.find_one({"id": "site_settings"}, {"_id": 0}))
    loop.close()
    
    key_id = settings.get("razorpay_key_id") if settings else None
    key_secret = settings.get("razorpay_key_secret") if settings else None
    
    if not key_id or not key_secret:
        return None
    
    return razorpay.Client(auth=(key_id, key_secret))

@api_router.post("/payment/razorpay/create-order")
async def create_razorpay_order(data: dict):
    """Create a Razorpay order for payment"""
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    
    if not settings or not settings.get("razorpay_enabled"):
        raise HTTPException(status_code=400, detail="Razorpay is not enabled")
    
    key_id = settings.get("razorpay_key_id")
    key_secret = settings.get("razorpay_key_secret")
    
    if not key_id or not key_secret:
        raise HTTPException(status_code=400, detail="Razorpay keys not configured")
    
    try:
        client = razorpay.Client(auth=(key_id, key_secret))
        
        amount = int(data.get("amount", 0) * 100)  # Convert to paise
        
        razorpay_order = client.order.create({
            "amount": amount,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "order_id": data.get("order_id", ""),
                "customer_email": data.get("email", "")
            }
        })
        
        return {
            "id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
            "key_id": key_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create Razorpay order: {str(e)}")

@api_router.post("/payment/razorpay/verify")
async def verify_razorpay_payment(data: dict):
    """Verify Razorpay payment signature and update order"""
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    
    if not settings:
        raise HTTPException(status_code=400, detail="Settings not found")
    
    key_secret = settings.get("razorpay_key_secret")
    
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")
    order_id = data.get("order_id")
    
    if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
        raise HTTPException(status_code=400, detail="Missing payment details")
    
    # Verify signature
    message = f"{razorpay_order_id}|{razorpay_payment_id}"
    generated_signature = hmac.new(
        key_secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    if generated_signature != razorpay_signature:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    
    # Update order status
    if order_id:
        await db.orders.update_one(
            {"$or": [{"id": order_id}, {"order_number": order_id}]},
            {"$set": {
                "payment_status": "paid",
                "order_status": "confirmed",
                "payment_id": razorpay_payment_id,
                "razorpay_order_id": razorpay_order_id,
                "updated_at": datetime.utcnow()
            }}
        )
    
    return {"success": True, "message": "Payment verified successfully"}

@api_router.get("/payment/razorpay/config")
async def get_razorpay_config():
    """Get Razorpay public config for frontend"""
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    
    if not settings or not settings.get("razorpay_enabled"):
        return {"enabled": False}
    
    key_id = settings.get("razorpay_key_id")
    
    if not key_id:
        return {"enabled": False}
    
    return {
        "enabled": True,
        "key_id": key_id,
        "name": settings.get("site_name", "Name Craft"),
        "description": "Payment for your order",
        "currency": "INR",
        "image": settings.get("site_logo", "")
    }

# ==================== COUPON ROUTES ====================

@api_router.post("/coupons/validate")
async def validate_coupon(code: str, subtotal: float):
    coupon = await db.coupons.find_one({"code": code.upper(), "is_active": True}, {"_id": 0})
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
    # Remove sensitive data for public endpoint
    public_settings = {k: v for k, v in settings.items() if not any(x in k for x in ['secret', 'password', 'smtp_'])}
    return public_settings

# ==================== MEDIA ROUTES ====================

@api_router.post("/admin/media/upload")
async def upload_media(file_data: Dict[str, Any], admin = Depends(get_admin_user)):
    """Upload media via base64 or URL"""
    media = MediaItem(
        name=file_data.get("name", "Untitled"),
        url=file_data.get("url", ""),
        type=file_data.get("type", "image"),
        folder=file_data.get("folder", "general"),
        alt_text=file_data.get("alt_text")
    )
    await db.media.insert_one(media.dict())
    return media.dict()

@api_router.get("/admin/media")
async def get_media(folder: Optional[str] = None, admin = Depends(get_admin_user)):
    query = {} if not folder else {"folder": folder}
    media = await db.media.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return media

@api_router.delete("/admin/media/{media_id}")
async def delete_media(media_id: str, admin = Depends(get_admin_user)):
    result = await db.media.delete_one({"id": media_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"success": True}

# ==================== ADMIN ROUTES ====================

@api_router.post("/admin/setup")
async def setup_admin(admin_data: AdminCreate):
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

@api_router.post("/admin/reset-password")
async def reset_admin_password(admin_data: AdminCreate):
    """Reset admin password - uses secret key for security"""
    # Find admin user
    admin = await db.users.find_one({"email": admin_data.email, "role": "admin"})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    # Update password
    new_hash = get_password_hash(admin_data.password)
    await db.users.update_one(
        {"email": admin_data.email, "role": "admin"},
        {"$set": {"password_hash": new_hash}}
    )
    
    return {"success": True, "message": "Admin password reset successfully"}

@api_router.get("/admin/dashboard")
async def admin_dashboard(admin = Depends(get_admin_user)):
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
    
    # Pending orders
    pending_orders = await db.orders.count_documents({"order_status": "pending"})
    
    # Today's orders
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = await db.orders.count_documents({"created_at": {"$gte": today_start}})
    
    # Recent orders
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    
    # Order stats by status
    status_pipeline = [
        {"$group": {"_id": "$order_status", "count": {"$sum": 1}}}
    ]
    status_stats = await db.orders.aggregate(status_pipeline).to_list(10)
    
    # Monthly revenue (last 6 months)
    monthly_pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m", "date": "$created_at"}},
            "revenue": {"$sum": "$total"},
            "orders": {"$sum": 1}
        }},
        {"$sort": {"_id": -1}},
        {"$limit": 6}
    ]
    monthly_stats = await db.orders.aggregate(monthly_pipeline).to_list(6)
    
    return {
        "stats": {
            "total_orders": total_orders,
            "total_users": total_users,
            "total_products": total_products,
            "total_revenue": total_revenue,
            "pending_orders": pending_orders,
            "today_orders": today_orders
        },
        "recent_orders": recent_orders,
        "order_status_stats": {s["_id"]: s["count"] for s in status_stats},
        "monthly_stats": monthly_stats
    }

@api_router.get("/admin/orders")
async def admin_get_orders(
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    admin = Depends(get_admin_user)
):
    query = {}
    if status:
        query["order_status"] = status
    if payment_status:
        query["payment_status"] = payment_status
    if search:
        query["$or"] = [
            {"order_number": {"$regex": search, "$options": "i"}},
            {"shipping_address.email": {"$regex": search, "$options": "i"}},
            {"shipping_address.phone": {"$regex": search, "$options": "i"}}
        ]
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.orders.count_documents(query)
    
    return {"orders": orders, "total": total}

@api_router.put("/admin/orders/{order_id}")
async def admin_update_order(
    order_id: str,
    update_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    admin = Depends(get_admin_user)
):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update = {"updated_at": datetime.utcnow()}
    
    allowed_fields = ["order_status", "payment_status", "tracking_number", "admin_notes"]
    for field in allowed_fields:
        if field in update_data:
            update[field] = update_data[field]
    
    await db.orders.update_one({"id": order_id}, {"$set": update})
    
    # Send shipping notification
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        settings = SiteSettings().dict()
    
    if update_data.get("order_status") == "shipped" and settings.get("send_shipping_notification", True):
        order["tracking_number"] = update_data.get("tracking_number", order.get("tracking_number"))
        email_html = generate_shipping_email(order, settings)
        background_tasks.add_task(
            send_email,
            order["shipping_address"]["email"],
            f"Your Order #{order['order_number']} Has Shipped!",
            email_html
        )
    
    return {"success": True}

@api_router.get("/admin/products")
async def admin_get_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    admin = Depends(get_admin_user)
):
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if category:
        query["category"] = category
    
    products = await db.products.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.products.count_documents(query)
    return {"products": products, "total": total}

@api_router.post("/admin/products")
async def admin_create_product(product_data: ProductCreate, admin = Depends(get_admin_user)):
    product = Product(**product_data.dict())
    await db.products.insert_one(product.dict())
    return product.dict()

@api_router.put("/admin/products/{product_id}")
async def admin_update_product(product_id: str, product_data: Dict[str, Any], admin = Depends(get_admin_user)):
    product_data["updated_at"] = datetime.utcnow()
    result = await db.products.update_one({"id": product_id}, {"$set": product_data})
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
async def admin_get_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    admin = Depends(get_admin_user)
):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]
    if role:
        query["role"] = role
    
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    return {"users": users, "total": total}

@api_router.get("/admin/users/{user_id}")
async def admin_get_user(user_id: str, admin = Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's orders
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    user["orders"] = orders
    
    return user

@api_router.put("/admin/users/{user_id}")
async def admin_update_user(
    user_id: str,
    update_data: Dict[str, Any],
    admin = Depends(get_admin_user)
):
    allowed_fields = ["is_active", "role", "name", "phone"]
    update = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if not update:
        raise HTTPException(status_code=400, detail="No valid update data")
    
    result = await db.users.update_one({"id": user_id}, {"$set": update})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True}

@api_router.get("/admin/coupons")
async def admin_get_coupons(admin = Depends(get_admin_user)):
    coupons = await db.coupons.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return coupons

@api_router.post("/admin/coupons")
async def admin_create_coupon(coupon_data: CouponCreate, admin = Depends(get_admin_user)):
    coupon = Coupon(**coupon_data.dict())
    coupon.code = coupon.code.upper()
    await db.coupons.insert_one(coupon.dict())
    return coupon.dict()

@api_router.put("/admin/coupons/{coupon_id}")
async def admin_update_coupon(coupon_id: str, update_data: Dict[str, Any], admin = Depends(get_admin_user)):
    result = await db.coupons.update_one({"id": coupon_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"success": True}

@api_router.delete("/admin/coupons/{coupon_id}")
async def admin_delete_coupon(coupon_id: str, admin = Depends(get_admin_user)):
    result = await db.coupons.delete_one({"id": coupon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"success": True}

@api_router.get("/admin/settings")
async def admin_get_settings(admin = Depends(get_admin_user)):
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
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
    categories = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(100)
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

# ==================== EMAIL TEST ====================

@api_router.post("/admin/test-email")
async def test_email(to_email: str, admin = Depends(get_admin_user)):
    """Send a test email"""
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        settings = SiteSettings().dict()
    
    test_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #8B0000;">Test Email from {settings.get('site_name', 'Name Craft')}</h1>
        <p>If you're seeing this, your email configuration is working correctly!</p>
        <p style="color: #666;">Sent at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
    </body>
    </html>
    """
    
    success = await send_email(to_email, f"Test Email - {settings.get('site_name', 'Name Craft')}", test_html)
    
    if success:
        return {"success": True, "message": "Test email sent successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send test email. Check SMTP configuration.")

# ==================== SEED DATA ====================

@api_router.post("/admin/seed")
async def seed_data(admin = Depends(get_admin_user)):
    """Seed initial data"""
    # Seed categories
    categories = [
        {"name": "Her", "slug": "for-her", "order": 1, "image": "https://images.pexels.com/photos/4550854/pexels-photo-4550854.jpeg?w=800"},
        {"name": "Him", "slug": "for-him", "order": 2, "image": "https://images.pexels.com/photos/3070012/pexels-photo-3070012.jpeg?w=800"},
        {"name": "Kids", "slug": "kids", "order": 3, "image": "https://images.pexels.com/photos/5737277/pexels-photo-5737277.jpeg?w=800"},
        {"name": "Couple", "slug": "couple", "order": 4, "image": "https://images.pexels.com/photos/121848/pexels-photo-121848.jpeg?w=800"},
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
        {"name": "Men Circle Bracelet", "slug": "men-circle-bracelet", "price": 1499, "original_price": 2499, "discount": 40, "image": "https://images.pexels.com/photos/3634366/pexels-photo-3634366.jpeg?w=533", "hover_image": "https://images.pexels.com/photos/32039109/pexels-photo-32039109.jpeg?w=533", "category": "for-him", "is_featured": True, "description": "Stylish men's circle bracelet with personalized engraving"},
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
    
    # Seed default coupons
    coupons = [
        {"code": "SAVE10", "discount_type": "percentage", "discount_value": 10, "min_order_amount": 1000},
        {"code": "FLAT100", "discount_type": "fixed", "discount_value": 100, "min_order_amount": 1499},
        {"code": "VALENTINE", "discount_type": "percentage", "discount_value": 15, "min_order_amount": 1000, "max_discount": 500},
    ]
    
    for coup in coupons:
        existing = await db.coupons.find_one({"code": coup["code"]})
        if not existing:
            coupon = Coupon(**coup)
            await db.coupons.insert_one(coupon.dict())
    
    # Seed settings
    settings = await db.settings.find_one({"id": "site_settings"})
    if not settings:
        await db.settings.insert_one(SiteSettings().dict())
    
    return {"success": True, "message": "Data seeded successfully"}

# ==================== DATA MIGRATION ====================

@api_router.post("/admin/seed-products")
async def seed_products(admin = Depends(get_admin_user)):
    """One-time migration: Delete old products and add 35 new products"""
    
    # AI Generated Images
    AI_IMAGES = {
        'hero_necklace': 'https://static.prod-images.emergentagent.com/jobs/9d1dc081-f684-46a4-910e-adc6bbd703a7/images/f8c6efac80ae614536d1764b9a0a170f7f052c57b2b71df301cd29f7d7098064.png',
        'rose_box': 'https://static.prod-images.emergentagent.com/jobs/9d1dc081-f684-46a4-910e-adc6bbd703a7/images/5050e972d9dc4fc45ea5f4231b20933ccc5c2499b6c382d95e467787578f8af7.png',
        'kids_bracelet': 'https://static.prod-images.emergentagent.com/jobs/9d1dc081-f684-46a4-910e-adc6bbd703a7/images/3b0ea511d8cce0fb7b141203688ff7fa9c5f4e711ea338f881f4ef3ab19022ba.png',
        'infinity_ring': 'https://static.prod-images.emergentagent.com/jobs/9d1dc081-f684-46a4-910e-adc6bbd703a7/images/7cadb3dfad6ec995430963bc1e1301db97653351bb2c2c47038f953bdf0512ee.png',
        'couple_bracelet': 'https://static.prod-images.emergentagent.com/jobs/9d1dc081-f684-46a4-910e-adc6bbd703a7/images/6391f64240274bca52ba985f92b03ac223f615f672a948c3e8552e1a72193866.png',
    }
    
    STOCK = [
        'https://images.unsplash.com/photo-1758995115518-26f90aa61b97?w=600',
        'https://images.unsplash.com/photo-1758995115643-1e8348bfde39?w=600',
        'https://images.unsplash.com/photo-1601121141499-17ae80afc03a?w=600',
        'https://images.pexels.com/photos/14509757/pexels-photo-14509757.jpeg?w=600',
        'https://images.unsplash.com/photo-1668619322685-e634175f8182?w=600',
        'https://images.unsplash.com/photo-1681091636907-85eb440dfe06?w=600',
        'https://images.pexels.com/photos/14509642/pexels-photo-14509642.jpeg?w=600',
        'https://images.unsplash.com/photo-1588909006332-2e30f95291bc?w=600',
        'https://images.unsplash.com/photo-1720528347642-e70ea18b4140?w=600',
        'https://images.pexels.com/photos/29612233/pexels-photo-29612233.jpeg?w=600',
        'https://images.unsplash.com/photo-1761210875101-1273b9ae5600?w=600',
        'https://images.unsplash.com/photo-1758995115543-983c55f98a33?w=600',
        'https://images.unsplash.com/photo-1761211115639-54394f139142?w=600',
        'https://images.unsplash.com/photo-1761211106346-939cb32005d7?w=600',
        'https://images.pexels.com/photos/29193429/pexels-photo-29193429.jpeg?w=600',
        'https://images.unsplash.com/photo-1766560362710-b1d951aab881?w=600',
        'https://images.pexels.com/photos/16849040/pexels-photo-16849040.png?w=600',
        'https://images.pexels.com/photos/7104205/pexels-photo-7104205.jpeg?w=600',
        'https://images.pexels.com/photos/29218181/pexels-photo-29218181.jpeg?w=600',
        'https://images.pexels.com/photos/16304556/pexels-photo-16304556.jpeg?w=600',
    ]
    
    PRODUCTS = [
        {'name': 'Personalized Name Necklace', 'category': 'for-her', 'price': 1299, 'original_price': 1999, 'discount': 35, 'image': AI_IMAGES['hero_necklace'], 'description': 'Elegant personalized name necklace crafted with premium quality. Perfect gift for her.', 'is_featured': True},
        {'name': 'Rose Box Heart Necklace', 'category': 'for-her', 'price': 1999, 'original_price': 2999, 'discount': 33, 'image': AI_IMAGES['rose_box'], 'description': 'Beautiful preserved rose box with gold heart necklace. Romantic gift for special occasions.', 'is_featured': True},
        {'name': 'Infinity Heart Pendant', 'category': 'for-her', 'price': 1499, 'original_price': 2299, 'discount': 35, 'image': STOCK[10], 'description': 'Stunning infinity heart pendant symbolizing eternal love. Customizable with names.', 'is_featured': False},
        {'name': 'Initial Letter Necklace', 'category': 'for-her', 'price': 999, 'original_price': 1499, 'discount': 33, 'image': STOCK[11], 'description': 'Delicate initial letter pendant necklace. Personalize with your loved ones initial.', 'is_featured': False},
        {'name': 'Heart Name Ring Necklace', 'category': 'for-her', 'price': 1599, 'original_price': 2499, 'discount': 36, 'image': STOCK[12], 'description': 'Beautiful heart pendant with name rings. Each ring represents someone special.', 'is_featured': False},
        {'name': 'Layered Chain Necklace', 'category': 'for-her', 'price': 1199, 'original_price': 1799, 'discount': 33, 'image': STOCK[13], 'description': 'Trendy layered chain necklace with customizable pendants.', 'is_featured': False},
        {'name': 'Classic Gold Name Chain', 'category': 'for-her', 'price': 1799, 'original_price': 2799, 'discount': 36, 'image': STOCK[0], 'description': 'Timeless gold name chain necklace. Premium quality craftsmanship.', 'is_featured': False},
        {'name': 'Minimalist Bar Necklace', 'category': 'for-her', 'price': 899, 'original_price': 1399, 'discount': 36, 'image': STOCK[14], 'description': 'Sleek minimalist bar necklace with custom engraving option.', 'is_featured': False},
        {'name': 'Leather Name Bracelet', 'category': 'for-him', 'price': 1299, 'original_price': 1999, 'discount': 35, 'image': AI_IMAGES['couple_bracelet'], 'description': 'Premium leather bracelet with personalized name plate. Perfect for men.', 'is_featured': True},
        {'name': 'Steel ID Bracelet', 'category': 'for-him', 'price': 1499, 'original_price': 2299, 'discount': 35, 'image': STOCK[18], 'description': 'Stainless steel ID bracelet with custom engraving. Durable and stylish.', 'is_featured': False},
        {'name': 'Braided Leather Band', 'category': 'for-him', 'price': 999, 'original_price': 1499, 'discount': 33, 'image': STOCK[19], 'description': 'Handcrafted braided leather band with silver clasp.', 'is_featured': False},
        {'name': 'Mens Beaded Bracelet', 'category': 'for-him', 'price': 799, 'original_price': 1199, 'discount': 33, 'image': STOCK[5], 'description': 'Natural stone beaded bracelet with custom charm.', 'is_featured': False},
        {'name': 'Anchor Chain Bracelet', 'category': 'for-him', 'price': 1199, 'original_price': 1799, 'discount': 33, 'image': STOCK[6], 'description': 'Bold anchor chain bracelet with name engraving.', 'is_featured': False},
        {'name': 'Titanium Cuff Bracelet', 'category': 'for-him', 'price': 1599, 'original_price': 2499, 'discount': 36, 'image': STOCK[4], 'description': 'Premium titanium cuff with inner personalization.', 'is_featured': False},
        {'name': 'Double Wrap Leather', 'category': 'for-him', 'price': 1099, 'original_price': 1699, 'discount': 35, 'image': STOCK[7], 'description': 'Stylish double wrap leather bracelet with magnetic clasp.', 'is_featured': False},
        {'name': 'Rainbow Name Bracelet', 'category': 'kids', 'price': 699, 'original_price': 999, 'discount': 30, 'image': AI_IMAGES['kids_bracelet'], 'description': 'Colorful rainbow bracelet with personalized name beads. Safe for kids.', 'is_featured': True},
        {'name': 'Butterfly Charm Bracelet', 'category': 'kids', 'price': 599, 'original_price': 899, 'discount': 33, 'image': STOCK[15], 'description': 'Adorable butterfly charm bracelet with name pendant.', 'is_featured': False},
        {'name': 'Star Moon Necklace', 'category': 'kids', 'price': 799, 'original_price': 1199, 'discount': 33, 'image': STOCK[16], 'description': 'Magical star and moon necklace with initial charm.', 'is_featured': False},
        {'name': 'Princess Crown Pendant', 'category': 'kids', 'price': 899, 'original_price': 1399, 'discount': 36, 'image': STOCK[17], 'description': 'Sparkly princess crown pendant with custom name.', 'is_featured': False},
        {'name': 'Superhero ID Bracelet', 'category': 'kids', 'price': 649, 'original_price': 999, 'discount': 35, 'image': STOCK[2], 'description': 'Cool superhero-themed ID bracelet for kids.', 'is_featured': False},
        {'name': 'Matching Name Bracelets Set', 'category': 'couples', 'price': 1999, 'original_price': 2999, 'discount': 33, 'image': AI_IMAGES['couple_bracelet'], 'description': 'His and hers matching bracelets with personalized names. Perfect couple gift.', 'is_featured': True},
        {'name': 'Interlocking Heart Pendants', 'category': 'couples', 'price': 2499, 'original_price': 3499, 'discount': 29, 'image': STOCK[10], 'description': 'Two hearts that interlock perfectly. Each pendant customized with initials.', 'is_featured': False},
        {'name': 'King Queen Bracelets', 'category': 'couples', 'price': 1799, 'original_price': 2699, 'discount': 33, 'image': STOCK[1], 'description': 'Royal themed couple bracelets with crown charms.', 'is_featured': False},
        {'name': 'Coordinates Necklace Set', 'category': 'couples', 'price': 2199, 'original_price': 3299, 'discount': 33, 'image': STOCK[11], 'description': 'Custom coordinates of your special place on matching necklaces.', 'is_featured': False},
        {'name': 'Puzzle Piece Pendants', 'category': 'couples', 'price': 1699, 'original_price': 2499, 'discount': 32, 'image': STOCK[12], 'description': 'Two puzzle pieces that fit together. Symbolizing perfect match.', 'is_featured': False},
        {'name': 'Infinity Diamond Ring', 'category': 'rings', 'price': 2499, 'original_price': 3999, 'discount': 38, 'image': AI_IMAGES['infinity_ring'], 'description': 'Elegant infinity ring with diamond accents. Engrave a special message inside.', 'is_featured': True},
        {'name': 'Name Band Ring', 'category': 'rings', 'price': 1299, 'original_price': 1999, 'discount': 35, 'image': STOCK[7], 'description': 'Classic band ring with custom name engraving.', 'is_featured': False},
        {'name': 'Birthstone Promise Ring', 'category': 'rings', 'price': 1799, 'original_price': 2699, 'discount': 33, 'image': STOCK[8], 'description': 'Beautiful promise ring with birthstone and name.', 'is_featured': False},
        {'name': 'Stacking Name Rings Set', 'category': 'rings', 'price': 1999, 'original_price': 2999, 'discount': 33, 'image': STOCK[9], 'description': 'Set of 3 stackable rings, each with a name.', 'is_featured': False},
        {'name': 'Signet Initial Ring', 'category': 'rings', 'price': 1499, 'original_price': 2299, 'discount': 35, 'image': STOCK[3], 'description': 'Classic signet ring with initial engraving.', 'is_featured': False},
        {'name': 'Quick Ship Name Pendant', 'category': 'express', 'price': 999, 'original_price': 1499, 'discount': 33, 'image': STOCK[0], 'description': 'Ready to ship personalized pendant. Delivered in 2-3 days.', 'is_featured': False},
        {'name': 'Express Heart Necklace', 'category': 'express', 'price': 1199, 'original_price': 1799, 'discount': 33, 'image': STOCK[10], 'description': 'Fast delivery heart necklace with name engraving.', 'is_featured': False},
        {'name': 'Rush Order Bracelet', 'category': 'express', 'price': 899, 'original_price': 1399, 'discount': 36, 'image': STOCK[4], 'description': 'Express personalized bracelet. Perfect for last-minute gifts.', 'is_featured': False},
        {'name': 'Same Day Initial Pendant', 'category': 'express', 'price': 799, 'original_price': 1199, 'discount': 33, 'image': STOCK[11], 'description': 'Initial pendant with same-day dispatch option.', 'is_featured': False},
        {'name': 'Quick Custom Ring', 'category': 'express', 'price': 1099, 'original_price': 1699, 'discount': 35, 'image': STOCK[8], 'description': 'Express delivery personalized ring. Ships within 24 hours.', 'is_featured': False},
    ]
    
    def create_slug(name):
        return name.lower().replace(' ', '-').replace('&', 'and')
    
    # Delete all existing products
    delete_result = await db.products.delete_many({})
    
    # Add new products
    added = 0
    for product in PRODUCTS:
        slug = create_slug(product['name'])
        doc = {
            'id': str(uuid.uuid4()),
            'name': product['name'],
            'slug': slug,
            'description': product['description'],
            'price': float(product['price']),
            'original_price': float(product['original_price']),
            'discount': product['discount'],
            'image': product['image'],
            'hover_image': product['image'],
            'category': product['category'],
            'metal_types': ['gold', 'rose-gold', 'silver'],
            'is_featured': product.get('is_featured', False),
            'is_active': True,
            'in_stock': True,
            'stock_quantity': 100,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        }
        await db.products.insert_one(doc)
        added += 1
    
    # Update hero settings
    await db.settings.update_one(
        {'id': 'site_settings'},
        {'$set': {
            'hero_title': '100% Real Rose Box + Necklace',
            'hero_cta': 'GET YOURS NOW',
            'hero_image': AI_IMAGES['rose_box'],
            'hero_link': '/products/rose-box-heart-necklace',
        }},
        upsert=True
    )
    
    return {
        "success": True,
        "deleted": delete_result.deleted_count,
        "added": added,
        "message": f"Deleted {delete_result.deleted_count} old products, added {added} new products"
    }

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "Name Craft API", "version": "2.0"}

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
