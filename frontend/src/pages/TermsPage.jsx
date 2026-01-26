import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-600">
            Last updated: January 2025
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using the Name Craft website, you accept and agree to be bound by these Terms and Conditions. 
              If you do not agree to these terms, please do not use our website or services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Products and Services</h2>
            <p className="text-gray-600 mb-4">
              Name Craft offers personalized jewelry products. Please note:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>All products are handcrafted and may have slight variations</li>
              <li>Product images are for illustration purposes and actual products may vary slightly</li>
              <li>Personalized items are made to order based on your specifications</li>
              <li>Please double-check all personalization details before placing your order</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Orders and Payments</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes</li>
              <li>We accept payments via UPI, credit/debit cards, net banking, and cash on delivery</li>
              <li>Orders are confirmed only after successful payment verification</li>
              <li>We reserve the right to cancel orders due to pricing errors or product unavailability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Personalization Policy</h2>
            <p className="text-gray-600 mb-4">
              For personalized products:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Please ensure correct spelling of names/text before ordering</li>
              <li>We are not responsible for errors in customer-provided personalization details</li>
              <li>Personalized items cannot be returned or exchanged unless defective</li>
              <li>Maximum character limits apply as specified on product pages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Shipping and Delivery</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Standard delivery takes 5-7 business days</li>
              <li>Express shipping options are available at additional cost</li>
              <li>Delivery times may vary based on location and product availability</li>
              <li>Please provide accurate shipping information to avoid delays</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600">
              All content on this website, including text, graphics, logos, images, and software, 
              is the property of Name Craft and is protected by intellectual property laws. 
              You may not reproduce, distribute, or use any content without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. User Accounts</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You must provide accurate and complete information when creating an account</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600">
              Name Craft shall not be liable for any indirect, incidental, special, or consequential damages 
              arising from your use of our website or products. Our total liability shall not exceed 
              the amount paid for the product in question.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. Changes will be effective immediately 
              upon posting on the website. Your continued use of the website constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Information</h2>
            <p className="text-gray-600">
              For questions about these Terms & Conditions, please contact us at:
            </p>
            <p className="text-gray-600 mt-2">
              Email: support@namecraft.shop<br />
              Phone: +91 9876543210
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
