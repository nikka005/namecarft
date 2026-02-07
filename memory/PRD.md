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

### Latest Updates (February 7, 2025)

#### Fixed Broken Product Images
- [x] Fixed 36 products with broken images from CSV upload
- [x] Replaced hotlink-blocked URLs with Unsplash/Pexels stock photos
- [x] All collection pages now display images correctly

#### WhatsApp Notifications (NEW)
- [x] WhatsApp Business API integration
- [x] Order confirmation messages via WhatsApp
- [x] Shipping notification messages via WhatsApp
- [x] Admin toggle to enable/disable WhatsApp notifications
- [x] Test WhatsApp message functionality in admin

#### Refunds Management (NEW)
- [x] Admin Refunds tab with full CRUD operations
- [x] Create refund request for any order
- [x] Filter refunds by status (pending/approved/rejected/processed)
- [x] Approve/reject refund requests
- [x] Process refunds and update order status

#### Dynamic Navigation (NEW)
- [x] Navigation items now fetched from API (/api/navigation)
- [x] Admin Navigation tab to manage menu items
- [x] Add/edit/delete navigation items
- [x] Seed default navigation items
- [x] Toggle active/inactive status per item
- [x] Highlight flag for special menu items

### Completed Features (January 26, 2025)

#### Product Catalog (71 Products)
- [x] 71 products total with unique descriptions
- [x] AI-generated product images (5 hero images)
- [x] Stock photos from Unsplash/Pexels for catalog
- [x] Bulk CSV upload feature for products
- [x] Customer photo upload for eligible products
- [x] Categories: For Her, For Him, Couples, Earrings, Personalized, etc.
- [x] Homepage & Collections now fetch from API (not mock data)

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
- [x] **Razorpay Payment Gateway** - Full integration with test keys (Jan 26, 2025)
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

#### Email Notifications
- [x] Order confirmation emails (automatic on order creation)
- [x] Shipping notification emails (automatic when order status changed to "shipped")
- [x] SMTP configuration in admin panel (Gmail, custom SMTP)

#### Legal & Content
- [x] Privacy Policy page
- [x] Terms of Service page
- [x] Refund Policy page
- [x] Shipping Policy page
- [x] Contact page

#### Bug Fixes
- [x] Fixed category navigation buttons
- [x] Fixed admin login issues on custom domain
- [x] Fixed "Add to Cart" functionality
- [x] Fixed order creation server error (ObjectId serialization)
- [x] Fixed UPI ID not updating from admin settings
- [x] Fixed auto-logout (static JWT_SECRET)
- [x] Fixed react-razorpay hook import issue (v3.0.1 API change)
- [x] Added /health endpoint for deployment
- [x] Replaced all "namestrings" branding with "Name Craft"

---

## Current Status

### What's Working ✅
- Complete customer shopping flow (browse → cart → checkout)
- Customer authentication and account management
- Manual UPI payment with admin approval
- **Razorpay payment integration (fully tested)**
- Admin panel with full CRUD (products, orders, settings)
- **Email notifications** (order confirmation, shipping updates)
- Product browsing and cart functionality
- 35 original products with AI-generated images

### What Needs Configuration
- Razorpay live keys (for production)
- Stripe integration (next task)

---

## Prioritized Backlog

### P0 - Completed ✅
- ~~Razorpay Payment Integration~~
- ~~35 Original Products with AI Images~~

### P1 - Completed ✅
- ~~Admin Panel Product CRUD~~
- ~~Email Notifications (Order & Shipping)~~
- ~~Branding Update (Name Craft)~~

### P2 - High Priority (Next)
1. **Stripe Payment Integration** - Add as alternative payment gateway

### P3 - Lower Priority
5. **Support Ticket System** - Customer support workflow
6. **Inventory Management** - Stock tracking per product

### ✅ Completed P2/P3 Tasks
- ✅ **WhatsApp Notifications** - Order updates via WhatsApp Business API (Feb 7, 2025)
- ✅ **User Management** - Block/activate users from admin (Customers tab)
- ✅ **Coupon Management** - Full coupon system in admin (Coupons tab)
- ✅ **Refund Processing** - Refunds management in admin (Feb 7, 2025)
- ✅ **Dynamic Navigation** - Navigation managed from admin (Feb 7, 2025)

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

## Known Issues
- bcrypt warning in backend logs (version compatibility with passlib) - cosmetic only

## Notes
- Preview and Production environments use separate databases
- Razorpay keys need to be entered in each environment's admin panel
