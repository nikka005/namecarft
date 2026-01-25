import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { heroData } from '../../data/mock';

const HeroSection = () => {
  return (
    <section className="bg-[#f5f5f0]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 min-h-[500px] lg:min-h-[600px]">
          {/* Left Content */}
          <div className="flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-0">
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-serif text-gray-900 mb-8 leading-tight">
              {heroData.title}
            </h2>
            <Link
              to={heroData.link}
              className="inline-flex items-center gap-3 text-gray-900 font-medium text-sm tracking-widest hover:gap-5 transition-all group"
            >
              {heroData.cta}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Image */}
          <div className="relative h-[400px] lg:h-full overflow-hidden">
            <img
              src={heroData.image}
              alt="Featured Product"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;