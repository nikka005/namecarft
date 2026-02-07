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

# 30 Products
PRODUCTS = [
    {"name": "Oxidised Jhumka Earrings", "price": 599, "original_price": 999, "category": "earrings", "discount": 40},
    {"name": "Gold Finish Jhumka Combo (3)", "price": 1299, "original_price": 2499, "category": "earrings", "discount": 48},
    {"name": "Pearl Drop Jhumka", "price": 899, "original_price": 1699, "category": "earrings", "discount": 47},
    {"name": "Wedding Wear Jhumka", "price": 999, "original_price": 1899, "category": "earrings", "discount": 47},
    {"name": "Temple Jhumka Set", "price": 1199, "original_price": 2299, "category": "earrings", "discount": 48},
    {"name": "Kundan Jhumka Earrings", "price": 799, "original_price": 1499, "category": "earrings", "discount": 47},
    {"name": "Meenakari Jhumka", "price": 899, "original_price": 1699, "category": "earrings", "discount": 47},
    {"name": "Chandbali Earrings", "price": 1099, "original_price": 2099, "category": "earrings", "discount": 48},
    {"name": "Peacock Jhumka", "price": 999, "original_price": 1899, "category": "earrings", "discount": 47},
    {"name": "Antique Finish Jhumka", "price": 699, "original_price": 1299, "category": "earrings", "discount": 46},
    {"name": "Bridal Jhumka Set", "price": 1499, "original_price": 2899, "category": "earrings", "discount": 48},
    {"name": "Personalized Photo Envelope Necklace", "price": 1299, "original_price": 1999, "category": "personalized-gifts", "discount": 35, "allow_custom_image": True},
    {"name": "Personalized Eye Photo Necklace", "price": 1399, "original_price": 2199, "category": "personalized-gifts", "discount": 36, "allow_custom_image": True},
    {"name": "Custom Name Necklace Gold", "price": 1199, "original_price": 1899, "category": "for-her", "discount": 37, "allow_custom_image": True},
    {"name": "Photo Music Fridge Magnet", "price": 799, "original_price": 1299, "category": "personalized-gifts", "discount": 38, "allow_custom_image": True},
    {"name": "Couple Initials Bracelet Set", "price": 1599, "original_price": 2499, "category": "couples", "discount": 36},
    {"name": "Heart Photo Locket", "price": 1099, "original_price": 1799, "category": "personalized-gifts", "discount": 39, "allow_custom_image": True},
    {"name": "Infinity Love Necklace", "price": 1199, "original_price": 1899, "category": "for-her", "discount": 37},
    {"name": "Men Leather Bracelet", "price": 899, "original_price": 1499, "category": "for-him", "discount": 40},
    {"name": "Couple Ring Set", "price": 1899, "original_price": 2999, "category": "couples", "discount": 37},
    {"name": "Name Engraved Ring", "price": 999, "original_price": 1699, "category": "rings", "discount": 41},
    {"name": "Rose Gold Name Necklace", "price": 1299, "original_price": 1999, "category": "for-her", "discount": 35},
    {"name": "Couple Heart Pendant Set", "price": 1499, "original_price": 2399, "category": "couples", "discount": 37},
    {"name": "Silver Initial Ring", "price": 799, "original_price": 1299, "category": "rings", "discount": 38},
    {"name": "Birthstone Necklace", "price": 1399, "original_price": 2199, "category": "for-her", "discount": 36},
    {"name": "Couple Name Bracelet", "price": 1299, "original_price": 1999, "category": "couples", "discount": 35},
    {"name": "Custom Photo Keychain", "price": 499, "original_price": 799, "category": "personalized-gifts", "discount": 38, "allow_custom_image": True},
    {"name": "Pearl Pendant Necklace", "price": 1099, "original_price": 1799, "category": "for-her", "discount": 39},
    {"name": "Diamond Cut Name Necklace", "price": 1599, "original_price": 2499, "category": "for-her", "discount": 36},
    {"name": "Express Delivery Gift Box", "price": 299, "original_price": 499, "category": "personalized-gifts", "discount": 40},
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
            "description": f"Beautiful {p['name']} - Perfect gift for your loved ones",
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
