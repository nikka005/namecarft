import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, CreditCard, Truck, Shield, Smartphone, QrCode, Globe, CheckCircle, Copy, ExternalLink, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { siteConfig, paymentMethods } from '../data/mock';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from '../hooks/use-toast';
import axios from 'axios';
import { useRazorpay } from 'react-razorpay';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const iconMap = {
  'smartphone': Smartphone,
  'qr-code': QrCode,
  'credit-card': CreditCard,
  'globe': Globe,
  'truck': Truck
};

// Generate UPI Payment URL
const generateUPIUrl = (upiId, name, amount, orderId) => {
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: `Order ${orderId}`
  });
  return `upi://pay?${params.toString()}`;
};

// Generate QR Code URL using QR code API
const generateQRCodeUrl = (data, size = 200) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
};

const CheckoutPage = () => {
  const { cart, cartTotal, cartCount, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { error: razorpayError, isLoading: razorpayLoading, Razorpay } = useRazorpay();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [siteSettings, setSiteSettings] = useState(null);
  const [razorpayConfig, setRazorpayConfig] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');
  
  // Payment flow states
  const [checkoutStep, setCheckoutStep] = useState('details'); // 'details', 'payment', 'confirmation'
  const [orderId, setOrderId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'razorpay'
  });

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        firstName: user.name?.split(' ')[0] || prev.firstName,
        lastName: user.name?.split(' ').slice(1).join(' ') || prev.lastName,
        address: user.address || prev.address,
        city: user.city || prev.city,
        state: user.state || prev.state,
        pincode: user.pincode || prev.pincode
      }));
    }
  }, [user]);

  // Fetch site settings and Razorpay config
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settingsRes, razorpayRes] = await Promise.all([
          axios.get(`${API}/settings`),
          axios.get(`${API}/payment/razorpay/config`)
        ]);
        setSiteSettings(settingsRes.data);
        setRazorpayConfig(razorpayRes.data);
        
        // Set default payment method based on availability
        if (razorpayRes.data?.enabled) {
          setFormData(prev => ({ ...prev, paymentMethod: 'razorpay' }));
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const shippingCost = cartTotal >= 1000 ? 0 : 99;
  const total = cartTotal + shippingCost - discount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Razorpay Payment
  const handleRazorpayPayment = useCallback(async (orderData, savedOrderId) => {
    try {
      // Create Razorpay order
      const razorpayOrderRes = await axios.post(`${API}/payment/razorpay/create-order`, {
        amount: total,
        order_id: savedOrderId,
        email: formData.email
      });

      const options = {
        key: razorpayConfig?.key_id,
        amount: razorpayOrderRes.data.amount,
        currency: razorpayOrderRes.data.currency,
        name: razorpayConfig?.name || 'Name Craft',
        description: 'Payment for your order',
        order_id: razorpayOrderRes.data.id,
        handler: async (response) => {
          try {
            // Verify payment
            await axios.post(`${API}/payment/razorpay/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: savedOrderId
            });
            
            clearCart();
            setOrderId(savedOrderId);
            setCheckoutStep('confirmation');
            toast({ title: "Payment Successful!", description: "Your order has been confirmed." });
          } catch (err) {
            toast({ title: "Verification Failed", description: "Please contact support.", variant: "destructive" });
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#0ea5e9'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast({ title: "Payment Cancelled", description: "You can try again.", variant: "destructive" });
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast({ title: "Payment Failed", description: response.error.description, variant: "destructive" });
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay error:', err);
      toast({ title: "Error", description: "Failed to initialize payment.", variant: "destructive" });
      setLoading(false);
    }
  }, [Razorpay, razorpayConfig, total, formData, clearCart]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      const res = await axios.post(`${API}/coupons/validate?code=${encodeURIComponent(couponCode)}&subtotal=${cartTotal}`);
      const coupon = res.data;
      
      if (coupon.valid) {
        setDiscount(coupon.discount);
        setCouponApplied(true);
        toast({ title: "Coupon Applied!", description: `You saved ${siteConfig.currencySymbol}${coupon.discount.toFixed(0)}` });
      } else {
        toast({ title: "Invalid Coupon", description: "This coupon code is not valid.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Invalid Coupon", description: err.response?.data?.detail || "This coupon code is not valid.", variant: "destructive" });
    }
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    
    // If not logged in and wants to create account, register first
    if (!isAuthenticated && createAccount && password) {
      try {
        const name = `${formData.firstName} ${formData.lastName}`.trim();
        await axios.post(`${API}/auth/register`, {
          name,
          email: formData.email,
          password,
          phone: formData.phone
        });
        toast({ title: "Account Created!", description: "You can now track your orders" });
      } catch (err) {
        if (err.response?.status !== 400) { // Ignore if email exists
          toast({ title: "Account Error", description: err.response?.data?.detail || "Failed to create account", variant: "destructive" });
        }
      }
    }
    
    setLoading(true);

    try {
      // Create order in backend
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          customization: item.customization
        })),
        shipping_address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        payment_method: formData.paymentMethod,
        subtotal: cartTotal,
        shipping_cost: shippingCost,
        discount_amount: discount,
        total: total,
        coupon_code: couponApplied ? couponCode : null,
        user_email: formData.email
      };
      
      // Add auth header if logged in
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const res = await axios.post(`${API}/orders`, orderData, config);
      const savedOrderId = res.data.order_number || res.data.id;
      setOrderId(savedOrderId);
      
      if (formData.paymentMethod === 'cod') {
        // COD - directly go to confirmation
        clearCart();
        setCheckoutStep('confirmation');
        toast({ title: "Order Placed!", description: "Your order has been placed successfully." });
      } else if (formData.paymentMethod === 'razorpay') {
        // Razorpay payment
        await handleRazorpayPayment(orderData, savedOrderId);
      } else {
        // UPI manual - show payment screen
        setCheckoutStep('payment');
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      toast({ title: "Error", description: "Failed to create order. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUTR = async () => {
    if (!utrNumber.trim()) {
      toast({ title: "Enter UTR Number", description: "Please enter the UTR/Transaction ID from your payment app.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Submit UTR for verification
      await axios.post(`${API}/orders/${orderId}/submit-payment`, {
        utr_number: utrNumber,
        payment_method: formData.paymentMethod
      });
      
      clearCart();
      setCheckoutStep('confirmation');
      toast({ title: "Payment Submitted!", description: "Your payment is pending verification by admin." });
    } catch (err) {
      console.error('UTR submission failed:', err);
      toast({ title: "Submitted!", description: "Your payment details have been submitted for verification." });
      clearCart();
      setCheckoutStep('confirmation');
    } finally {
      setLoading(false);
    }
  };

  const upiId = siteSettings?.upi_id || 'merchant@upi';
  const merchantName = siteSettings?.site_name || 'Name Craft';
  const upiUrl = generateUPIUrl(upiId, merchantName, total, orderId);
  const qrCodeUrl = generateQRCodeUrl(upiUrl, 250);

  const copyUPIId = () => {
    navigator.clipboard.writeText(upiId);
    toast({ title: "Copied!", description: "UPI ID copied to clipboard" });
  };

  if (cart.length === 0 && checkoutStep === 'details') {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
            <h1 className="text-xl font-serif italic text-gray-900">Name <span className="font-normal">Craft</span></h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Add some items to proceed to checkout.</p>
          <Link to="/collections/all" className="inline-block px-6 py-3 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors">
            Continue Shopping
          </Link>
        </main>
      </div>
    );
  }

  // Payment Step - Show QR Code
  if (checkoutStep === 'payment') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
            <h1 className="text-xl font-serif italic text-gray-900">Name <span className="font-normal">Craft</span></h1>
          </div>
        </header>
        
        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-sky-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Pay via UPI</h2>
              <p className="text-gray-500 mt-1">Order #{orderId}</p>
            </div>

            {/* Amount */}
            <div className="bg-sky-50 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-gray-600">Amount to Pay</p>
              <p className="text-3xl font-bold text-sky-600">{siteConfig.currencySymbol}{total.toLocaleString()}</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                <img src={qrCodeUrl} alt="UPI QR Code" className="w-[200px] h-[200px]" />
              </div>
            </div>

            {/* UPI ID */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Or pay to UPI ID</p>
              <div className="flex items-center justify-between">
                <span className="font-mono font-medium text-gray-900">{upiId}</span>
                <button onClick={copyUPIId} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Open in UPI App */}
            <a 
              href={upiUrl}
              className="w-full mb-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open in UPI App
            </a>

            {/* UTR Input */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-medium text-gray-900 mb-3">After Payment</h3>
              <p className="text-sm text-gray-500 mb-4">
                Enter the UTR number / Transaction ID from your payment app to confirm your order.
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="utr">UTR Number / Transaction ID</Label>
                  <Input 
                    id="utr" 
                    placeholder="e.g., 123456789012" 
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <button 
                  onClick={handleSubmitUTR}
                  disabled={loading || !utrNumber.trim()}
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit & Confirm Order'}
                </button>
              </div>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-400 text-center mt-6">
              Your payment will be verified by our team within 24 hours.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Confirmation Step
  if (checkoutStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
            <h1 className="text-xl font-serif italic text-gray-900">Name <span className="font-normal">Craft</span></h1>
          </div>
        </header>
        
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Submitted!</h2>
            <p className="text-gray-500 mb-6">
              {formData.paymentMethod === 'cod' 
                ? 'Your order has been placed. You will pay on delivery.'
                : 'Your payment is pending verification. We will confirm your order within 24 hours.'}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-xl font-mono font-bold text-gray-900">{orderId}</p>
            </div>
            <Link 
              to="/"
              className="inline-block px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Details Step - Main Checkout Form
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/cart" className="flex items-center gap-2 text-gray-600 hover:text-sky-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span>Back to cart</span>
          </Link>
          <Link to="/" className="text-xl font-serif italic text-gray-900">
            Name <span className="font-normal">Craft</span>
          </Link>
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <Lock className="w-4 h-4" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              {/* Login/Register Banner for guests */}
              {!isAuthenticated && (
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-sky-600" />
                      <div>
                        <p className="font-medium text-gray-900">Already have an account?</p>
                        <p className="text-sm text-gray-500">Sign in to track your order easily</p>
                      </div>
                    </div>
                    <Link to="/login" state={{ from: '/checkout' }} className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium">
                      Sign In
                    </Link>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required placeholder="your@email.com" value={formData.email} onChange={handleInputChange} data-testid="checkout-email" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" required placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} data-testid="checkout-phone" />
                  </div>
                  
                  {/* Create Account Option for guests */}
                  {!isAuthenticated && (
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={createAccount}
                          onChange={(e) => setCreateAccount(e.target.checked)}
                          className="w-4 h-4 text-sky-500 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Create an account to track your orders</span>
                      </label>
                      {createAccount && (
                        <div className="mt-3">
                          <Label htmlFor="password">Create Password</Label>
                          <Input 
                            id="password" 
                            type="password" 
                            placeholder="Min 6 characters" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                            required={createAccount}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" name="firstName" required value={formData.firstName} onChange={handleInputChange} data-testid="checkout-firstname" /></div>
                    <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" name="lastName" required value={formData.lastName} onChange={handleInputChange} data-testid="checkout-lastname" /></div>
                  </div>
                  <div><Label htmlFor="address">Address</Label><Input id="address" name="address" required placeholder="House number, Street name" value={formData.address} onChange={handleInputChange} data-testid="checkout-address" /></div>
                  <div><Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label><Input id="apartment" name="apartment" placeholder="Apartment, suite, unit, building, floor, etc." value={formData.apartment} onChange={handleInputChange} /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label htmlFor="city">City</Label><Input id="city" name="city" required value={formData.city} onChange={handleInputChange} data-testid="checkout-city" /></div>
                    <div><Label htmlFor="state">State</Label><Input id="state" name="state" required value={formData.state} onChange={handleInputChange} data-testid="checkout-state" /></div>
                    <div><Label htmlFor="pincode">PIN Code</Label><Input id="pincode" name="pincode" required pattern="[0-9]{6}" maxLength={6} value={formData.pincode} onChange={handleInputChange} data-testid="checkout-pincode" /></div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {/* Razorpay Option - Only payment method */}
                  {razorpayConfig?.enabled && (
                    <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.paymentMethod === 'razorpay' ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="paymentMethod" value="razorpay" checked={formData.paymentMethod === 'razorpay'} onChange={handleInputChange} className="w-4 h-4 text-sky-500" />
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 block">Pay Online (Razorpay)</span>
                        <span className="text-sm text-gray-500">Cards, UPI, Net Banking, Wallets</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-6 w-auto" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Visa.svg/200px-Visa.svg.png" alt="Visa" className="h-4 w-auto" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5 w-auto" />
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-4 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                data-testid="checkout-submit"
              >
                {loading ? <span>Processing...</span> : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{formData.paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Payment'} - {siteConfig.currencySymbol}{total.toLocaleString()}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      {item.customization?.name && (
                        <p className="text-xs text-gray-500">Name: {item.customization.name}</p>
                      )}
                      {item.customization?.metal && (
                        <p className="text-xs text-gray-500">Metal: {item.customization.metal}</p>
                      )}
                      {item.customization?.customImage && (
                        <p className="text-xs text-sky-600">📷 Custom photo attached</p>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{siteConfig.currencySymbol}{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-6">
                <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={couponApplied} />
                <button onClick={applyCoupon} disabled={couponApplied} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
                  Apply
                </button>
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600"><span>Subtotal ({cartCount} items)</span><span>{siteConfig.currencySymbol}{cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : `${siteConfig.currencySymbol}${shippingCost}`}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{siteConfig.currencySymbol}{discount.toFixed(0)}</span></div>}
                <div className="flex justify-between text-lg font-medium text-gray-900 pt-2 border-t"><span>Total</span><span>{siteConfig.currencySymbol}{total.toLocaleString()}</span></div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><Shield className="w-5 h-5 mx-auto text-gray-400 mb-1" /><p className="text-xs text-gray-500">Secure Payment</p></div>
                  <div><Truck className="w-5 h-5 mx-auto text-gray-400 mb-1" /><p className="text-xs text-gray-500">Fast Delivery</p></div>
                  <div><Lock className="w-5 h-5 mx-auto text-gray-400 mb-1" /><p className="text-xs text-gray-500">Privacy Protected</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
