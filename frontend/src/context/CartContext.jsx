import React, { useState, useEffect, createContext, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('namestrings_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
        }
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes (only if cart has items or was explicitly cleared)
  useEffect(() => {
    if (cart.length > 0 || localStorage.getItem('namestrings_cart') !== null) {
      localStorage.setItem('namestrings_cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product, quantity = 1, customization = {}) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id && JSON.stringify(item.customization) === JSON.stringify(customization)
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && JSON.stringify(item.customization) === JSON.stringify(customization)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevCart, { ...product, quantity, customization }];
    });
  };

  const removeFromCart = (productId, customization = {}) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.id === productId && JSON.stringify(item.customization) === JSON.stringify(customization))
      )
    );
  };

  const updateQuantity = (productId, quantity, customization = {}) => {
    if (quantity <= 0) {
      removeFromCart(productId, customization);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId && JSON.stringify(item.customization) === JSON.stringify(customization)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;