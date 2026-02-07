"""
Script to fix broken product images by replacing external URLs with working stock photos
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import random

# Stock photos organized by category
STOCK_IMAGES = {
    'necklaces': [
        'https://images.unsplash.com/photo-1755151606128-7ca2f97e46ae?w=600',
        'https://images.unsplash.com/photo-1758995115560-59c10d6cc28f?w=600',
        'https://images.unsplash.com/photo-1758995115857-2de1eb6283d0?w=600',
        'https://images.unsplash.com/photo-1767921482419-d2d255b5b700?w=600',
        'https://images.unsplash.com/photo-1566848044119-669133b5eb9a?w=600',
        'https://images.unsplash.com/photo-1643940527751-c28c9c183ddb?w=600',
        'https://images.unsplash.com/photo-1632212782195-4dad1dc3144c?w=600',
        'https://images.unsplash.com/photo-1758505992430-3f75fe1021ce?w=600',
        'https://images.pexels.com/photos/4550854/pexels-photo-4550854.jpeg?w=600',
        'https://images.pexels.com/photos/3674231/pexels-photo-3674231.jpeg?w=600',
    ],
    'earrings': [
        'https://images.unsplash.com/photo-1714733831162-0a6e849141be?w=600',
        'https://images.unsplash.com/photo-1762686130435-897de4b26aac?w=600',
        'https://images.unsplash.com/photo-1767971958465-16d986fad8df?w=600',
        'https://images.unsplash.com/photo-1597055952513-4e9bce9345c3?w=600',
        'https://images.pexels.com/photos/7309458/pexels-photo-7309458.jpeg?w=600',
    ],
    'bracelets': [
        'https://images.unsplash.com/photo-1721103418981-0ee59b80592e?w=600',
        'https://images.unsplash.com/photo-1623238197787-07239a76156f?w=600',
        'https://images.unsplash.com/photo-1758368406239-4702a73f3705?w=600',
        'https://images.unsplash.com/photo-1761331454826-a7b4ffd54398?w=600',
        'https://images.pexels.com/photos/3634366/pexels-photo-3634366.jpeg?w=600',
        'https://images.pexels.com/photos/3070012/pexels-photo-3070012.jpeg?w=600',
    ],
    'rings': [
        'https://images.unsplash.com/photo-1769038936714-0c0ac933c379?w=600',
        'https://images.unsplash.com/photo-1667210205546-8b21c276a3fe?w=600',
        'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=600',
        'https://images.pexels.com/photos/121848/pexels-photo-121848.jpeg?w=600',
    ],
    'gifts': [
        'https://images.unsplash.com/photo-1528797664208-e5a8c0b98881?w=600',
        'https://images.unsplash.com/photo-1582803112160-1e4418e285a1?w=600',
        'https://images.unsplash.com/photo-1761110518837-689557b142bf?w=600',
        'https://images.unsplash.com/photo-1621274999488-c05dbc5a0f64?w=600',
        'https://images.pexels.com/photos/34399065/pexels-photo-34399065.jpeg?w=600',
    ],
    'default': [
        'https://images.pexels.com/photos/4550854/pexels-photo-4550854.jpeg?w=600',
        'https://images.pexels.com/photos/3674231/pexels-photo-3674231.jpeg?w=600',
        'https://images.pexels.com/photos/13924051/pexels-photo-13924051.jpeg?w=600',
        'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600',
        'https://images.unsplash.com/photo-1600862754152-80a263dd564f?w=600',
    ]
}

def get_image_category(product_name: str, category: str) -> str:
    """Determine the best image category based on product name and category"""
    name_lower = product_name.lower()
    
    if any(x in name_lower for x in ['earring', 'jhumka', 'stud']):
        return 'earrings'
    elif any(x in name_lower for x in ['bracelet', 'bangle']):
        return 'bracelets'
    elif any(x in name_lower for x in ['ring']):
        return 'rings'
    elif any(x in name_lower for x in ['necklace', 'pendant', 'chain', 'locket']):
        return 'necklaces'
    elif any(x in name_lower for x in ['box', 'hamper', 'plaque', 'keychain', 'magnet', 'frame']):
        return 'gifts'
    elif category == 'earrings':
        return 'earrings'
    elif category == 'rings':
        return 'rings'
    else:
        return 'default'

def is_broken_url(url: str) -> bool:
    """Check if URL is from a known blocked source"""
    blocked_domains = [
        'xctasy.co', 'glomo.in', 'fubs.in', 'example.com', 
        'placeholder', 'via.placeholder'
    ]
    if not url:
        return True
    return any(domain in url.lower() for domain in blocked_domains)

async def fix_images():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['test_database']
    
    # Get all products
    products = await db.products.find({}, {'_id': 0}).to_list(200)
    
    fixed_count = 0
    image_index = {}  # Track which images we've used to avoid duplicates
    
    for product in products:
        image = product.get('image', '')
        hover_image = product.get('hover_image', '')
        name = product.get('name', '')
        category = product.get('category', '')
        product_id = product.get('id', '')
        
        # Check if images are broken
        if is_broken_url(image) or is_broken_url(hover_image):
            # Determine the best image category
            img_category = get_image_category(name, category)
            available_images = STOCK_IMAGES.get(img_category, STOCK_IMAGES['default'])
            
            # Get an index to rotate through images
            if img_category not in image_index:
                image_index[img_category] = 0
            
            idx = image_index[img_category] % len(available_images)
            new_image = available_images[idx]
            
            # Use next image for hover
            hover_idx = (idx + 1) % len(available_images)
            new_hover = available_images[hover_idx]
            
            image_index[img_category] += 1
            
            # Update the product
            update_data = {
                'image': new_image,
                'hover_image': new_hover
            }
            
            await db.products.update_one(
                {'id': product_id},
                {'$set': update_data}
            )
            
            print(f"Fixed: {name}")
            print(f"  Old: {image[:50]}...")
            print(f"  New: {new_image}")
            fixed_count += 1
    
    print(f"\n✅ Fixed {fixed_count} products with broken images")

if __name__ == '__main__':
    asyncio.run(fix_images())
