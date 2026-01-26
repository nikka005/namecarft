import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

const ContactPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you within 24 hours.');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif text-gray-900 mb-4">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have a question about your order or need help choosing the perfect gift? 
            We're here to help!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <a href="mailto:support@namecraft.shop" className="text-sky-600 hover:text-sky-700">
                    support@namecraft.shop
                  </a>
                  <p className="text-sm text-gray-500 mt-1">We reply within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <a href="tel:+919876543210" className="text-sky-600 hover:text-sky-700">
                    +91 98765 43210
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Mon - Sat, 10 AM - 6 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">WhatsApp</p>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                    +91 98765 43210
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Quick responses on WhatsApp</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Business Hours</p>
                  <p className="text-gray-600">Monday - Saturday</p>
                  <p className="text-gray-600">10:00 AM - 6:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-gray-600">
                    Name Craft Pvt. Ltd.<br />
                    123 Jewelry Lane, Andheri West<br />
                    Mumbai, Maharashtra 400058<br />
                    India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="John Doe" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="orderNumber">Order Number (if applicable)</Label>
                <Input id="orderNumber" placeholder="NC20250126XXXXXX" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <select id="subject" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                  <option value="">Select a topic</option>
                  <option value="order">Order Inquiry</option>
                  <option value="product">Product Question</option>
                  <option value="shipping">Shipping & Delivery</option>
                  <option value="return">Returns & Refunds</option>
                  <option value="custom">Custom Order Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="message">Your Message</Label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="How can we help you?"
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                />
              </div>

              <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3">
                Send Message
              </Button>

              <p className="text-sm text-gray-500 text-center">
                We typically respond within 24 hours during business days.
              </p>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { q: "How long does delivery take?", a: "Standard delivery takes 5-7 business days. Express shipping is available for 2-3 day delivery." },
              { q: "Can I track my order?", a: "Yes! Once shipped, you'll receive a tracking number via email and SMS." },
              { q: "What if I spelled the name wrong?", a: "Please contact us immediately. We can correct it if production hasn't started." },
              { q: "Do you offer gift wrapping?", a: "Yes! All orders come in beautiful gift-ready packaging at no extra cost." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-900 mb-2">{faq.q}</p>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
