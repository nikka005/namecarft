import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { heroData } from '../../data/mock';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const HeroSection = () => {
  const [hero, setHero] = useState(heroData);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API}/api/settings`);
        if (res.data) {
          setHero({
            title: res.data.hero_title || heroData.title,
            cta: res.data.hero_cta || heroData.cta,
            link: res.data.hero_link || heroData.link,
            image: res.data.hero_image || heroData.image
          });
        }
      } catch (err) {
        console.log('Using default hero data');
      }
    };
    fetchSettings();
  }, []);

  return (
    <section className="bg-[#f5f5f0]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 min-h-[500px] lg:min-h-[600px]">
          {/* Left Content */}
          <div className="flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-0">
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-serif text-gray-900 mb-8 leading-tight">
              {hero.title}
            </h2>
            <Link
              to={hero.link}
              className="inline-flex items-center gap-3 text-gray-900 font-medium text-sm tracking-widest hover:gap-5 transition-all group"
            >
              {hero.cta}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Image */}
          <div className="relative h-[400px] lg:h-full overflow-hidden">
            <img
              src={hero.image}
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