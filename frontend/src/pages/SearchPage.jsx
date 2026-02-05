import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, ArrowRight } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/products/ProductCard';
import { useCart } from '../context/CartContext';
import { Input } from '../components/ui/input';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const SearchPage = () => {
  const { addToCart, cartCount, setIsCartOpen } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    
    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.get(`${API}/api/products?search=${encodeURIComponent(searchQuery)}`);
      setResults(res.data.products || []);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    handleSearch(query);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  const popularSearches = ['Necklace', 'Bracelet', 'Ring', 'Couple', 'Kids', 'Gold'];

  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={cartCount} />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-serif text-gray-900 text-center mb-8">
            Search Products
          </h1>
          
          <form onSubmit={handleSubmit} className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for jewelry..."
              className="pl-12 pr-12 py-6 text-lg"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </form>

          {/* Popular Searches */}
          {!searched && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-3">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => { setQuery(term); handleSearch(term); setSearchParams({ q: term }); }}
                    className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-sky-100 hover:text-sky-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Searching...</p>
          </div>
        ) : searched ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{searchParams.get('q')}"
              </p>
            </div>
            
            {results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No products found for "{searchParams.get('q')}"</p>
                <Link
                  to="/collections/all"
                  className="inline-flex items-center text-sky-600 hover:text-sky-700"
                >
                  Browse all products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
