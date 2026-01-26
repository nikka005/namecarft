import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, LayoutGrid } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SaleBanner from '../components/home/SaleBanner';
import ProductCard from '../components/products/ProductCard';
import CartDrawer from '../components/cart/CartDrawer';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const API = process.env.REACT_APP_BACKEND_URL || '';

const CATEGORY_NAMES = {
  'for-her': 'For Her',
  'for-him': 'For Him',
  'kids': 'Kids',
  'couples': 'Couples',
  'rings': 'Rings',
  'express': 'Express Shipping',
  'all': 'All Products'
};

const CollectionPage = () => {
  const { slug } = useParams();
  const { addToCart, cartCount, setIsCartOpen } = useCart();
  const [sortBy, setSortBy] = useState('featured');
  const [gridSize, setGridSize] = useState(4);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryName = CATEGORY_NAMES[slug] || 'All Products';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = slug && slug !== 'all' ? `?category=${slug}` : '';
        const res = await axios.get(`${API}/api/products${params}`);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug]);

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'discount':
        return b.discount - a.discount;
      default:
        return b.is_featured - a.is_featured;
    }
  });

  const handleAddToCart = (product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={cartCount} />
      <SaleBanner />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <span className="text-gray-900">{categoryName}</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-2">{categoryName}</h1>
          <p className="text-gray-500">{sortedProducts.length} products</p>
        </div>

        {/* Filters & Sort */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="discount">Best Discount</SelectItem>
              </SelectContent>
            </Select>

            {/* Grid Toggle */}
            <div className="hidden md:flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setGridSize(3)}
                className={`p-2 rounded transition-colors ${gridSize === 3 ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridSize(4)}
                className={`p-2 rounded transition-colors ${gridSize === 4 ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className={`grid gap-6 ${gridSize === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No products found in this category.</p>
            <Link
              to="/collections/all"
              className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              View All Products
            </Link>
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default CollectionPage;
