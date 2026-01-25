import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { siteConfig } from '../../data/mock';

const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const savings = product.originalPrice - product.price;

  return (
    <div
      className="group relative bg-white rounded-lg overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link to={`/products/${product.slug}`}>
          <img
            src={isHovered && product.hoverImage ? product.hoverImage : product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount}% off
          </div>
        )}

        {/* Quick Actions */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isWishlisted
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } shadow-md`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <Link
            to={`/products/${product.slug}`}
            className="w-9 h-9 rounded-full bg-white text-gray-700 hover:bg-gray-100 flex items-center justify-center shadow-md transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        {/* Add to Cart - Appears on Hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <button
            onClick={() => onAddToCart && onAddToCart(product)}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:text-red-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg font-bold text-gray-900">
            {siteConfig.currencySymbol}{product.price.toLocaleString()}
          </span>
          {product.originalPrice > product.price && (
            <>
              <span className="text-sm text-gray-400 line-through">
                {siteConfig.currencySymbol}{product.originalPrice.toLocaleString()}
              </span>
              <span className="text-xs text-green-600 font-medium">
                SAVE {siteConfig.currencySymbol}{savings.toLocaleString()}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;