import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { siteConfig } from '../../data/mock';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';

const CartDrawer = () => {
  const { cart, cartTotal, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({cart.length} items)
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some beautiful jewelry to get started!</p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="px-6 py-3 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex gap-4 pb-4 border-b border-gray-100">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                    {item.customization?.name && (
                      <p className="text-xs text-gray-500">Name: {item.customization.name}</p>
                    )}
                    {item.customization?.metal && (
                      <p className="text-xs text-gray-500">Metal: {item.customization.metal}</p>
                    )}
                    {item.customization?.customImage && (
                      <p className="text-xs text-sky-600">📷 Custom photo attached</p>
                    )}
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {siteConfig.currencySymbol}{item.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.customization)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-sky-400 hover:text-sky-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.customization)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-sky-400 hover:text-sky-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.customization)}
                    className="text-gray-400 hover:text-gray-600 transition-colors self-start"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-xl font-bold text-gray-900">
                  {siteConfig.currencySymbol}{cartTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500">Shipping & taxes calculated at checkout</p>
              <Link
                to="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="block w-full py-4 bg-sky-500 hover:bg-sky-600 text-white text-center font-medium rounded-lg transition-colors"
              >
                Checkout
              </Link>
              <button
                onClick={() => setIsCartOpen(false)}
                className="block w-full py-3 text-gray-600 text-center text-sm hover:text-sky-600 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;