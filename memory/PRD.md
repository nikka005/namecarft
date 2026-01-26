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
- **Backend:** FastAPI (Python) + razorpay SDK
- **Database:** MongoDB

---

## What's Been Implemented

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
- [x] Dashboard overview
- [x] Orders management with payment approval for manual UPI
- [x] Site settings management (branding, payment IDs)
- [x] Fixed sidebar layout with proper scrolling

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

---

## Current Status

### What's Working ✅
- Complete customer shopping flow (browse → cart → checkout)
- Customer authentication and account management
- Manual UPI payment with admin approval
- **Razorpay payment integration (fully tested)**
- Admin panel with site settings and order management
- Product browsing and cart functionality

### What Needs Configuration
- Razorpay live keys (for production)
- Stripe integration (next task)

---

## Prioritized Backlog

### P0 - Completed ✅
- ~~Razorpay Payment Integration~~

### P1 - High Priority (Next)
1. **Stripe Payment Integration** - Add as alternative payment gateway

### P2 - Medium Priority
2. **Automated Email Notifications** - Order confirmation, shipping updates
3. **Full Admin CRUD** - Products, Categories management via API
4. **WhatsApp Notifications** - Order updates via WhatsApp

### P3 - Lower Priority
5. **User Management** - Block/edit users from admin
6. **Coupon Management** - Full coupon system
7. **Refund Processing** - Automated refund handling
8. **Support Ticket System**

### Refactoring Needed
- **backend/server.py** - Split into modules (1200+ lines currently)
- **CheckoutPage.jsx** - Break into smaller components
- **AdminPage.jsx** - Break into smaller components

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
│   │   ├── data/mock.js  # Some remaining mock data
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
