import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, LogOut, ChevronRight, Clock, CheckCircle, Truck, Box, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { toast } from '../hooks/use-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const AccountPage = () => {
  const { user, token, logout, updateProfile, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/account' } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [token, isAuthenticated]);

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out', description: 'You have been logged out successfully.' });
    navigate('/');
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData);
      setEditing(false);
      toast({ title: 'Profile updated', description: 'Your profile has been saved.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'processing': return <Box className="w-4 h-4 text-purple-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-orange-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-purple-100 text-purple-700';
      case 'shipped': return 'bg-orange-100 text-orange-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif text-gray-900">Hello, {user?.name?.split(' ')[0] || 'there'}!</h1>
              <p className="text-gray-500 mt-1">Manage your orders and account settings</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-gray-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-sky-50 text-sky-600 border-l-4 border-sky-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">My Orders</h2>
                
                {loading ? (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
                    <Link to="/collections/all" className="inline-block px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {/* Order Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Order #{order.order_number}</p>
                            <p className="text-sm text-gray-500">
                              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { 
                                day: 'numeric', month: 'short', year: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                              {getStatusIcon(order.order_status)}
                              <span className="ml-1 capitalize">{order.order_status}</span>
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-4">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex gap-4 mb-3 last:mb-0">
                              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.name}</p>
                                {item.customization?.name && (
                                  <p className="text-sm text-gray-500">Name: {item.customization.name}</p>
                                )}
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <span className="ml-2 font-semibold text-gray-900">₹{order.total?.toLocaleString()}</span>
                          </div>
                          {order.payment_status === 'pending_verification' && (
                            <span className="text-sm text-blue-600">Payment pending verification</span>
                          )}
                          {order.tracking_number && (
                            <span className="text-sm text-gray-600">Tracking: {order.tracking_number}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  {!editing ? (
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} className="bg-sky-500 hover:bg-sky-600 text-white">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={profileData.email}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
                  {!editing ? (
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} className="bg-sky-500 hover:bg-sky-600 text-white">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      disabled={!editing}
                      placeholder="House number, Street name"
                      className="mt-1"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>City</Label>
                      <Input
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        disabled={!editing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        value={profileData.state}
                        onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                        disabled={!editing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>PIN Code</Label>
                      <Input
                        value={profileData.pincode}
                        onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                        disabled={!editing}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AccountPage;
