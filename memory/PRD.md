# Name Craft - E-Commerce Platform PRD

## Original Problem Statement
Build a feature-complete replica of the website `thenamestrings.in` - an e-commerce SaaS application for personalized jewelry, rebranded to **Name Craft**.

## Core Requirements
- User registration/login with dashboard
- Order system with real-time tracking
- Payment checkout (Razorpay, Stripe, UPI, COD)
- Admin panel with analytics and full site management
- Automatic email/WhatsApp notifications

## Tech Stack
- **Frontend:** React + Tailwind CSS + Shadcn UI + react-razorpay
- **Backend:** FastAPI (Python) + razorpay SDK + httpx (WhatsApp API)
- **Database:** MongoDB

---

## What's Been Implemented

### Latest Updates (February 8, 2025)

#### FIXED: Product Page Bugs (P0/P1)
- [x] Metal options now only show for jewelry products (using `show_metal_options` flag)
- [x] Personalization label changed from "Personalize Your Jewelry" to generic "Enter Name for Personalization"
- [x] Helper text changed from "crafted on your jewelry" to "engraved on your product"
- [x] Photo upload text changed from "on your jewelry" to "on your product"
- [x] ProductCard shows "View & Customize" button instead of "Add to Cart" for customizable products
- [x] Toast notifications for validation (using sonner library)

### February 7, 2025

#### FIXED: Product Catalog Image Mismatch Issue (P0)
- [x] Completely redesigned product catalog with 34 products
- [x] Each product now has an image that accurately represents its name
- [x] All image URLs sourced from Unsplash with proper matching
- [x] Categories covered: For Her, For Him, Couples, Earrings, Rings, Personalized Gifts
- [x] Hover images also properly matched

#### Product Categories & Images Now Matching:
- **For Her**: Gold/Silver necklaces, bracelets, anklets - all showing actual jewelry
- **For Him**: Men's chains, leather bracelets, wallets - masculine styling
- **Couples**: Matching bracelet sets, couple rings - romantic imagery
- **Earrings**: Gold floral studs, traditional sets
- **Rings**: Designer rings, wedding ring sets, engraved rings
- **Personalized Gifts**: Photo lockets, Valentine rose boxes, keychains

#### Previously Fixed (February 7, 2025)
- [x] Fixed 36 products with broken images from CSV upload
- [x] Replaced hotlink-blocked URLs with Unsplash/Pexels stock photos
- [x] WhatsApp Business API integration
- [x] Refunds Management in admin panel
- [x] Dynamic Navigation from database

### Completed Features (January 2025)

#### Core E-commerce
- [x] Homepage with hero section, product carousels, category showcase
- [x] Product listing pages with filtering and sorting
- [x] Product detail pages with personalization options
- [x] Shopping cart with drawer UI (React Context + localStorage persistence)
- [x] Multi-step checkout page with guest and logged-in user flows
- [x] Category navigation (Women, Men, Kids, etc.)
- [x] Light blue (sky-500) color theme site-wide

#### Customer Authentication & Accounts
- [x] Customer registration (/api/auth/register)
- [x] Customer login (/api/auth/login)
- [x] JWT-based authentication with static secret
- [x] Customer account dashboard (/account)
- [x] Order history in account
- [x] Profile management

#### Payment Integrations
- [x] **Manual UPI Payment** - QR code generation, UTR submission, admin approval workflow
- [x] **Razorpay Payment Gateway** - Full integration with test keys
  - Backend: Order creation, signature verification
  - Frontend: Modal integration with Cards, Netbanking, Wallet, Pay Later options

#### Admin Panel
- [x] Admin login and authentication (/admin)
- [x] Dashboard overview with stats
- [x] Orders management with payment approval for manual UPI
- [x] **Full Product CRUD** - Add, edit, delete products from admin panel
- [x] Order status management with shipping notifications
- [x] Site settings management (branding, payment IDs, email, shipping)
- [x] Fixed sidebar layout with proper scrolling
- [x] Refunds management tab
- [x] Navigation management tab
- [x] WhatsApp settings configuration

#### Email & Notifications
- [x] Order confirmation emails (automatic on order creation)
- [x] Shipping notification emails (automatic when order status changed to "shipped")
- [x] WhatsApp notifications integration

#### Legal & Content
- [x] Privacy Policy page
- [x] Terms of Service page
- [x] Refund Policy page
- [x] Shipping Policy page
- [x] Contact page

---

## Current Status

### What's Working
- Complete customer shopping flow (browse -> cart -> checkout)
- Customer authentication and account management
- Manual UPI payment with admin approval
- Razorpay payment integration (fully tested)
- Admin panel with full CRUD (products, orders, settings)
- Email notifications (order confirmation, shipping updates)
- WhatsApp notifications backend
- **34 products with properly matched images**
- **Conditional metal options for jewelry only**
- **Generic personalization labels (works for all products)**
- **Shipping cost calculation fixed** - Now correctly uses database settings (₹29)

### Latest Fix (February 13, 2025)
- ✅ **Razorpay Shipping Bug FIXED** - Orders now correctly calculate shipping from database settings
- Verified: New orders use `shipping_cost: 29` from settings
- Old orders with ₹99 shipping were created before the fix was deployed

### Deployment Status
- **Preview environment**: All fixes verified and working
- **Live site (namecraft.shop)**: Previous deployment had caching issues - needs fresh deployment

### What Needs Configuration
- Razorpay live keys (for production)
- Stripe integration (optional future task)
- WhatsApp API credentials for production

---

## Prioritized Backlog

### P0 - Completed
- [x] Razorpay Payment Integration
- [x] Product catalog with matching images (FIXED Feb 7, 2025)

### P1 - Completed
- [x] Admin Panel Product CRUD
- [x] Email Notifications (Order & Shipping)
- [x] Branding Update (Name Craft)
- [x] WhatsApp Notifications
- [x] Refunds Management
- [x] Dynamic Navigation

### P2 - Future Enhancements
1. **Stripe Payment Integration** - Add as alternative payment gateway
2. **More product variety** - Expand catalog based on trending products
3. **Product reviews & ratings** - Customer feedback system

### P3 - Lower Priority
1. **Support Ticket System** - Customer support workflow
2. **Inventory Management** - Stock tracking per product
3. **Analytics Dashboard** - Sales and visitor analytics

### Refactoring Needed
- **backend/server.py** - Split into modules (2000+ lines currently)
- **CheckoutPage.jsx** - Break into smaller components
- **AdminPage.jsx** - Break into smaller components (1500+ lines)

---

## Code Architecture
```
/app/
├── backend/
│   ├── server.py         # Monolithic FastAPI app (needs refactoring)
│   ├── seed_data.py      # Database seeding script with 34 matched products
│   ├── requirements.txt
│   ├── tests/            # Pytest tests
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components (ui/, products/, etc.)
│   │   ├── context/      # CartContext, AuthContext
│   │   ├── data/mock.js  # Minimal mock data (fallback only)
│   │   ├── pages/        # All page components
│   │   ├── App.js        # Router config
│   │   └── index.css     # Global styles
│   └── package.json
├── memory/
│   └── PRD.md            # This file
└── test_reports/
    └── iteration_*.json  # Test reports
```

## Key API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| /health | GET | Kubernetes health check |
| /api/auth/register | POST | Customer registration |
| /api/auth/login | POST | Customer/Admin login |
| /api/auth/me | GET | Get current user |
| /api/products | GET | Get products with filters |
| /api/navigation | GET | Get dynamic navigation items |
| /api/admin/navigation | GET/POST/PUT/DELETE | Manage navigation |
| /api/admin/refunds | GET/POST/PUT/DELETE | Manage refunds |
| /api/admin/test-whatsapp | POST | Send test WhatsApp message |
| /api/payment/razorpay/config | GET | Get Razorpay public config |
| /api/payment/razorpay/create-order | POST | Create Razorpay order |
| /api/payment/razorpay/verify | POST | Verify Razorpay payment |
| /api/orders | POST | Create order |
| /api/orders/my-orders | GET | Get user's orders |
| /api/admin/settings | GET/PUT | Manage site settings |

## Test Credentials
- **Admin:** `admin@test.com` / `admin123`
- **Razorpay Test Keys:** Configured in database

---

## 3rd Party Integrations
- **Razorpay**: For processing payments (requires live keys for production)
- **WhatsApp Business API**: For order notifications (requires API credentials)
- **Unsplash**: Product image source

## Known Issues
- bcrypt warning in backend logs (version compatibility with passlib) - cosmetic only

## Notes
- Preview and Production environments use separate databases
- Razorpay keys need to be entered in each environment's admin panel
- Product images sourced from Unsplash for reliability
