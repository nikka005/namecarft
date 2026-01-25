import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/mock';

const CategoryTabs = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="bg-white py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-2 md:gap-6 flex-wrap">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.slug
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;