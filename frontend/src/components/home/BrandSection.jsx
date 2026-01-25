import React from 'react';
import { Link } from 'react-router-dom';

const BrandSection = () => {
  return (
    <section className="py-16 bg-[#f5f5f0]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <p className="text-xs tracking-widest text-gray-500 mb-2">
              INDIA #1 PERSONALIZED JEWELLERY BRAND
            </p>
            <h2 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-6">
              Loved by more than 80k+ customers
            </h2>
            <Link
              to="/about"
              className="inline-block px-8 py-3 border-2 border-gray-900 text-gray-900 font-medium text-sm tracking-wide hover:bg-gray-900 hover:text-white transition-colors"
            >
              Our Story
            </Link>
          </div>

          {/* Right Images */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/4550854/pexels-photo-4550854.jpeg?w=400"
                    alt="Customer wearing necklace"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="pt-8">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=400&q=80"
                    alt="Gold necklace detail"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSection;