import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone, MapPin, Clock, ChevronDown, ChevronUp, Search, ExternalLink } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useCart } from '../context/CartContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const faqs = [
  {
    category: 'Orders & Shipping',
    questions: [
      {
        q: 'How long does it take to receive my order?',
        a: 'Personalized jewelry takes 5-7 business days to craft. Once shipped, delivery takes 3-5 business days depending on your location.'
      },
      {
        q: 'Can I track my order?',
        a: 'Yes! Once your order ships, you\'ll receive a tracking number via email. You can also check order status in your account dashboard.'
      },
      {
        q: 'Do you offer express shipping?',
        a: 'Yes, we offer express shipping for an additional fee. Express orders are prioritized and delivered within 2-3 business days.'
      }
    ]
  },
  {
    category: 'Returns & Refunds',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 7 days of delivery for non-personalized items. Personalized jewelry cannot be returned unless defective.'
      },
      {
        q: 'How do I request a refund?',
        a: 'Contact us via email or WhatsApp with your order number. Refunds are processed within 5-7 business days after approval.'
      }
    ]
  },
  {
    category: 'Product & Customization',
    questions: [
      {
        q: 'How many characters can I add for personalization?',
        a: 'Most items support up to 10 characters. Some designs may have different limits which are shown on the product page.'
      },
      {
        q: 'What metal options are available?',
        a: 'We offer 18K Gold Plated, Rose Gold, and Sterling Silver options for most designs.'
      },
      {
        q: 'Are your products hypoallergenic?',
        a: 'Yes, all our jewelry is hypoallergenic and safe for sensitive skin.'
      }
    ]
  },
  {
    category: 'Payment',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit/debit cards, UPI, net banking, and wallets through Razorpay. We also accept direct UPI payments.'
      },
      {
        q: 'Is it safe to pay online?',
        a: 'Absolutely! All payments are processed securely through Razorpay with bank-level encryption.'
      }
    ]
  }
];

const HelpPage = () => {
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqs, setOpenFaqs] = useState({});

  const toggleFaq = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenFaqs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={cartCount} />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-4">
            How Can We Help You?
          </h1>
          <p className="text-gray-600 mb-8">
            Find answers to common questions or get in touch with our support team
          </p>
          
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg"
            />
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <a 
            href="mailto:support@namecraft.shop"
            className="bg-sky-50 rounded-xl p-6 text-center hover:bg-sky-100 transition-colors"
          >
            <Mail className="w-8 h-8 text-sky-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
            <p className="text-sm text-gray-600">support@namecraft.shop</p>
          </a>
          
          <a 
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-50 rounded-xl p-6 text-center hover:bg-green-100 transition-colors"
          >
            <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
            <p className="text-sm text-gray-600">Quick responses</p>
          </a>
          
          <a 
            href="tel:+919876543210"
            className="bg-purple-50 rounded-xl p-6 text-center hover:bg-purple-100 transition-colors"
          >
            <Phone className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
            <p className="text-sm text-gray-600">Mon-Sat, 10am-6pm</p>
          </a>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          
          {filteredFaqs.length > 0 ? (
            <div className="space-y-8">
              {filteredFaqs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.questions.map((faq, questionIndex) => {
                      const key = `${categoryIndex}-${questionIndex}`;
                      const isOpen = openFaqs[key];
                      return (
                        <div key={questionIndex} className="border border-gray-200 rounded-lg">
                          <button
                            onClick={() => toggleFaq(categoryIndex, questionIndex)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                          >
                            <span className="font-medium text-gray-900">{faq.q}</span>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4 text-gray-600">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Still need help?
          </h2>
          <p className="text-gray-600 mb-6">
            Our support team is always ready to assist you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button className="bg-sky-500 hover:bg-sky-600">
                Contact Us
              </Button>
            </Link>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Support
              </Button>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpPage;
