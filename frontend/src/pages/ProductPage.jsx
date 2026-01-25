import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Share2, Truck, Shield, RotateCcw, Minus, Plus } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SaleBanner from '../components/home/SaleBanner';
import CartDrawer from '../components/cart/CartDrawer';
import { useCart } from '../context/CartContext';
import { products, siteConfig } from '../data/mock';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const ProductPage = () => {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug) || products[0];
  const { addToCart, cartCount, setIsCartOpen } = useCart();

  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customName, setCustomName] = useState('');
  const [selectedMetal, setSelectedMetal] = useState('gold');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const images = [product.image, product.hoverImage || product.hover_image].filter(Boolean);
  const savings = (product.originalPrice || product.original_price) - product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity, { name: customName, metal: selectedMetal });
    setIsCartOpen(true);
  };

  const metals = [
    { id: 'gold', name: '18K Gold Plated', color: '#D4AF37' },
    { id: 'rose-gold', name: 'Rose Gold', color: '#B76E79' },
    { id: 'silver', name: 'Sterling Silver', color: '#C0C0C0' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={cartCount} />
      <SaleBanner />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-sky-600">Home</Link>
          <span>/</span>
          <Link to="/collections/all" className="hover:text-sky-600">All Products</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white transition-colors shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white transition-colors shadow-md"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-sky-500 text-white text-sm font-bold px-3 py-1 rounded">
                  {product.discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImage === idx ? 'border-sky-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-serif text-gray-900 mb-4">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                {siteConfig.currencySymbol}{product.price.toLocaleString()}
              </span>
              {(product.originalPrice || product.original_price) > product.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {siteConfig.currencySymbol}{(product.originalPrice || product.original_price).toLocaleString()}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Save {siteConfig.currencySymbol}{savings.toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Metal Selection */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Metal Type</Label>
              <div className="flex gap-3">
                {metals.map((metal) => (
                  <button
                    key={metal.id}
                    onClick={() => setSelectedMetal(metal.id)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      selectedMetal === metal.id
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: metal.color }}
                    />
                    <span className="text-sm">{metal.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Personalization */}
            <div className="mb-6">
              <Label htmlFor="customName" className="text-sm font-medium text-gray-900 mb-3 block">
                Personalize with a Name *
              </Label>
              <Input
                id="customName"
                type="text"
                placeholder="Enter name (max 10 characters)"
                maxLength={10}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="max-w-xs"
              />
              <p className="text-xs text-gray-500 mt-2">
                Please double-check spelling. Personalized items cannot be returned.
              </p>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-900 mb-3 block">Quantity</Label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-sky-500 hover:text-sky-600 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-sky-500 hover:text-sky-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!customName.trim()}
                className="flex-1 py-4 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                Add to Cart - {siteConfig.currencySymbol}{(product.price * quantity).toLocaleString()}
              </button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-14 h-14 rounded-lg border flex items-center justify-center transition-colors ${
                  isWishlisted
                    ? 'bg-sky-50 border-sky-200 text-sky-600'
                    : 'border-gray-200 text-gray-600 hover:border-sky-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button className="w-14 h-14 rounded-lg border border-gray-200 text-gray-600 hover:border-sky-400 flex items-center justify-center transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-sky-600" />
                <p className="text-xs text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-sky-600" />
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-sky-600" />
                <p className="text-xs text-gray-600">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ProductPage;