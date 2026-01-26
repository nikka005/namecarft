import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { toast } from '../hooks/use-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || '/account';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
      } else {
        if (formData.password.length < 6) {
          toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
          setLoading(false);
          return;
        }
        await register(formData.name, formData.email, formData.password, formData.phone);
        toast({ title: 'Account created!', description: 'Welcome to Name Craft!' });
      }
      navigate(from, { replace: true });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.detail || (isLogin ? 'Invalid email or password' : 'Registration failed'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-500">
              {isLogin ? 'Sign in to access your orders and profile' : 'Join us for exclusive offers and order tracking'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    data-testid="auth-name"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  data-testid="auth-email"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                    data-testid="auth-phone"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={isLogin ? 'Your password' : 'Create a password (min 6 characters)'}
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  data-testid="auth-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-sky-600 hover:text-sky-700">
                  Forgot password?
                </Link>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white"
              data-testid="auth-submit"
            >
              {loading ? 'Please wait...' : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-sky-600 hover:text-sky-700 font-medium"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Benefits */}
          {!isLogin && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-3">Why create an account?</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs">✓</span>
                  Track your orders in real-time
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs">✓</span>
                  Save addresses for faster checkout
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs">✓</span>
                  Get exclusive offers and discounts
                </li>
              </ul>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthPage;
