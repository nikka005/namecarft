// Updated mock data - will sync with backend

export const siteConfig = {
  siteName: "Name Craft",
  tagline: "Make it memorable",
  topBarText: "India's most loved brand with over 1L+ orders delivered",
  currency: "INR",
  currencySymbol: "₹",
  country: "India"
};

export const saleBanner = {
  title: "VALENTINE SALE",
  duration: "48 Hrs",
  discount: "40% OFF",
  subtitle: "Storewide",
  endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
};

export const heroData = {
  title: "100% Real Rose Box + Necklace",
  cta: "GET YOURS NOW",
  image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=80",
  link: "/products/rose-box-necklace"
};

export const categories = [
  { id: 1, name: "Her", slug: "for-her" },
  { id: 2, name: "Him", slug: "for-him" },
  { id: 3, name: "Kids", slug: "kids" },
  { id: 4, name: "Couple", slug: "couple" },
  { id: 5, name: "Cultural", slug: "cultural" },
  { id: 6, name: "Express Ship", slug: "express-ship" }
];

export const navItems = [
  { name: "Women", href: "/collections/for-her", hasDropdown: true },
  { name: "Men", href: "/collections/for-him", hasDropdown: false },
  { name: "Kids", href: "/collections/kids", hasDropdown: false },
  { name: "Express Shipping", href: "/collections/express-ship", hasDropdown: false },
  { name: "Best sellers", href: "/collections/all", hasDropdown: false, highlight: true }
];

export const products = [
  {
    id: "1",
    name: "Men Circle Bracelet",
    slug: "men-circle-bracelet",
    price: 1499,
    originalPrice: 2499,
    original_price: 2499,
    discount: 40,
    image: "https://images.pexels.com/photos/3634366/pexels-photo-3634366.jpeg?w=533",
    hoverImage: "https://images.pexels.com/photos/32039109/pexels-photo-32039109.jpeg?w=533",
    hover_image: "https://images.pexels.com/photos/32039109/pexels-photo-32039109.jpeg?w=533",
    category: "for-him",
    featured: true,
    is_featured: true,
    inStock: true,
    in_stock: true
  },
  {
    id: "2",
    name: "Rainbow Kids Name Necklace",
    slug: "rainbow-kids-necklace",
    price: 1499,
    originalPrice: 1899,
    original_price: 1899,
    discount: 21,
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=533&q=80",
    hoverImage: "https://images.unsplash.com/photo-1600862754152-80a263dd564f?w=533&q=80",
    hover_image: "https://images.unsplash.com/photo-1600862754152-80a263dd564f?w=533&q=80",
    category: "kids",
    featured: true,
    is_featured: true,
    inStock: true,
    in_stock: true
  },
  {
    id: "3",
    name: "Chic Signature Name Necklace",
    slug: "chic-signature-necklace",
    price: 1499,
    originalPrice: 1899,
    original_price: 1899,
    discount: 21,
    image: "https://images.unsplash.com/photo-1623321673989-830eff0fd59f?w=533&q=80",
    hoverImage: "https://images.pexels.com/photos/4550854/pexels-photo-4550854.jpeg?w=533",
    hover_image: "https://images.pexels.com/photos/4550854/pexels-photo-4550854.jpeg?w=533",
    category: "for-her",
    featured: true,
    is_featured: true,
    inStock: true,
    in_stock: true
  },
  {
    id: "4",
    name: "Heart Name Necklace",
    slug: "heart-name-necklace",
    price: 1499,
    originalPrice: 1899,
    original_price: 1899,
    discount: 21,
    image: "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?w=533&q=80",
    hoverImage: "https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?w=533&q=80",
    hover_image: "https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?w=533&q=80",
    category: "for-her",
    featured: true,
    is_featured: true,
    inStock: true,
    in_stock: true
  },
  {
    id: "5",
    name: "Zirconia Bar Necklace",
    slug: "zirconia-bar-necklace",
    price: 1799,
    originalPrice: 2499,
    original_price: 2499,
    discount: 28,
    image: "https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=533&q=80",
    hoverImage: "https://images.pexels.com/photos/3674231/pexels-photo-3674231.jpeg?w=533",
    hover_image: "https://images.pexels.com/photos/3674231/pexels-photo-3674231.jpeg?w=533",
    category: "for-her",
    featured: true,
    is_featured: true,
    inStock: true,
    in_stock: true
  },
  {
    id: "6",
    name: "Dainty Name Necklace",
    slug: "dainty-name-necklace",
    price: 1499,
    originalPrice: 1899,
    original_price: 1899,
    discount: 21,
    image: "https://images.pexels.com/photos/13924051/pexels-photo-13924051.jpeg?w=533",
    hoverImage: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=533&q=80",
    hover_image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=533&q=80",
    category: "for-her",
    featured: true,
    is_featured: true,
    inStock: true,
    in_stock: true
  },
  {
    id: "7",
    name: "Men Legacy Bracelet",
    slug: "men-legacy-bracelet",
    price: 1499,
    originalPrice: 2499,
    original_price: 2499,
    discount: 40,
    image: "https://images.pexels.com/photos/3070012/pexels-photo-3070012.jpeg?w=533",
    hoverImage: "https://images.pexels.com/photos/3634366/pexels-photo-3634366.jpeg?w=533",
    hover_image: "https://images.pexels.com/photos/3634366/pexels-photo-3634366.jpeg?w=533",
    category: "for-him",
    featured: true,
    is_featured: true,
    inStock: true,
    in_stock: true
  },
  {
    id: "8",
    name: "Preserved Rose Box & Necklace",
    slug: "rose-box-necklace",
    price: 1999,
    originalPrice: 3499,
    original_price: 3499,
    discount: 43,
    image: "https://images.pexels.com/photos/10582459/pexels-photo-10582459.jpeg?w=533",
    hoverImage: "https://images.pexels.com/photos/11952260/pexels-photo-11952260.jpeg?w=533",
    hover_image: "https://images.pexels.com/photos/11952260/pexels-photo-11952260.jpeg?w=533",
    category: "for-her",
    featured: true,
    is_featured: true,
    inStock: true,
    in_stock: true
  },
  {
    id: "9",
    name: "Circle of Love Bead Necklace",
    slug: "circle-love-necklace",
    price: 1499,
    originalPrice: 2499,
    original_price: 2499,
    discount: 40,
    image: "https://images.unsplash.com/photo-1600862754152-80a263dd564f?w=533&q=80",
    hoverImage: "https://images.unsplash.com/photo-1623321673989-830eff0fd59f?w=533&q=80",
    hover_image: "https://images.unsplash.com/photo-1623321673989-830eff0fd59f?w=533&q=80",
    category: "for-her",
    featured: false,
    is_featured: false,
    inStock: true,
    in_stock: true
  },
  {
    id: "10",
    name: "Our Bar Name Necklace",
    slug: "bar-name-necklace",
    price: 1499,
    originalPrice: 2499,
    original_price: 2499,
    discount: 40,
    image: "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?w=533&q=80",
    hoverImage: "https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?w=533&q=80",
    hover_image: "https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?w=533&q=80",
    category: "for-her",
    featured: false,
    is_featured: false,
    inStock: true,
    in_stock: true
  },
  {
    id: "11",
    name: "Bond of Love Bracelets Set",
    slug: "bond-love-bracelets",
    price: 1499,
    originalPrice: 2199,
    original_price: 2199,
    discount: 32,
    image: "https://images.pexels.com/photos/121848/pexels-photo-121848.jpeg?w=533",
    hoverImage: "https://images.pexels.com/photos/3634366/pexels-photo-3634366.jpeg?w=533",
    hover_image: "https://images.pexels.com/photos/3634366/pexels-photo-3634366.jpeg?w=533",
    category: "couple",
    featured: false,
    is_featured: false,
    inStock: true,
    in_stock: true
  },
  {
    id: "12",
    name: "Couple Name Ring",
    slug: "couple-name-ring",
    price: 1499,
    originalPrice: 1899,
    original_price: 1899,
    discount: 21,
    image: "https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=533&q=80",
    hoverImage: "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?w=533&q=80",
    hover_image: "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?w=533&q=80",
    category: "couple",
    featured: false,
    is_featured: false,
    inStock: true,
    in_stock: true
  }
];

export const categoryShowcase = [
  {
    id: 1,
    name: "Her",
    image: "https://images.pexels.com/photos/4550854/pexels-photo-4550854.jpeg?w=800",
    link: "/collections/for-her"
  },
  {
    id: 2,
    name: "Him",
    image: "https://images.pexels.com/photos/3070012/pexels-photo-3070012.jpeg?w=800",
    link: "/collections/for-him"
  },
  {
    id: 3,
    name: "Kids",
    image: "https://images.pexels.com/photos/5737277/pexels-photo-5737277.jpeg?w=800",
    link: "/collections/kids"
  },
  {
    id: 4,
    name: "Couple Sets",
    image: "https://images.pexels.com/photos/121848/pexels-photo-121848.jpeg?w=800",
    link: "/collections/couple"
  },
  {
    id: 5,
    name: "Self Love",
    image: "https://images.pexels.com/photos/3674231/pexels-photo-3674231.jpeg?w=800",
    link: "/products/chic-signature-necklace"
  }
];

export const trustBadges = [
  { id: 1, title: "High Quality Metals", icon: "gem" },
  { id: 2, title: "Hand made per order", icon: "hand" },
  { id: 3, title: "Over 80k+ happy customers", icon: "users" },
  { id: 4, title: "Directly From us", icon: "package" }
];

export const socialImages = [
  "https://images.pexels.com/photos/4550854/pexels-photo-4550854.jpeg?w=400",
  "https://images.pexels.com/photos/3674231/pexels-photo-3674231.jpeg?w=400",
  "https://images.pexels.com/photos/13924051/pexels-photo-13924051.jpeg?w=400",
  "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=400&q=80",
  "https://images.unsplash.com/photo-1600862754152-80a263dd564f?w=400&q=80",
  "https://images.unsplash.com/photo-1623321673989-830eff0fd59f?w=400&q=80"
];

export const footerLinks = {
  shop: [
    { name: "All Products", href: "/collections/all" },
    { name: "New Arrivals", href: "/collections/all" },
    { name: "Best Sellers", href: "/collections/all" },
    { name: "Sale", href: "/collections/all" }
  ],
  help: [
    { name: "Contact Us", href: "/contact" },
    { name: "Track Order", href: "/account" },
    { name: "Shipping Policy", href: "/shipping-policy" },
    { name: "Returns & Refunds", href: "/refund-policy" }
  ],
  about: [
    { name: "Our Story", href: "/about" },
    { name: "Reviews", href: "/collections/all" },
    { name: "Contact", href: "/contact" }
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Refund Policy", href: "/refund-policy" }
  ]
};

export const paymentMethods = [
  { id: 'upi', name: 'UPI (Google Pay, PhonePe, Paytm)', icon: 'smartphone', description: 'Pay instantly via UPI' },
  { id: 'upi-apps', name: 'UPI Apps', icon: 'qr-code', description: 'Scan QR with any UPI app' },
  { id: 'razorpay', name: 'Razorpay (Cards, Net Banking)', icon: 'credit-card', description: 'Credit/Debit Cards, Net Banking' },
  { id: 'stripe', name: 'Stripe (International Cards)', icon: 'globe', description: 'International credit/debit cards' },
  { id: 'cod', name: 'Cash on Delivery', icon: 'truck', description: 'Pay when you receive' }
];
