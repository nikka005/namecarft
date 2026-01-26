import React from 'react';
import { socialImages } from '../../data/mock';

const SocialGallery = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-serif text-gray-900 mb-2">
            #namecraft Social Family
          </h2>
          <p className="text-gray-500">
            Visual Reviews Directly by Consumers | Mention @namecraft to get Featured Here
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {socialImages.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
            >
              <img
                src={image}
                alt={`Customer photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  SHOP THIS LOOK
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="px-8 py-3 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
            LOAD MORE
          </button>
        </div>
      </div>
    </section>
  );
};

export default SocialGallery;