import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Share2, Truck, Shield, RotateCcw, Minus, Plus, Upload, X, Image as ImageIcon } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SaleBanner from '../components/home/SaleBanner';
import CartDrawer from '../components/cart/CartDrawer';
import { useCart } from '../context/CartContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const ProductPage = () => {
  const { slug } = useParams();
  const { addToCart, cartCount, setIsCartOpen } = useCart();
  const fileInputRef = useRef(null);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customName, setCustomName] = useState('');
  const [selectedMetal, setSelectedMetal] = useState('gold');
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Image upload state
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API}/api/products/${slug}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await axios.post(`${API}/api/upload/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploadedImage(res.data.url);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image. Please try again.');
      setUploadedImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setUploadedImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header cartCount={cartCount} />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading product...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header cartCount={cartCount} />
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-gray-500 mb-4">Product not found</p>
          <Link to="/collections/all" className="text-sky-500 hover:underline">
            Browse all products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = [product.image, product.hover_image].filter(Boolean);
  const savings = (product.original_price || 0) - product.price;

  const handleAddToCart = () => {
    if (!customName.trim()) {
      const nameInput = document.getElementById('custom-name-input');
      if (nameInput) {
        nameInput.focus();
        nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      alert('Please enter a name for personalization');
      return;
    }
    addToCart(product, quantity, { 
      name: customName, 
      metal: selectedMetal,
      customImage: uploadedImage || null
    });
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
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                  {product.discount}% OFF
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImage === index ? 'border-sky-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-serif text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{product.price?.toLocaleString()}
                  </span>
                  {product.original_price > product.price && (
                    <span className="text-lg text-gray-400 line-through">
                      ₹{product.original_price?.toLocaleString()}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <span className="text-green-600 font-medium">
                    Save ₹{savings.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600">{product.description}</p>
            )}

            {/* Metal Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-3 block">
                Select Metal Type
              </Label>
              <div className="flex flex-wrap gap-3">
                {metals.map((metal) => (
                  <button
                    key={metal.id}
                    onClick={() => setSelectedMetal(metal.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedMetal === metal.id
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: metal.color }}
                    />
                    <span className="text-sm font-medium">{metal.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Personalization */}
            <div>
              <Label htmlFor="custom-name-input" className="text-sm font-medium text-gray-900 mb-2 block">
                Personalize Your Jewelry *
              </Label>
              <Input
                id="custom-name-input"
                placeholder="Enter name (max 10 characters)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value.slice(0, 10))}
                className="max-w-xs"
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                This name will be crafted on your jewelry
              </p>
            </div>

            {/* Custom Image Upload - Only show if product allows it */}
            {product.allow_custom_image && (
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Upload Your Photo (Optional)
              </Label>
              <p className="text-xs text-gray-500 mb-3">
                Upload a photo to be engraved/printed on your jewelry
              </p>
              
              {uploadedImagePreview ? (
                <div className="relative inline-block">
                  <img 
                    src={uploadedImagePreview} 
                    alt="Uploaded" 
                    className="w-32 h-32 object-cover rounded-lg border-2 border-sky-500"
                  />
                  <button
                    onClick={removeUploadedImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">Uploading...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-xs border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-colors"
                >
                  <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload your photo</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Quantity */}
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">
                Quantity
              </Label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={uploading}
                className="flex-1 bg-sky-500 text-white font-medium py-4 rounded-xl hover:bg-sky-600 transition-colors disabled:bg-gray-400"
                data-testid="add-to-cart-btn"
              >
                {uploading ? 'Uploading...' : `Add to Cart - ₹${(product.price * quantity).toLocaleString()}`}
              </button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-colors ${
                  isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button className="w-14 h-14 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto text-sky-500 mb-2" />
                <p className="text-xs text-gray-600">Free Shipping</p>
                <p className="text-xs text-gray-400">Orders over ₹999</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto text-sky-500 mb-2" />
                <p className="text-xs text-gray-600">Quality Assured</p>
                <p className="text-xs text-gray-400">Premium Materials</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto text-sky-500 mb-2" />
                <p className="text-xs text-gray-600">Easy Returns</p>
                <p className="text-xs text-gray-400">7 Day Policy</p>
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
