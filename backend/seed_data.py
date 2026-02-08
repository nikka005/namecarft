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

# Products with PROPERLY MATCHED images - each image accurately represents the product
# show_metal_options: True for jewelry that comes in different metals (Gold, Silver, Rose Gold)
# allow_custom_image: True for products that need photo upload
PRODUCTS = [
    # === FOR HER - Necklaces ===
    {
        "name": "Gold Heart Pendant Necklace",
        "price": 1299,
        "original_price": 2499,
        "category": "for-her",
        "discount": 48,
        "allow_custom_image": False,
        "show_metal_options": True,
        "description": "Elegant gold heart pendant necklace with charm beads. A timeless symbol of love.",
        "image": "https://images.unsplash.com/photo-1761210875101-1273b9ae5600?w=600",
        "hover_image": "https://images.unsplash.com/photo-1709324275524-bc6a283e53a3?w=600"
    },
    {
        "name": "Silver Heart Chain Necklace",
        "price": 999,
        "original_price": 1899,
        "category": "for-her",
        "discount": 47,
        "allow_custom_image": False,
        "show_metal_options": True,
        "description": "Beautiful silver heart pendant on delicate chain. Perfect everyday elegance.",
        "image": "https://images.unsplash.com/photo-1553301444-7669742d4e2d?w=600",
        "hover_image": "https://images.unsplash.com/photo-1676329947145-99145926d3eb?w=600"
    },
    {
        "name": "Diamond Heart Gold Necklace",
        "price": 1799,
        "original_price": 3299,
        "category": "for-her",
        "discount": 45,
        "allow_custom_image": False,
        "show_metal_options": True,
        "description": "Stunning gold necklace with diamond-studded heart pendant. Luxury meets romance.",
        "image": "https://images.unsplash.com/photo-1709324275524-bc6a283e53a3?w=600",
        "hover_image": "https://images.unsplash.com/photo-1553301444-7669742d4e2d?w=600"
    },
    {
        "name": "Gold Beaded Necklace Set",
        "price": 2199,
        "original_price": 3999,
        "category": "for-her",
        "discount": 45,
        "allow_custom_image": False,
        "description": "Traditional gold necklace set with intricate bead details. Perfect for special occasions.",
        "image": "https://images.unsplash.com/photo-1758995115518-26f90aa61b97?w=600",
        "hover_image": "https://images.unsplash.com/photo-1758995115867-4ef47c98824e?w=600"
    },
    {
        "name": "Elegant Gold Chain Necklace",
        "price": 1599,
        "original_price": 2999,
        "category": "for-her",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Classic gold chain necklace for everyday elegance. Minimalist and versatile.",
        "image": "https://images.unsplash.com/photo-1703034390153-7d1d72111e8a?w=600",
        "hover_image": "https://images.unsplash.com/photo-1601121141499-17ae80afc03a?w=600"
    },

    # === FOR HER - Bracelets ===
    {
        "name": "Rose Gold Elegant Bracelet",
        "price": 999,
        "original_price": 1899,
        "category": "for-her",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Stunning rose gold bracelet with elegant clasp design. Perfect gift for her.",
        "image": "https://images.unsplash.com/photo-1721034909472-390b9325f415?w=600",
        "hover_image": "https://images.unsplash.com/photo-1723522938816-9c57a8c8ce61?w=600"
    },
    {
        "name": "Gold Crown Ring Bracelet",
        "price": 1199,
        "original_price": 2199,
        "category": "for-her",
        "discount": 45,
        "allow_custom_image": False,
        "description": "Unique gold ring bracelet with crown design. Statement piece for confident women.",
        "image": "https://images.unsplash.com/photo-1727784635908-6170c6681448?w=600",
        "hover_image": "https://images.unsplash.com/photo-1728647771933-9946a13e29f6?w=600"
    },

    # === FOR HER - Anklets ===
    {
        "name": "Silver Crystal Anklet",
        "price": 699,
        "original_price": 1299,
        "category": "for-her",
        "discount": 46,
        "allow_custom_image": False,
        "description": "Delicate silver anklet with sparkling crystals. Add elegance to every step.",
        "image": "https://images.unsplash.com/photo-1649629225720-6d24e20e0860?w=600",
        "hover_image": "https://images.unsplash.com/photo-1651047532215-a9dfed5d2cef?w=600"
    },
    {
        "name": "Gold Chain Anklet",
        "price": 799,
        "original_price": 1499,
        "category": "for-her",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Beautiful gold chain anklet for a touch of luxury. Beach-ready elegance.",
        "image": "https://images.unsplash.com/photo-1585711715631-1e6bf224f092?w=600",
        "hover_image": "https://images.unsplash.com/photo-1649629225720-6d24e20e0860?w=600"
    },

    # === FOR HER - Earrings ===
    {
        "name": "Gold Floral Stud Earrings",
        "price": 899,
        "original_price": 1699,
        "category": "earrings",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Elegant gold stud earrings with beautiful floral design. Perfect for daily wear.",
        "image": "https://images.unsplash.com/photo-1761479267943-2c984254807c?w=600",
        "hover_image": "https://images.unsplash.com/photo-1761479275494-9e2f5030b413?w=600"
    },
    {
        "name": "Traditional Gold Earrings Set",
        "price": 1499,
        "original_price": 2799,
        "category": "earrings",
        "discount": 46,
        "allow_custom_image": False,
        "description": "Stunning traditional gold necklace and earrings set. Perfect for weddings.",
        "image": "https://images.unsplash.com/photo-1758995115857-2de1eb6283d0?w=600",
        "hover_image": "https://images.unsplash.com/photo-1758995115867-4ef47c98824e?w=600"
    },

    # === FOR HIM ===
    {
        "name": "Men's Silver Chain Necklace",
        "price": 1099,
        "original_price": 1999,
        "category": "for-him",
        "discount": 45,
        "allow_custom_image": False,
        "description": "Bold silver chain necklace for men. Stylish and masculine design.",
        "image": "https://images.unsplash.com/photo-1679973296637-1411c1d25c7e?w=600",
        "hover_image": "https://images.unsplash.com/photo-1680068099053-81f58fff58a1?w=600"
    },
    {
        "name": "Men's Layered Chain Necklace",
        "price": 1299,
        "original_price": 2399,
        "category": "for-him",
        "discount": 46,
        "allow_custom_image": False,
        "description": "Trendy layered silver chain necklace. Modern style for confident men.",
        "image": "https://images.unsplash.com/photo-1680068099053-81f58fff58a1?w=600",
        "hover_image": "https://images.unsplash.com/photo-1679973296637-1411c1d25c7e?w=600"
    },
    {
        "name": "Men's Snake Pendant Necklace",
        "price": 1399,
        "original_price": 2599,
        "category": "for-him",
        "discount": 46,
        "allow_custom_image": False,
        "description": "Unique snake pendant silver necklace. Bold statement piece for men.",
        "image": "https://images.unsplash.com/photo-1679973296648-25537bd1217c?w=600",
        "hover_image": "https://images.unsplash.com/photo-1680068099356-9e158b86e687?w=600"
    },
    {
        "name": "Men's Silver Studded Bracelet",
        "price": 999,
        "original_price": 1899,
        "category": "for-him",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Premium silver studded bracelet for men. Masculine and elegant.",
        "image": "https://images.unsplash.com/photo-1628785517892-dbcd2f2719ed?w=600",
        "hover_image": "https://images.unsplash.com/photo-1640551855927-78d8ce33c586?w=600"
    },
    {
        "name": "Leather Brown Bracelet Men",
        "price": 799,
        "original_price": 1499,
        "category": "for-him",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Classic brown leather bracelet with gold accents. Timeless masculine style.",
        "image": "https://images.unsplash.com/photo-1704536917568-af87f9a87312?w=600",
        "hover_image": "https://images.unsplash.com/photo-1640551855927-78d8ce33c586?w=600"
    },
    {
        "name": "Black Leather Multi-Bracelet Set",
        "price": 899,
        "original_price": 1699,
        "category": "for-him",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Stylish black leather bracelet set with anchor charm. Nautical elegance.",
        "image": "https://images.unsplash.com/photo-1640551855927-78d8ce33c586?w=600",
        "hover_image": "https://images.unsplash.com/photo-1704536917568-af87f9a87312?w=600"
    },

    # === COUPLES ===
    {
        "name": "Couple Matching Bracelet Set",
        "price": 1699,
        "original_price": 3199,
        "category": "couples",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Beautiful matching bracelet set for couples. Symbol of your bond.",
        "image": "https://images.unsplash.com/photo-1681091670739-8bd1e759e1ab?w=600",
        "hover_image": "https://images.unsplash.com/photo-1648749903131-eddb569e1283?w=600"
    },
    {
        "name": "Couple Holding Hands Bracelet",
        "price": 1499,
        "original_price": 2799,
        "category": "couples",
        "discount": 46,
        "allow_custom_image": False,
        "description": "Romantic bracelet set perfect for hand-holding moments. Show your love.",
        "image": "https://images.unsplash.com/photo-1648749903131-eddb569e1283?w=600",
        "hover_image": "https://images.unsplash.com/photo-1517037126752-acf49bfda61a?w=600"
    },
    {
        "name": "Colorful Couple Ring Set",
        "price": 1899,
        "original_price": 3499,
        "category": "couples",
        "discount": 46,
        "allow_custom_image": False,
        "description": "Vibrant colorful ring set for couples. Express your unique love story.",
        "image": "https://images.unsplash.com/photo-1671513511617-92a53b1e57fc?w=600",
        "hover_image": "https://images.unsplash.com/photo-1671513582391-e0d478456fea?w=600"
    },

    # === RINGS ===
    {
        "name": "Gold Designer Ring Set",
        "price": 1599,
        "original_price": 2999,
        "category": "rings",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Elegant gold ring set with unique open design. Modern and stylish.",
        "image": "https://images.unsplash.com/photo-1708221269460-fc630272e54d?w=600",
        "hover_image": "https://images.unsplash.com/photo-1708221269786-7cafa3332970?w=600"
    },
    {
        "name": "Vintage Engraved Ring",
        "price": 1199,
        "original_price": 2199,
        "category": "rings",
        "discount": 45,
        "allow_custom_image": False,
        "description": "Beautiful vintage style ring with detailed engravings. Timeless elegance.",
        "image": "https://images.unsplash.com/photo-1670954951623-82ad4881d0ed?w=600",
        "hover_image": "https://images.unsplash.com/photo-1677913811386-2c80c3032f92?w=600"
    },
    {
        "name": "Silver Wedding Ring Set",
        "price": 2199,
        "original_price": 3999,
        "category": "rings",
        "discount": 45,
        "allow_custom_image": False,
        "description": "Elegant silver wedding ring set on wooden box. Perfect for your special day.",
        "image": "https://images.unsplash.com/photo-1677913811386-2c80c3032f92?w=600",
        "hover_image": "https://images.unsplash.com/photo-1708221269460-fc630272e54d?w=600"
    },

    # === PERSONALIZED GIFTS - Photo Jewelry ===
    {
        "name": "Photo Locket Necklace",
        "price": 1499,
        "original_price": 2799,
        "category": "personalized-gifts",
        "discount": 46,
        "allow_custom_image": True,
        "description": "Beautiful photo locket necklace to keep your memories close. Upload your photo!",
        "image": "https://images.unsplash.com/photo-1708370151739-2a7484f3b01f?w=600",
        "hover_image": "https://images.unsplash.com/photo-1718698028514-7b5029017de5?w=600"
    },
    {
        "name": "Photo Memory Pendant",
        "price": 1299,
        "original_price": 2499,
        "category": "personalized-gifts",
        "discount": 48,
        "allow_custom_image": True,
        "description": "Keep your favorite memories in this beautiful pendant. Perfect personalized gift!",
        "image": "https://images.unsplash.com/photo-1718698028514-7b5029017de5?w=600",
        "hover_image": "https://images.unsplash.com/photo-1643940527751-c28c9c183ddb?w=600"
    },
    {
        "name": "Photo Collage Necklace",
        "price": 1699,
        "original_price": 3199,
        "category": "personalized-gifts",
        "discount": 47,
        "allow_custom_image": True,
        "description": "Stunning necklace with multiple photo pendants. Carry all your memories!",
        "image": "https://images.unsplash.com/photo-1758505992430-3f75fe1021ce?w=600",
        "hover_image": "https://images.unsplash.com/photo-1708370151739-2a7484f3b01f?w=600"
    },

    # === VALENTINE SPECIAL ===
    {
        "name": "Valentine Rose Box with Necklace",
        "price": 1999,
        "original_price": 3699,
        "category": "personalized-gifts",
        "discount": 46,
        "allow_custom_image": False,
        "description": "Stunning red rose box with heart necklace. The ultimate Valentine's gift!",
        "image": "https://images.unsplash.com/photo-1701685809731-40194912cc2b?w=600",
        "hover_image": "https://images.unsplash.com/photo-1581264692636-3cf6f29655c2?w=600"
    },
    {
        "name": "Heart Necklace Gift Box",
        "price": 1599,
        "original_price": 2999,
        "category": "personalized-gifts",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Beautiful heart-shaped necklace in elegant gift box. Perfect surprise!",
        "image": "https://images.unsplash.com/photo-1769805222409-b493ba61703b?w=600",
        "hover_image": "https://images.unsplash.com/photo-1701685809731-40194912cc2b?w=600"
    },
    {
        "name": "Red Rose Bouquet Gift",
        "price": 1299,
        "original_price": 2499,
        "category": "personalized-gifts",
        "discount": 48,
        "allow_custom_image": False,
        "description": "Romantic red roses in white vase. Classic symbol of love and affection.",
        "image": "https://images.unsplash.com/photo-1581264692636-3cf6f29655c2?w=600",
        "hover_image": "https://images.unsplash.com/photo-1769805222409-b493ba61703b?w=600"
    },

    # === KEYCHAINS & WALLET CARDS ===
    {
        "name": "Custom Keychain Gift",
        "price": 599,
        "original_price": 1199,
        "category": "personalized-gifts",
        "discount": 50,
        "allow_custom_image": True,
        "description": "Personalized keychain - perfect little gift to show you care!",
        "image": "https://images.unsplash.com/photo-1640611024947-15f8066424c0?w=600",
        "hover_image": "https://images.unsplash.com/photo-1622124554445-017d74b9ed84?w=600"
    },
    {
        "name": "Premium Leather Wallet",
        "price": 1499,
        "original_price": 2799,
        "category": "for-him",
        "discount": 46,
        "allow_custom_image": False,
        "description": "High-quality leather wallet for the modern gentleman. Practical luxury.",
        "image": "https://images.unsplash.com/photo-1585401586477-2a671e1cae4e?w=600",
        "hover_image": "https://images.unsplash.com/photo-1689844833510-10939e60e8dc?w=600"
    },
    {
        "name": "Card Holder Wallet",
        "price": 899,
        "original_price": 1699,
        "category": "for-him",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Sleek card holder wallet for minimalists. Compact and stylish.",
        "image": "https://images.unsplash.com/photo-1662261896014-f8bcd9d38e65?w=600",
        "hover_image": "https://images.unsplash.com/photo-1678554832890-2ea5d37278af?w=600"
    },

    # === ADDITIONAL NECKLACES ===
    {
        "name": "Dainty Silver Heart Necklace",
        "price": 799,
        "original_price": 1499,
        "category": "for-her",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Minimalist silver heart necklace on delicate chain. Everyday elegance.",
        "image": "https://images.unsplash.com/photo-1676329947145-99145926d3eb?w=600",
        "hover_image": "https://images.unsplash.com/photo-1553301444-7669742d4e2d?w=600"
    },
    {
        "name": "Classic Gold Pendant Necklace",
        "price": 1399,
        "original_price": 2599,
        "category": "for-her",
        "discount": 46,
        "allow_custom_image": False,
        "description": "Beautiful classic gold pendant necklace. Timeless and sophisticated.",
        "image": "https://images.unsplash.com/photo-1601121141499-17ae80afc03a?w=600",
        "hover_image": "https://images.unsplash.com/photo-1758995115518-26f90aa61b97?w=600"
    },

    # === NEW TRENDING PRODUCTS ===
    
    # Custom Name Necklaces - BESTSELLER
    {
        "name": "Custom Name Necklace Gold",
        "price": 1499,
        "original_price": 2799,
        "category": "personalized-gifts",
        "discount": 46,
        "allow_custom_image": False,
        "description": "Personalized gold name necklace with your name beautifully crafted. Our bestselling product!",
        "image": "https://images.unsplash.com/photo-1742745063996-8d74bacb8a9e?w=600",
        "hover_image": "https://images.unsplash.com/photo-1766690847140-874d0c97314f?w=600"
    },
    {
        "name": "Diamond Name Pendant Silver",
        "price": 1799,
        "original_price": 3299,
        "category": "personalized-gifts",
        "discount": 45,
        "allow_custom_image": False,
        "description": "Stunning silver name pendant with sparkling diamond accents. Premium personalized jewelry.",
        "image": "https://images.unsplash.com/photo-1766690847140-874d0c97314f?w=600",
        "hover_image": "https://images.unsplash.com/photo-1742745063996-8d74bacb8a9e?w=600"
    },
    
    # Initial Letter Necklaces - TRENDING
    {
        "name": "Initial Letter Pendant Gold",
        "price": 999,
        "original_price": 1899,
        "category": "for-her",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Elegant gold initial pendant necklace. Choose your letter for a personal touch!",
        "image": "https://images.unsplash.com/photo-1758995115543-983c55f98a33?w=600",
        "hover_image": "https://images.unsplash.com/photo-1733761013921-89d19f4a2194?w=600"
    },
    {
        "name": "Heart Initial Necklace Rose Gold",
        "price": 1199,
        "original_price": 2199,
        "category": "for-her",
        "discount": 45,
        "allow_custom_image": False,
        "description": "Beautiful heart-shaped initial pendant in rose gold. Perfect gift for her!",
        "image": "https://images.pexels.com/photos/29193429/pexels-photo-29193429.jpeg?w=600",
        "hover_image": "https://images.pexels.com/photos/12428346/pexels-photo-12428346.jpeg?w=600"
    },
    
    # Evil Eye Collection - HOT SELLER
    {
        "name": "Evil Eye Protection Bracelet",
        "price": 799,
        "original_price": 1499,
        "category": "for-her",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Traditional evil eye bracelet for protection and good luck. Colorful and meaningful.",
        "image": "https://images.unsplash.com/photo-1649701954681-677a067a472b?w=600",
        "hover_image": "https://images.unsplash.com/photo-1649701954669-aa35811b62d3?w=600"
    },
    {
        "name": "Evil Eye Pendant Necklace Blue",
        "price": 899,
        "original_price": 1699,
        "category": "for-her",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Beautiful blue evil eye pendant necklace. Ward off negativity in style!",
        "image": "https://images.unsplash.com/photo-1652536160742-9f46c4a1a838?w=600",
        "hover_image": "https://images.unsplash.com/photo-1647638162212-51180c35deae?w=600"
    },
    
    # Birthstone & Gemstone Collection
    {
        "name": "Birthstone Crystal Necklace",
        "price": 1299,
        "original_price": 2499,
        "category": "for-her",
        "discount": 48,
        "allow_custom_image": False,
        "description": "Beautiful birthstone necklace with colorful gemstones. Choose your birth month!",
        "image": "https://images.unsplash.com/photo-1663170794635-33af4a2d5af8?w=600",
        "hover_image": "https://images.unsplash.com/photo-1682364853135-0840844c3cc5?w=600"
    },
    {
        "name": "Rainbow Gemstone Pendant",
        "price": 1599,
        "original_price": 2999,
        "category": "for-her",
        "discount": 47,
        "allow_custom_image": False,
        "description": "Stunning rainbow pendant with multicolored gemstones. A true statement piece!",
        "image": "https://images.unsplash.com/photo-1751277403754-283784113a64?w=600",
        "hover_image": "https://images.unsplash.com/photo-1663170794635-33af4a2d5af8?w=600"
    },
    
    # Pearl Collection - ELEGANT
    {
        "name": "Classic Pearl Necklace",
        "price": 1899,
        "original_price": 3499,
        "category": "for-her",
        "discount": 46,
        "allow_custom_image": False,
        "description": "Timeless white pearl necklace. Elegant sophistication for any occasion.",
        "image": "https://images.unsplash.com/photo-1654699991520-aaaf4dd2608b?w=600",
        "hover_image": "https://images.unsplash.com/photo-1742029560234-bd22dc2bfe8b?w=600"
    },
    {
        "name": "Pink Pearl Set with Earrings",
        "price": 2199,
        "original_price": 3999,
        "category": "for-her",
        "discount": 45,
        "allow_custom_image": False,
        "description": "Beautiful pink pearl necklace and earrings set. Perfect for weddings and parties!",
        "image": "https://images.unsplash.com/photo-1654699991494-892326ee8171?w=600",
        "hover_image": "https://images.unsplash.com/photo-1654699991520-aaaf4dd2608b?w=600"
    },
    
    # Diamond & Crystal Collection
    {
        "name": "Diamond Tennis Bracelet",
        "price": 2499,
        "original_price": 4499,
        "category": "for-her",
        "discount": 44,
        "allow_custom_image": False,
        "description": "Stunning diamond tennis bracelet. Sparkle and shine with every movement!",
        "image": "https://images.unsplash.com/photo-1639065643006-e217c4fee12e?w=600",
        "hover_image": "https://images.unsplash.com/photo-1570943991418-ffa08d952b16?w=600"
    },
    
    # Butterfly Collection - TRENDY
    {
        "name": "Crystal Butterfly Brooch",
        "price": 1099,
        "original_price": 1999,
        "category": "for-her",
        "discount": 45,
        "allow_custom_image": False,
        "description": "Exquisite crystal butterfly brooch. Add elegance to any outfit!",
        "image": "https://images.unsplash.com/photo-1693834084392-fa61a52a81c0?w=600",
        "hover_image": "https://images.unsplash.com/photo-1720128437790-d2b069b67684?w=600"
    },
    {
        "name": "Bow Pearl Necklace",
        "price": 1399,
        "original_price": 2599,
        "category": "for-her",
        "discount": 46,
        "allow_custom_image": False,
        "description": "Delicate pearl necklace with gold bow charm. Feminine and romantic!",
        "image": "https://images.unsplash.com/photo-1720128437790-d2b069b67684?w=600",
        "hover_image": "https://images.unsplash.com/photo-1693834084392-fa61a52a81c0?w=600"
    },
    
    # Celestial Collection
    {
        "name": "Moon Star Celestial Necklace",
        "price": 1199,
        "original_price": 2199,
        "category": "for-her",
        "discount": 45,
        "allow_custom_image": False,
        "description": "Beautiful celestial necklace with moon and star charms. Dreamy and romantic!",
        "image": "https://images.pexels.com/photos/5386593/pexels-photo-5386593.jpeg?w=600",
        "hover_image": "https://images.pexels.com/photos/9482095/pexels-photo-9482095.jpeg?w=600"
    },
    
    # Projection Bracelet - UNIQUE
    {
        "name": "Photo Projection Bracelet",
        "price": 1699,
        "original_price": 3199,
        "category": "personalized-gifts",
        "discount": 47,
        "allow_custom_image": True,
        "description": "Magic bracelet that projects your photo when held to light! A secret love message.",
        "image": "https://images.unsplash.com/photo-1679499774680-a6e5c947e805?w=600",
        "hover_image": "https://images.unsplash.com/photo-1708221382764-299d9e3ad257?w=600"
    },
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
    print("Admin user created!")
    print("   Email: admin@test.com")
    print("   Password: admin123")

async def seed_products():
    """Seed all products with properly matched images"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing products
    await db.products.delete_many({})
    
    for p in PRODUCTS:
        product = {
            "id": str(uuid.uuid4()),
            "name": p['name'],
            "slug": slugify(p['name']),
            "price": p['price'],
            "original_price": p['original_price'],
            "category": p['category'],
            "description": p['description'],
            "discount": p['discount'],
            "image": p['image'],
            "hover_image": p['hover_image'],
            "is_featured": True,
            "is_active": True,
            "allow_custom_image": p.get('allow_custom_image', False),
            "stock_quantity": 100,
            "created_at": datetime.utcnow()
        }
        
        await db.products.insert_one(product)
        print(f"Added: {p['name']}")
    
    count = await db.products.count_documents({})
    print(f"\nTotal products added: {count}")

async def seed_settings():
    """Seed site settings"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    settings = {
        "id": "site_settings",
        "site_name": "Name Craft",
        "site_tagline": "India's most loved brand with over 1L+ orders delivered",
        "currency": "INR",
        "currency_symbol": "Rs",
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
    print("Site settings configured!")

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
    print("All data seeded successfully!")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())
