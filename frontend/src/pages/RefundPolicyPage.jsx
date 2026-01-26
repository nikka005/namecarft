import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const RefundPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">Return & Refund Policy</h1>
        
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-600">
            Last updated: January 2025
          </p>

          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-8">
            <p className="text-sky-800 font-medium">
              We want you to love your personalized jewelry! Please read our return policy carefully before placing your order.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Return Eligibility</h2>
            <p className="text-gray-600 mb-4">
              Due to the personalized nature of our products, returns are accepted only under the following conditions:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Defective Products:</strong> Items with manufacturing defects or damage</li>
              <li><strong>Wrong Item:</strong> If you receive an item different from what you ordered</li>
              <li><strong>Incorrect Personalization:</strong> If the personalization error was made by us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Non-Returnable Items</h2>
            <p className="text-gray-600 mb-4">The following items cannot be returned:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Personalized items with correct customization as ordered</li>
              <li>Items damaged due to customer misuse or improper care</li>
              <li>Items without original packaging or tags</li>
              <li>Items returned after 7 days of delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Return Process</h2>
            <p className="text-gray-600 mb-4">To initiate a return:</p>
            <ol className="list-decimal pl-6 text-gray-600 space-y-2">
              <li>Contact us within 7 days of receiving your order</li>
              <li>Email us at support@namecraft.shop with your order number and photos of the issue</li>
              <li>Wait for our team to review and approve your return request</li>
              <li>Once approved, we will provide return shipping instructions</li>
              <li>Pack the item securely in its original packaging</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Refund Process</h2>
            <p className="text-gray-600 mb-4">Once we receive and inspect your return:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>We will notify you of the approval or rejection of your refund</li>
              <li>Approved refunds will be processed within 5-7 business days</li>
              <li>Refunds will be credited to your original payment method</li>
              <li>Bank processing times may vary (5-10 business days for credit cards)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Exchanges</h2>
            <p className="text-gray-600">
              We offer exchanges for defective or incorrect items. If you wish to exchange your item, 
              please follow the return process and place a new order for the correct item. 
              We will prioritize your new order once the return is received.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Damaged or Lost Packages</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>If your package arrives damaged, please document and contact us immediately</li>
              <li>For lost packages, we will work with the shipping carrier to locate or replace your order</li>
              <li>Claims for lost packages must be made within 15 days of expected delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Cancellations</h2>
            <p className="text-gray-600 mb-4">
              Order cancellations are accepted under the following conditions:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Before Production:</strong> Full refund if order hasn't entered production</li>
              <li><strong>During Production:</strong> 50% refund for orders already in production</li>
              <li><strong>After Shipping:</strong> Cancellation not possible once shipped</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Contact Us</h2>
            <p className="text-gray-600">
              For any questions about returns or refunds, please contact us:
            </p>
            <p className="text-gray-600 mt-2">
              Email: support@namecraft.shop<br />
              Phone: +91 9876543210<br />
              Hours: Monday - Saturday, 10 AM - 6 PM IST
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicyPage;
