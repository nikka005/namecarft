import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ShoppingBag, ChevronDown, Menu, X } from 'lucide-react';
import { siteConfig, navItems } from '../../data/mock';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <Link to="/help" className="text-gray-600 hover:text-sky-600 transition-colors">
              Need help?
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/about" className="text-gray-600 hover:text-sky-600 transition-colors">
              About Us
            </Link>
          </div>
          <p className="hidden md:block text-gray-600">
            {siteConfig.topBarText}
          </p>
          <div className="md:hidden" />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-serif italic text-gray-900">
                Name <span className="font-normal">Craft</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    item.highlight
                      ? 'text-sky-600 font-medium hover:text-sky-700'
                      : 'text-gray-700 hover:text-sky-600'
                  }`}
                >
                  {item.name}
                  {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <span>{siteConfig.currencySymbol}</span>
                <span>|</span>
                <span>{siteConfig.country}</span>
                <ChevronDown className="w-4 h-4" />
              </div>

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-700 hover:text-sky-600 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                to="/account"
                className="p-2 text-gray-700 hover:text-sky-600 transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-gray-700 hover:text-sky-600 transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-sky-600 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 py-4 px-4">
            <div className="max-w-2xl mx-auto relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="px-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block py-2 text-base transition-colors ${
                    item.highlight
                      ? 'text-sky-600 font-medium'
                      : 'text-gray-700 hover:text-sky-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;