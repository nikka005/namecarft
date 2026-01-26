import React from 'react';
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';

// Pages
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CollectionPage from './pages/CollectionPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products/:slug" element={<ProductPage />} />
              <Route path="/collections/:slug" element={<CollectionPage />} />
              <Route path="/collections" element={<CollectionPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/pages/about-us" element={<AboutPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/account/*" element={<AccountPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/*" element={<AdminPage />} />
              {/* Fallback routes */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;