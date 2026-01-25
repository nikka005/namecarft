import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SaleBanner from '../components/home/SaleBanner';
import { useCart } from '../context/CartContext';
import { siteConfig } from '../data/mock';

const CartPage = () => {
  const { cart, cartTotal, cartCount, removeFromCart, updateQuantity } = useCart();

  const shippingThreshold = 1000;
  const freeShipping = cartTotal >= shippingThreshold;
  const remainingForFreeShipping = shippingThreshold - cartTotal;

  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={cartCount} />
      <SaleBanner />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-serif text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link
              to="/collections/all"
              className="inline-flex items-center gap-2 px-8 py-4 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {/* Free Shipping Progress */}
              {!freeShipping && (
                <div className="mb-6 p-4 bg-sky-50 rounded-lg">
                  <p className="text-sm text-sky-800">
                    Add {siteConfig.currencySymbol}{remainingForFreeShipping.toLocaleString()} more for FREE shipping!
                  </p>
                  <div className="mt-2 h-2 bg-sky-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (cartTotal / shippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {cart.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex gap-6 pb-6 border-b border-gray-100"
                  >
                    <Link
                      to={`/products/${item.slug}`}
                      className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            to={`/products/${item.slug}`}
                            className="font-medium text-gray-900 hover:text-sky-600 transition-colors"
                          >
                            {item.name}
                          </Link>
                          {item.customization?.name && (
                            <p className="text-sm text-gray-500 mt-1">
                              Personalized: {item.customization.name}
                            </p>
                          )}
                          {item.customization?.metal && (
                            <p className="text-sm text-gray-500">
                              Metal: {item.customization.metal}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, item.customization)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.customization)}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-sky-500 hover:text-sky-600 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.customization)}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-sky-500 hover:text-sky-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {siteConfig.currencySymbol}{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal ({cartCount} items)</span>
                    <span>{siteConfig.currencySymbol}{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={freeShipping ? 'text-green-600 font-medium' : ''}>
                      {freeShipping ? 'FREE' : `${siteConfig.currencySymbol}99`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {siteConfig.currencySymbol}{(cartTotal + (freeShipping ? 0 : 99)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full py-4 bg-sky-500 hover:bg-sky-600 text-white text-center font-medium rounded-lg transition-colors mb-4"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  to="/collections/all"
                  className="block w-full py-3 text-gray-600 text-center text-sm hover:text-sky-600 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;