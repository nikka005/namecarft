import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useCart } from '../context/CartContext';
import { Award, Users, Heart, Sparkles } from 'lucide-react';

const AboutPage = () => {
  const { cartCount } = useCart();

  const stats = [
    { number: '1L+', label: 'Orders Delivered' },
    { number: '80K+', label: 'Happy Customers' },
    { number: '500+', label: 'Unique Designs' },
    { number: '4.9', label: 'Average Rating' }
  ];

  const values = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Every piece is crafted with 18K gold plating and premium materials for lasting beauty.'
    },
    {
      icon: Heart,
      title: 'Made with Love',
      description: 'Each piece is handcrafted per order, making your jewelry truly one-of-a-kind.'
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We offer easy returns and dedicated support.'
    },
    {
      icon: Sparkles,
      title: 'Personalized Touch',
      description: 'Add names, dates, or special messages to create meaningful keepsakes.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={cartCount} />

      <main>
        {/* Hero Section */}
        <section className="relative h-[400px] bg-gray-900 overflow-hidden">
          <img
            src="https://images.pexels.com/photos/3674231/pexels-photo-3674231.jpeg?w=1920"
            alt="About Name Craft"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl lg:text-5xl font-serif mb-4">Our Story</h1>
              <p className="text-lg text-white/80 max-w-xl mx-auto px-4">
                India's #1 personalized jewellery brand, making your moments memorable since 2019.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-sky-500 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif text-gray-900 mb-6">Making Memories Tangible</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Name Craft was born from a simple belief: that jewelry should tell a story. 
                What started as a small passion project has grown into India's most loved 
                personalized jewelry brand, touching millions of hearts along the way.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Every piece we create is more than just jewelry - it's a keepsake of precious 
                moments, a reminder of loved ones, and a celebration of the special bonds we share. 
                From first names to anniversaries, our pieces help you carry your stories close to your heart.
              </p>
              <p className="text-gray-600 leading-relaxed">
                With over 1 lakh orders delivered and 80,000+ happy customers, we're honored to be 
                a part of your most cherished moments. Thank you for choosing Name Craft.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-serif text-gray-900 text-center mb-12">What We Stand For</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-sm">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-sky-50 flex items-center justify-center">
                    <value.icon className="w-7 h-7 text-sky-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-500 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-serif text-gray-900 mb-6">Ready to Create Something Special?</h2>
            <p className="text-gray-600 mb-8">
              Browse our collection and find the perfect piece to celebrate your story.
            </p>
            <Link
              to="/collections/all"
              className="inline-block px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;