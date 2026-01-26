import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Truck, Clock, MapPin, Package, Shield, Phone } from 'lucide-react';

const ShippingPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">Shipping Policy</h1>
        
        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-sky-50 rounded-xl p-4 text-center">
            <Truck className="w-8 h-8 text-sky-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Free Shipping</p>
            <p className="text-sm text-gray-600">On orders above ₹1,000</p>
          </div>
          <div className="bg-sky-50 rounded-xl p-4 text-center">
            <Clock className="w-8 h-8 text-sky-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">5-7 Days</p>
            <p className="text-sm text-gray-600">Standard delivery time</p>
          </div>
          <div className="bg-sky-50 rounded-xl p-4 text-center">
            <MapPin className="w-8 h-8 text-sky-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Pan India</p>
            <p className="text-sm text-gray-600">We ship everywhere</p>
          </div>
        </div>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Shipping Rates</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-gray-900">Order Value</th>
                    <th className="pb-2 text-gray-900">Shipping Cost</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b">
                    <td className="py-2">Above ₹1,000</td>
                    <td className="py-2 text-green-600 font-medium">FREE</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Below ₹1,000</td>
                    <td className="py-2">₹99</td>
                  </tr>
                  <tr>
                    <td className="py-2">Express Shipping</td>
                    <td className="py-2">₹149</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Delivery Timeframes</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Package className="w-6 h-6 text-sky-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Standard Shipping</p>
                  <p className="text-gray-600">5-7 business days (Metro cities: 4-5 days)</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Truck className="w-6 h-6 text-sky-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Express Shipping</p>
                  <p className="text-gray-600">2-3 business days (Available in select cities)</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              * Processing time: 1-2 business days for personalized items
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Order Processing</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Orders are processed within 1-2 business days after payment confirmation</li>
              <li>Personalized items require additional 1-2 days for customization</li>
              <li>Orders placed after 2 PM will be processed the next business day</li>
              <li>Orders placed on weekends/holidays will be processed on the next business day</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Order Tracking</h2>
            <p className="text-gray-600 mb-4">
              Once your order is shipped, you will receive:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Email notification with tracking number</li>
              <li>SMS updates on your registered mobile number</li>
              <li>Real-time tracking through your account dashboard</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Shipping Partners</h2>
            <p className="text-gray-600">
              We work with trusted shipping partners including Delhivery, BlueDart, and India Post 
              to ensure safe and timely delivery of your orders. The shipping partner is selected 
              based on your location for optimal delivery experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Delivery Attempts</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Our delivery partners make up to 3 delivery attempts</li>
              <li>If delivery fails, the package will be held at the nearest hub for 7 days</li>
              <li>Unclaimed packages will be returned to us</li>
              <li>Re-shipping charges may apply for returned packages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Important Notes</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Please ensure accurate shipping address and phone number</li>
                <li>Someone should be available to receive the package</li>
                <li>Delivery times may be affected during festivals and peak seasons</li>
                <li>Remote areas may require additional 2-3 days for delivery</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Contact Us</h2>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-6 h-6 text-sky-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Need help with shipping?</p>
                <p className="text-gray-600">
                  Email: support@namecraft.shop<br />
                  Phone: +91 9876543210<br />
                  WhatsApp: +91 9876543210
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingPolicyPage;
