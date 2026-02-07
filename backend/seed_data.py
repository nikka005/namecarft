"""
Seed script for Name Craft production database
Run: python3 seed_data.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
from datetime import datetime
import uuid
import re
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'namecraft_production')

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text

STOCK_IMAGES = {
    'earrings': [
        ('https://images.unsplash.com/photo-1653227908311-c94d2f037674?w=600', 'https://images.unsplash.com/photo-1589095053205-8fc842336f4a?w=600'),
        ('https://images.unsplash.com/photo-1653227907911-6e1afb4cbea1?w=600', 'https://images.unsplash.com/photo-1653227907864-560dce4c252d?w=600'),
        ('https://images.unsplash.com/photo-1589095053205-8fc842336f4a?w=600', 'https://images.unsplash.com/photo-1653227908311-c94d2f037674?w=600'),
        ('https://images.unsplash.com/photo-1653227907864-560dce4c252d?w=600', 'https://images.unsplash.com/photo-1653227907911-6e1afb4cbea1?w=600'),
    ],
    'couples': [
        ('https://images.unsplash.com/photo-1668619322826-c98b77b9c125?w=600', 'https://images.unsplash.com/photo-1671513512964-a32f0334d266?w=600'),
        ('https://images.unsplash.com/photo-1671513511617-92a53b1e57fc?w=600', 'https://images.unsplash.com/photo-1671513582391-e0d478456fea?w=600'),
    ],
    'for-her': [
        ('https://images.unsplash.com/photo-1758995115560-59c10d6cc28f?w=600', 'https://images.unsplash.com/photo-1758995115867-4ef47c98824e?w=600'),
        ('https://images.unsplash.com/photo-1758995115643-1e8348bfde39?w=600', 'https://images.unsplash.com/photo-1758995115518-26f90aa61b97?w=600'),
    ],
    'for-him': [
        ('https://images.unsplash.com/photo-1628785517892-dbcd2f2719ed?w=600', 'https://images.unsplash.com/photo-1681091637777-7b5c49bf9691?w=600'),
    ],
    'personalized-gifts': [
        ('https://images.unsplash.com/photo-1593888165089-77f017e3bbfd?w=600', 'https://images.unsplash.com/photo-1600713715773-cae15017841a?w=600'),
        ('https://images.unsplash.com/photo-1635753755948-9e7b7b29432c?w=600', 'https://images.unsplash.com/photo-1725790580919-95f6b641999b?w=600'),
    ],
    'rings': [
        ('https://images.unsplash.com/photo-1721103427967-789d08779905?w=600', 'https://images.unsplash.com/photo-1721103418184-7fee9c713da3?w=600'),
    ],
}

# 30 Valentine Special & Personalized Products
PRODUCTS = [
    # Personalized Name Jewelry (Custom Name)
    {"name": "Custom Name Necklace - Gold Plated", "price": 1299, "original_price": 2499, "category": "for-her", "discount": 48, "allow_custom_image": False, "description": "Elegant gold-plated necklace with your loved one's name beautifully crafted. Perfect Valentine's gift!"},
    {"name": "Personalized Name Bracelet - Rose Gold", "price": 999, "original_price": 1899, "category": "for-her", "discount": 47, "allow_custom_image": False, "description": "Stunning rose gold bracelet personalized with any name. A romantic keepsake she'll treasure forever."},
    {"name": "Custom Couple Names Pendant", "price": 1599, "original_price": 2999, "category": "couples", "discount": 47, "allow_custom_image": False, "description": "Two hearts, two names, one pendant. Perfect for couples who want to carry each other's name close to heart."},
    {"name": "Personalized Name Ring - Sterling Silver", "price": 1199, "original_price": 2199, "category": "rings", "discount": 45, "allow_custom_image": False, "description": "Beautiful sterling silver ring engraved with your special name. A timeless gift of love."},
    {"name": "Custom Name Anklet - Gold Finish", "price": 799, "original_price": 1499, "category": "for-her", "discount": 47, "allow_custom_image": False, "description": "Delicate gold-finish anklet with custom name. Add a personal touch to every step she takes."},
    
    # Personalized Photo Jewelry (Custom Image + Name)
    {"name": "Photo Heart Locket Necklace", "price": 1499, "original_price": 2799, "category": "personalized-gifts", "discount": 46, "allow_custom_image": True, "description": "Keep your favorite memory close to your heart. Upload your photo and we'll craft it into this beautiful locket."},
    {"name": "Custom Photo Projection Bracelet", "price": 1799, "original_price": 3299, "category": "personalized-gifts", "discount": 45, "allow_custom_image": True, "description": "Magic bracelet that projects your photo when held to light! A secret love message only you two know."},
    {"name": "Personalized Photo Pendant - Circle", "price": 1299, "original_price": 2499, "category": "personalized-gifts", "discount": 48, "allow_custom_image": True, "description": "Your cherished photo beautifully embedded in a stunning circle pendant. Memories you can wear!"},
    {"name": "Custom Photo Envelope Necklace", "price": 1399, "original_price": 2599, "category": "personalized-gifts", "discount": 46, "allow_custom_image": True, "description": "A secret love letter pendant - open the tiny envelope to reveal your special photo inside!"},
    {"name": "Photo Music QR Code Keychain", "price": 899, "original_price": 1699, "category": "personalized-gifts", "discount": 47, "allow_custom_image": True, "description": "Scan to play 'your song'! Custom photo keychain with QR code linked to your special song."},
    
    # Valentine Special Couple Sets
    {"name": "Valentine Couple Bracelet Set - King & Queen", "price": 1699, "original_price": 3199, "category": "couples", "discount": 47, "allow_custom_image": False, "description": "Matching King & Queen bracelets for the royal couple. His & Hers set with magnetic heart clasp."},
    {"name": "Couple Heart Puzzle Pendant Set", "price": 1899, "original_price": 3499, "category": "couples", "discount": 46, "allow_custom_image": False, "description": "Two half hearts that complete each other - just like you two! Comes as a beautiful pair."},
    {"name": "Infinity Love Couple Ring Set", "price": 2199, "original_price": 3999, "category": "couples", "discount": 45, "allow_custom_image": False, "description": "Infinity symbol rings representing endless love. Matching set with 'Forever' engraving."},
    {"name": "Magnetic Heart Couple Necklace", "price": 1599, "original_price": 2999, "category": "couples", "discount": 47, "allow_custom_image": False, "description": "Two hearts that magnetically attract - just like your love! Beautiful symbolic jewelry."},
    {"name": "Valentine Lock & Key Pendant Set", "price": 1399, "original_price": 2599, "category": "couples", "discount": 46, "allow_custom_image": False, "description": "She has your heart (lock), you have the key. Romantic symbolism for true lovers."},
    
    # Romantic Gifts for Her
    {"name": "Rose Box Heart Necklace - Valentine Special", "price": 1999, "original_price": 3699, "category": "for-her", "discount": 46, "allow_custom_image": False, "description": "Real preserved rose in elegant box with stunning heart necklace. The ultimate Valentine's gift!"},
    {"name": "I Love You in 100 Languages Necklace", "price": 1299, "original_price": 2499, "category": "for-her", "discount": 48, "allow_custom_image": False, "description": "Projection pendant shows 'I Love You' in 100 languages! A message of love in every language."},
    {"name": "Birthstone Heart Pendant - Personalized", "price": 1199, "original_price": 2199, "category": "for-her", "discount": 45, "allow_custom_image": False, "description": "Heart pendant with her birthstone. Add her name for extra personalization!"},
    {"name": "Custom Date Roman Numeral Bracelet", "price": 999, "original_price": 1899, "category": "for-her", "discount": 47, "allow_custom_image": False, "description": "Your special date (anniversary, first date) engraved in elegant Roman numerals."},
    {"name": "Love Letter Envelope Locket", "price": 1099, "original_price": 1999, "category": "for-her", "discount": 45, "allow_custom_image": True, "description": "Tiny envelope locket with your photo and love message inside. Romantic and secretive!"},
    
    # Gifts for Him
    {"name": "Personalized Leather Bracelet - Men's", "price": 899, "original_price": 1699, "category": "for-him", "discount": 47, "allow_custom_image": False, "description": "Premium leather bracelet with custom name engraving. Masculine and meaningful."},
    {"name": "Custom Coordinates Bracelet - Black", "price": 999, "original_price": 1899, "category": "for-him", "discount": 47, "allow_custom_image": False, "description": "GPS coordinates of where you met/married engraved on sleek black bracelet."},
    {"name": "Photo Dog Tag Necklace - Men's", "price": 1199, "original_price": 2199, "category": "for-him", "discount": 45, "allow_custom_image": True, "description": "Military style dog tag with your photo and message. Rugged yet romantic."},
    {"name": "Personalized Wallet Card - Photo", "price": 499, "original_price": 999, "category": "for-him", "discount": 50, "allow_custom_image": True, "description": "Metal wallet card with your photo and love message. He'll carry you everywhere!"},
    
    # Valentine Special Edition
    {"name": "Valentine Red Rose Bracelet Set", "price": 1499, "original_price": 2799, "category": "couples", "discount": 46, "allow_custom_image": False, "description": "Limited Valentine Edition! Red rose charm bracelets for both of you. Symbol of eternal love."},
    {"name": "Heartbeat Sound Wave Necklace", "price": 1699, "original_price": 3199, "category": "personalized-gifts", "discount": 47, "allow_custom_image": True, "description": "Your actual heartbeat or voice saying 'I love you' engraved as sound wave. Truly unique!"},
    {"name": "Photo Moon Lamp - 3D Printed", "price": 1999, "original_price": 3699, "category": "personalized-gifts", "discount": 46, "allow_custom_image": True, "description": "Your photo printed on a 3D moon lamp! Touch to change colors. Magical bedroom decor."},
    {"name": "Custom Star Map - The Night We Met", "price": 1299, "original_price": 2499, "category": "personalized-gifts", "discount": 48, "allow_custom_image": False, "description": "Star constellation map of the exact night sky when you met. Printed on pendant."},
    {"name": "Fingerprint Heart Couple Rings", "price": 2499, "original_price": 4499, "category": "rings", "discount": 44, "allow_custom_image": True, "description": "Your actual fingerprints forming a heart on matching rings. The most personal gift ever!"},
    {"name": "Valentine Gift Hamper - Premium", "price": 2999, "original_price": 5499, "category": "personalized-gifts", "discount": 45, "allow_custom_image": True, "description": "Complete Valentine package: Photo frame, custom mug, chocolates, rose, and personalized card!"},
]

async def seed_admin():
    """Create admin user"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Delete old admin
    await db.users.delete_many({"email": "admin@test.com"})
    
    # Hash password
    password = "admin123"
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": "admin@test.com",
        "password_hash": hashed,
        "name": "Admin",
        "role": "admin",
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(admin_user)
    print("✅ Admin user created!")
    print("   Email: admin@test.com")
    print("   Password: admin123")

async def seed_products():
    """Seed all products"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing products
    await db.products.delete_many({})
    
    img_idx = {}
    for p in PRODUCTS:
        cat = p['category']
        if cat not in img_idx:
            img_idx[cat] = 0
        
        images = STOCK_IMAGES.get(cat, STOCK_IMAGES['personalized-gifts'])
        idx = img_idx[cat] % len(images)
        img_idx[cat] += 1
        
        product = {
            "id": str(uuid.uuid4()),
            "name": p['name'],
            "slug": slugify(p['name']),
            "price": p['price'],
            "original_price": p['original_price'],
            "category": p['category'],
            "description": p.get('description', f"Beautiful {p['name']} - Perfect gift for your loved ones"),
            "discount": p['discount'],
            "image": images[idx][0],
            "hover_image": images[idx][1],
            "is_featured": True,
            "is_active": True,
            "allow_custom_image": p.get('allow_custom_image', False),
            "stock_quantity": 100,
            "created_at": datetime.utcnow()
        }
        
        await db.products.insert_one(product)
        print(f"Added: {p['name']}")
    
    count = await db.products.count_documents({})
    print(f"\n✅ Total products added: {count}")

async def seed_settings():
    """Seed site settings"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    settings = {
        "id": "site_settings",
        "site_name": "Name Craft",
        "site_tagline": "India's most loved brand with over 1L+ orders delivered",
        "currency": "INR",
        "currency_symbol": "₹",
        "support_email": "support@namecraft.shop",
        "support_phone": "+91 9876543210",
        "whatsapp_number": "+91 9876543210",
        "updated_at": datetime.utcnow()
    }
    
    await db.settings.update_one(
        {"id": "site_settings"},
        {"$set": settings},
        upsert=True
    )
    print("✅ Site settings configured!")

async def main():
    print("=" * 50)
    print("Name Craft - Database Seeding")
    print("=" * 50)
    print(f"Database: {DB_NAME}")
    print(f"MongoDB: {MONGO_URL}")
    print("=" * 50)
    
    await seed_admin()
    print()
    await seed_products()
    print()
    await seed_settings()
    print()
    print("=" * 50)
    print("✅ All data seeded successfully!")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())
