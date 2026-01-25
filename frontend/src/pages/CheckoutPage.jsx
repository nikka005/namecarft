import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, CreditCard, Truck, Shield, Smartphone, QrCode, Globe } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { siteConfig, paymentMethods } from '../data/mock';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { toast } from '../hooks/use-toast';

const iconMap = {
  'smartphone': Smartphone,
  'qr-code': QrCode,
  'credit-card': CreditCard,
  'globe': Globe,
  'truck': Truck
};

const CheckoutPage = () => {
  const { cart, cartTotal, cartCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  
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
    paymentMethod: 'upi'
  });

  const shippingCost = cartTotal >= 1000 ? 0 : 99;
  const total = cartTotal + shippingCost - discount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    
    const validCoupons = {
      'SAVE10': { type: 'percentage', value: 10 },
      'FLAT100': { type: 'fixed', value: 100 },
      'VALENTINE': { type: 'percentage', value: 15 }
    };
    
    const coupon = validCoupons[couponCode.toUpperCase()];
    if (coupon) {
      const discountAmount = coupon.type === 'percentage' 
        ? cartTotal * (coupon.value / 100)
        : coupon.value;
      setDiscount(discountAmount);
      setCouponApplied(true);
      toast({
        title: "Coupon Applied!",
        description: `You saved ${siteConfig.currencySymbol}${discountAmount.toFixed(0)}`,
      });
    } else {
      toast({
        title: "Invalid Coupon",
        description: "This coupon code is not valid.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const processingMessages = {
      'upi': 'Processing UPI payment...',
      'upi-apps': 'Generating QR code...',
      'razorpay': 'Redirecting to Razorpay...',
      'stripe': 'Processing card payment...',
      'cod': 'Confirming order...'
    };

    toast({
      title: processingMessages[formData.paymentMethod],
      description: "Please wait...",
    });

    setTimeout(() => {
      setLoading(false);
      clearCart();
      toast({
        title: "Order Placed Successfully!",
        description: "You will receive a confirmation email shortly.",
      });
      navigate('/');
    }, 2500);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
            <h1 className="text-xl font-serif italic text-gray-900">
              Name <span className="font-normal">Strings</span>
            </h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Add some items to proceed to checkout.</p>
          <Link
            to="/collections/all"
            className="inline-block px-6 py-3 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/cart" className="flex items-center gap-2 text-gray-600 hover:text-sky-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span>Back to cart</span>
          </Link>
          <Link to="/" className="text-xl font-serif italic text-gray-900">
            Name <span className="font-normal">Strings</span>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required placeholder="your@email.com" value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" required placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" name="firstName" required value={formData.firstName} onChange={handleInputChange} /></div>
                    <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" name="lastName" required value={formData.lastName} onChange={handleInputChange} /></div>
                  </div>
                  <div><Label htmlFor="address">Address</Label><Input id="address" name="address" required placeholder="House number, Street name" value={formData.address} onChange={handleInputChange} /></div>
                  <div><Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label><Input id="apartment" name="apartment" placeholder="Apartment, suite, unit, building, floor, etc." value={formData.apartment} onChange={handleInputChange} /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label htmlFor="city">City</Label><Input id="city" name="city" required value={formData.city} onChange={handleInputChange} /></div>
                    <div><Label htmlFor="state">State</Label><Input id="state" name="state" required value={formData.state} onChange={handleInputChange} /></div>
                    <div><Label htmlFor="pincode">PIN Code</Label><Input id="pincode" name="pincode" required pattern="[0-9]{6}" maxLength={6} value={formData.pincode} onChange={handleInputChange} /></div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const IconComponent = iconMap[method.icon] || CreditCard;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.paymentMethod === method.id
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input type="radio" name="paymentMethod" value={method.id} checked={formData.paymentMethod === method.id} onChange={handleInputChange} className="w-4 h-4 text-sky-500 border-gray-300 focus:ring-sky-500" />
                        <IconComponent className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 block">{method.name}</span>
                          <span className="text-sm text-gray-500">{method.description}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {formData.paymentMethod === 'upi' && (
                  <div className="mt-4"><Label htmlFor="upiId">UPI ID</Label><Input id="upiId" placeholder="yourname@upi" className="mt-1" /></div>
                )}

                {formData.paymentMethod === 'upi-apps' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                    <div className="w-32 h-32 mx-auto bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">QR code will be generated after order confirmation</p>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                {loading ? <span>Processing...</span> : <><Lock className="w-4 h-4" /><span>Place Order - {siteConfig.currencySymbol}{total.toLocaleString()}</span></>}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      {item.customization?.name && <p className="text-xs text-gray-500">Name: {item.customization.name}</p>}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{siteConfig.currencySymbol}{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="mb-4">
                <Label htmlFor="coupon">Coupon Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="coupon" placeholder="Enter code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={couponApplied} />
                  <button type="button" onClick={applyCoupon} disabled={couponApplied} className="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 disabled:bg-gray-400 transition-colors">Apply</button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Try: SAVE10, FLAT100, VALENTINE</p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal ({cartCount} items)</span><span>{siteConfig.currencySymbol}{cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>{shippingCost === 0 ? 'FREE' : `${siteConfig.currencySymbol}${shippingCost}`}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{siteConfig.currencySymbol}{discount.toFixed(0)}</span></div>}
                <Separator />
                <div className="flex justify-between text-lg font-medium text-gray-900"><span>Total</span><span>{siteConfig.currencySymbol}{total.toLocaleString()}</span></div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center gap-6 text-gray-400">
                  <div className="flex items-center gap-2"><Shield className="w-5 h-5" /><span className="text-xs">Secure</span></div>
                  <div className="flex items-center gap-2"><Truck className="w-5 h-5" /><span className="text-xs">Fast Delivery</span></div>
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