import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SaleBanner from '../components/home/SaleBanner';
import HeroSection from '../components/home/HeroSection';
import CategoryTabs from '../components/home/CategoryTabs';
import ProductCarousel from '../components/home/ProductCarousel';
import BrandSection from '../components/home/BrandSection';
import CategoryShowcase from '../components/home/CategoryShowcase';
import SocialGallery from '../components/home/SocialGallery';
import TrustBadges from '../components/home/TrustBadges';
import SpinWheel from '../components/common/SpinWheel';
import CartDrawer from '../components/cart/CartDrawer';
import { useCart } from '../context/CartContext';
import { products } from '../data/mock';

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState('for-her');
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const { addToCart, cartCount, setIsCartOpen } = useCart();

  // Show spin wheel after 5 seconds (first visit only)
  useEffect(() => {
    const hasSeenSpinWheel = sessionStorage.getItem('hasSeenSpinWheel');
    if (!hasSeenSpinWheel) {
      const timer = setTimeout(() => {
        setShowSpinWheel(true);
        sessionStorage.setItem('hasSeenSpinWheel', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const featuredProducts = products.filter((p) => p.featured);
  const uniqueFinds = products.filter((p) => !p.featured || p.category === 'for-her');

  const handleAddToCart = (product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={cartCount} />
      <SaleBanner />
      
      <main>
        <HeroSection />
        <CategoryTabs activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        
        <ProductCarousel
          title="Perfect For Gifting"
          products={featuredProducts}
          viewAllLink="/collections/gifting"
          onAddToCart={handleAddToCart}
        />
        
        <BrandSection />
        
        <ProductCarousel
          title="Unique Finds"
          products={uniqueFinds}
          viewAllLink="/collections/for-her"
          onAddToCart={handleAddToCart}
        />
        
        <CategoryShowcase />
        <SocialGallery />
        <TrustBadges />
      </main>
      
      <Footer />
      <CartDrawer />
      
      {showSpinWheel && <SpinWheel onClose={() => setShowSpinWheel(false)} />}
    </div>
  );
};

export default HomePage;