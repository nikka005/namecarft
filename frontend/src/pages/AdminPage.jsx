import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings, Tags,
  LogOut, Menu, X, Plus, Edit, Trash2, Eye, Image, Mail, Globe,
  CreditCard, Smartphone, Truck, DollarSign, UserCheck, TrendingUp,
  Search, Download, RefreshCw, Save, Send, Check, AlertCircle,
  CheckCircle, XCircle
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

// Custom hook for admin auth
const useAdmin = () => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { token: newToken, user } = response.data;
    if (user.role !== 'admin' && user.role !== 'staff') {
      throw new Error('Admin access required');
    }
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
    setAdmin(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
  };

  return { admin, token, login, logout, setAdmin };
};

// API helper with auth
const api = {
  get: (url, token) => axios.get(`${API}${url}`, { headers: { Authorization: `Bearer ${token}` } }),
  post: (url, data, token) => axios.post(`${API}${url}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  put: (url, data, token) => axios.put(`${API}${url}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  delete: (url, token) => axios.delete(`${API}${url}`, { headers: { Authorization: `Bearer ${token}` } })
};

// Login Component
const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSetup) {
        await axios.post(`${API}/admin/setup`, { email, password, name });
        toast({ title: 'Admin created!', description: 'You can now login.' });
        setIsSetup(false);
      } else {
        await onLogin(email, password);
      }
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.detail || 'Login failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif italic text-gray-900">Name <span className="font-normal">Craft</span></h1>
          <p className="text-gray-500 mt-2">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSetup && (
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600" disabled={loading}>
            {loading ? 'Please wait...' : isSetup ? 'Create Admin' : 'Login'}
          </Button>
        </form>
        <button onClick={() => setIsSetup(!isSetup)} className="w-full text-center text-sm text-gray-500 mt-4 hover:text-gray-700">
          {isSetup ? 'Already have an account? Login' : 'First time? Setup admin'}
        </button>
      </div>
    </div>
  );
};

// Sidebar
const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Tags },
    { id: 'media', label: 'Media Library', icon: Image },
    { id: 'settings', label: 'Site Settings', icon: Settings },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform lg:transform-none flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-serif italic">Name <span className="font-normal">Craft</span></h1>
            <button onClick={() => setIsOpen(false)} className="lg:hidden"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-sky-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

// Dashboard Tab
const DashboardTab = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard', token).then(res => setStats(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse p-8">Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Revenue', value: `₹${(stats?.stats?.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-green-500', change: '+12%' },
    { label: 'Total Orders', value: stats?.stats?.total_orders || 0, icon: ShoppingCart, color: 'bg-blue-500', change: '+8%' },
    { label: 'Pending Orders', value: stats?.stats?.pending_orders || 0, icon: AlertCircle, color: 'bg-yellow-500' },
    { label: 'Customers', value: stats?.stats?.total_users || 0, icon: UserCheck, color: 'bg-purple-500', change: '+5%' },
    { label: 'Products', value: stats?.stats?.total_products || 0, icon: Package, color: 'bg-orange-500' },
    { label: "Today's Orders", value: stats?.stats?.today_orders || 0, icon: TrendingUp, color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <Button variant="outline" onClick={() => window.location.reload()}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              {stat.change && <span className="text-xs text-green-600 font-medium">{stat.change}</span>}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {(stats?.recent_orders || []).slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-sm text-gray-500">{order.shipping_address?.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{order.total?.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${order.order_status === 'delivered' ? 'bg-green-100 text-green-700' : order.order_status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.order_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Order Status</h3>
          <div className="space-y-3">
            {Object.entries(stats?.order_status_stats || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="capitalize">{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Orders Tab
const OrdersTab = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);
      const res = await api.get(`/admin/orders?${params}`, token);
      setOrders(res.data.orders || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [token, statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateOrder = async (orderId, data) => {
    try {
      await api.put(`/admin/orders/${orderId}`, data, token);
      toast({ title: 'Order updated' });
      fetchOrders();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const approvePayment = async (orderId) => {
    try {
      await api.post(`/admin/orders/${orderId}/approve-payment`, {}, token);
      toast({ title: 'Payment Approved', description: 'Order has been confirmed' });
      fetchOrders();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const rejectPayment = async (orderId) => {
    try {
      await api.post(`/admin/orders/${orderId}/reject-payment`, {}, token);
      toast({ title: 'Payment Rejected' });
      fetchOrders();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const getPaymentStatusBadge = (order) => {
    const status = order.payment_status;
    const styles = {
      'paid': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'pending_verification': 'bg-blue-100 text-blue-700',
      'rejected': 'bg-red-100 text-red-700'
    };
    return (
      <div className="space-y-1">
        <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
          {status === 'pending_verification' ? 'Pending Verification' : status}
        </span>
        {order.utr_number && <p className="text-xs text-gray-500">UTR: {order.utr_number}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Orders</h2>
        <div className="flex gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? <div className="p-8 text-center">Loading...</div> : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-sm text-gray-500">
                <tr>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.shipping_address?.first_name} {order.shipping_address?.last_name}</p>
                      <p className="text-sm text-gray-500">{order.shipping_address?.phone}</p>
                    </td>
                    <td className="px-6 py-4">{order.items?.length} items</td>
                    <td className="px-6 py-4 font-medium">₹{order.total?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {getPaymentStatusBadge(order)}
                    </td>
                    <td className="px-6 py-4">
                      <Select value={order.order_status} onValueChange={(v) => updateOrder(order.id, { order_status: v })}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {order.payment_status === 'pending_verification' && (
                          <>
                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => approvePayment(order.id)} title="Approve Payment">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => rejectPayment(order.id)} title="Reject Payment">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}><Eye className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="p-8 text-center text-gray-500">No orders found</div>}
      </div>
      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Order #{selectedOrder?.order_number}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Customer</h4>
                  <p>{selectedOrder.shipping_address?.first_name} {selectedOrder.shipping_address?.last_name}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.shipping_address?.email}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.shipping_address?.phone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <p>{selectedOrder.shipping_address?.address}</p>
                  <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}</p>
                  <p>{selectedOrder.shipping_address?.pincode}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Items</h4>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-2 border-b">
                    <img src={item.image} alt="" className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Name: {item.customization?.name || 'N/A'}</p>
                      {item.customization?.metal && (
                        <p className="text-sm text-gray-500">Metal: {item.customization.metal}</p>
                      )}
                      {item.customization?.customImage && (
                        <a href={item.customization.customImage} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-600 hover:underline flex items-center gap-1">
                          📷 View Customer Photo
                        </a>
                      )}
                    </div>
                    <p>x{item.quantity}</p>
                    <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-1"><span>Subtotal</span><span>₹{selectedOrder.subtotal?.toLocaleString()}</span></div>
                <div className="flex justify-between mb-1"><span>Shipping</span><span>{selectedOrder.shipping_cost === 0 ? 'FREE' : `₹${selectedOrder.shipping_cost}`}</span></div>
                {selectedOrder.discount_amount > 0 && <div className="flex justify-between mb-1 text-green-600"><span>Discount</span><span>-₹{selectedOrder.discount_amount?.toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>₹{selectedOrder.total?.toLocaleString()}</span></div>
              </div>
              <div>
                <Label>Tracking Number</Label>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="Enter tracking number" defaultValue={selectedOrder.tracking_number || ''} id="tracking" />
                  <Button onClick={() => {
                    const tracking = document.getElementById('tracking').value;
                    updateOrder(selectedOrder.id, { tracking_number: tracking, order_status: 'shipped' });
                    setSelectedOrder(null);
                  }}>Update & Ship</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Products Tab
const ProductsTab = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${search}` : '';
      const res = await api.get(`/admin/products${params}`, token);
      setProducts(res.data.products || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [token, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`, token);
      toast({ title: 'Product deleted' });
      fetchProducts();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${API}/api/admin/products/bulk-upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        toast({ title: `✅ ${data.message}` });
        if (data.errors?.length > 0) {
          console.log('Upload errors:', data.errors);
        }
        fetchProducts();
      } else {
        toast({ title: data.detail || 'Upload failed', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleBulkUpload}
            className="hidden"
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Bulk Upload CSV'}
          </Button>
          <Button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="bg-sky-500 hover:bg-sky-600">
            <Plus className="w-4 h-4 mr-2" />Add Product
          </Button>
        </div>
      </div>
      {showForm && <ProductForm token={token} product={editingProduct} onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); fetchProducts(); }} />}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? <div className="p-8 text-center">Loading...</div> : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-sm text-gray-500">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4">📷 Photo</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">₹{product.price?.toLocaleString()}</p>
                      {product.original_price > product.price && <p className="text-sm text-gray-500 line-through">₹{product.original_price?.toLocaleString()}</p>}
                    </td>
                    <td className="px-6 py-4">{product.stock_quantity}</td>
                    <td className="px-6 py-4">{product.is_featured ? <Check className="w-5 h-5 text-green-500" /> : '-'}</td>
                    <td className="px-6 py-4">{product.allow_custom_image ? <span className="text-sky-500">📷</span> : '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{product.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingProduct(product); setShowForm(true); }}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteProduct(product.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="p-8 text-center text-gray-500">No products found</div>}
      </div>
    </div>
  );
};

// Product Form
const ProductForm = ({ token, product, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: product?.name || '', slug: product?.slug || '', description: product?.description || '',
    price: product?.price || '', original_price: product?.original_price || '', discount: product?.discount || 0,
    image: product?.image || '', hover_image: product?.hover_image || '', category: product?.category || 'for-her',
    is_featured: product?.is_featured || false, is_active: product?.is_active !== false, stock_quantity: product?.stock_quantity || 100, tags: product?.tags?.join(', ') || '',
    allow_custom_image: product?.allow_custom_image || false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, price: parseFloat(form.price), original_price: parseFloat(form.original_price), discount: parseInt(form.discount), stock_quantity: parseInt(form.stock_quantity), tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (product) await api.put(`/admin/products/${product.id}`, data, token);
      else await api.post('/admin/products', data, token);
      toast({ title: `Product ${product ? 'updated' : 'created'}` });
      onSave();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex justify-between mb-6">
        <h3 className="text-lg font-semibold">{product ? 'Edit' : 'Add'} Product</h3>
        <button onClick={onClose}><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <div><Label>Name*</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div><Label>Slug*</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
        <div><Label>Price (₹)*</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
        <div><Label>Original Price (₹)*</Label><Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} required /></div>
        <div><Label>Discount (%)</Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></div>
        <div><Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="for-her">For Her</SelectItem>
              <SelectItem value="for-him">For Him</SelectItem>
              <SelectItem value="kids">Kids</SelectItem>
              <SelectItem value="couple">Couple</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2"><Label>Image URL*</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required /></div>
        <div className="md:col-span-2"><Label>Hover Image URL</Label><Input value={form.hover_image} onChange={(e) => setForm({ ...form, hover_image: e.target.value })} /></div>
        <div><Label>Stock</Label><Input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} /></div>
        <div><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="gift, valentine" /></div>
        <div className="md:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
        <div className="md:col-span-2 flex gap-6">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />Active</label>
          <label className="flex items-center gap-2 text-sky-600"><input type="checkbox" checked={form.allow_custom_image} onChange={(e) => setForm({ ...form, allow_custom_image: e.target.checked })} />📷 Allow Customer Photo Upload</label>
        </div>
        <div className="md:col-span-2 flex gap-4">
          <Button type="submit" disabled={loading} className="bg-sky-500 hover:bg-sky-600">{loading ? 'Saving...' : product ? 'Update' : 'Create'}</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

// Customers Tab
const CustomersTab = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${search}` : '';
      const res = await api.get(`/admin/users${params}`, token);
      setUsers(res.data.users || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [token, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}`, { is_active: !isActive }, token);
      toast({ title: `User ${isActive ? 'blocked' : 'activated'}` });
      fetchUsers();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Customers</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? <div className="p-8 text-center">Loading...</div> : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-sm text-gray-500">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Orders</th>
                  <th className="px-6 py-4">Total Spent</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role === 'user').map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.role}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p>{user.email}</p>
                      <p className="text-sm text-gray-500">{user.phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">{user.orders_count || 0}</td>
                    <td className="px-6 py-4">₹{(user.total_spent || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.is_active ? 'Active' : 'Blocked'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(user.id, user.is_active)}>{user.is_active ? 'Block' : 'Activate'}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="p-8 text-center text-gray-500">No customers found</div>}
      </div>
    </div>
  );
};

// Coupons Tab  
const CouponsTab = ({ token }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: 0, max_discount: '', usage_limit: '' });

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await api.get('/admin/coupons', token);
      setCoupons(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const createCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons', {
        ...form, discount_value: parseFloat(form.discount_value),
        min_order_amount: parseFloat(form.min_order_amount) || 0,
        max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null
      }, token);
      toast({ title: 'Coupon created' });
      setShowForm(false);
      setForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: 0, max_discount: '', usage_limit: '' });
      fetchCoupons();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await api.delete(`/admin/coupons/${id}`, token); toast({ title: 'Deleted' }); fetchCoupons(); }
    catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Coupons</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-sky-500 hover:bg-sky-600"><Plus className="w-4 h-4 mr-2" />Add Coupon</Button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <form onSubmit={createCoupon} className="grid md:grid-cols-3 gap-4">
            <div><Label>Code*</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required /></div>
            <div><Label>Type</Label>
              <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Value*</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} required /></div>
            <div><Label>Min Order</Label><Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} /></div>
            <div><Label>Max Discount</Label><Input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} /></div>
            <div><Label>Usage Limit</Label><Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} /></div>
            <div className="md:col-span-3"><Button type="submit" className="bg-sky-500 hover:bg-sky-600">Create Coupon</Button></div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? <div className="p-8 text-center">Loading...</div> : coupons.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-500">
              <tr><th className="px-6 py-4">Code</th><th className="px-6 py-4">Discount</th><th className="px-6 py-4">Min Order</th><th className="px-6 py-4">Usage</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th></tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-6 py-4 font-mono font-bold">{c.code}</td>
                  <td className="px-6 py-4">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                  <td className="px-6 py-4">₹{c.min_order_amount}</td>
                  <td className="px-6 py-4">{c.used_count}/{c.usage_limit || '∞'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-6 py-4"><Button variant="ghost" size="sm" onClick={() => deleteCoupon(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="p-8 text-center text-gray-500">No coupons</div>}
      </div>
    </div>
  );
};

// Media Tab
const MediaTab = ({ token }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');

  const fetchMedia = useCallback(async () => {
    try { const res = await api.get('/admin/media', token); setMedia(res.data || []); }
    catch (e) { console.error(e); }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const addMedia = async () => {
    if (!newUrl) return;
    try {
      await api.post('/admin/media/upload', { name: newName || 'Image', url: newUrl, type: 'image' }, token);
      toast({ title: 'Image added' });
      setNewUrl(''); setNewName('');
      fetchMedia();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const deleteMedia = async (id) => {
    try { await api.delete(`/admin/media/${id}`, token); fetchMedia(); }
    catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Media Library</h2>
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-medium mb-4">Add Image by URL</h3>
        <div className="flex gap-4">
          <Input placeholder="Image name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-48" />
          <Input placeholder="Image URL" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="flex-1" />
          <Button onClick={addMedia} className="bg-sky-500 hover:bg-sky-600"><Plus className="w-4 h-4 mr-2" />Add</Button>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        {loading ? <div className="text-center py-8">Loading...</div> : media.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item) => (
              <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden border">
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(item.url); toast({ title: 'URL copied!' }); }} className="p-2 bg-white rounded-full"><Globe className="w-4 h-4" /></button>
                  <button onClick={() => deleteMedia(item.id)} className="p-2 bg-white rounded-full"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="text-center py-8 text-gray-500">No images yet</div>}
      </div>
    </div>
  );
};

// Settings Tab
const SettingsTab = ({ token }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('branding');

  useEffect(() => {
    api.get('/admin/settings', token).then(res => setSettings(res.data || {})).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const save = async () => {
    setSaving(true);
    try { await api.put('/admin/settings', settings, token); toast({ title: 'Settings saved!' }); }
    catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
    setSaving(false);
  };

  const testEmail = async () => {
    const email = prompt('Enter email to send test:');
    if (!email) return;
    try {
      await axios.post(`${API}/admin/test-email?to_email=${email}`, null, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: 'Test email sent!' });
    } catch (e) { toast({ title: 'Failed to send email', description: 'Check SMTP settings', variant: 'destructive' }); }
  };

  const seedData = async () => {
    try { await api.post('/admin/seed', null, token); toast({ title: 'Demo data seeded!' }); }
    catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const updateSetting = (key, value) => setSettings({ ...settings, [key]: value });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Site Settings</h2>
        <Button onClick={save} disabled={saving} className="bg-sky-500 hover:bg-sky-600"><Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>
      <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="branding" className="bg-white rounded-xl p-6 shadow-sm border mt-4 space-y-4">
          <h3 className="font-semibold text-lg">Branding & General</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Site Name</Label><Input value={settings.site_name || ''} onChange={(e) => updateSetting('site_name', e.target.value)} /></div>
            <div><Label>Tagline</Label><Input value={settings.tagline || ''} onChange={(e) => updateSetting('tagline', e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Logo URL</Label><Input value={settings.logo_url || ''} onChange={(e) => updateSetting('logo_url', e.target.value)} placeholder="https://..." /></div>
            <div className="md:col-span-2"><Label>Top Bar Text</Label><Input value={settings.top_bar_text || ''} onChange={(e) => updateSetting('top_bar_text', e.target.value)} /></div>
            <div><Label>Contact Email</Label><Input value={settings.contact_email || ''} onChange={(e) => updateSetting('contact_email', e.target.value)} /></div>
            <div><Label>Contact Phone</Label><Input value={settings.contact_phone || ''} onChange={(e) => updateSetting('contact_phone', e.target.value)} /></div>
            <div><Label>WhatsApp Number</Label><Input value={settings.whatsapp_number || ''} onChange={(e) => updateSetting('whatsapp_number', e.target.value)} /></div>
            <div><Label>Address</Label><Input value={settings.address || ''} onChange={(e) => updateSetting('address', e.target.value)} /></div>
          </div>
          <h3 className="font-semibold text-lg pt-4">Sale Banner</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div><Label>Sale Title</Label><Input value={settings.sale_title || ''} onChange={(e) => updateSetting('sale_title', e.target.value)} /></div>
            <div><Label>Discount Text</Label><Input value={settings.sale_discount || ''} onChange={(e) => updateSetting('sale_discount', e.target.value)} /></div>
            <div className="flex items-center gap-2 pt-6"><Switch checked={settings.sale_active || false} onCheckedChange={(v) => updateSetting('sale_active', v)} /><Label>Sale Active</Label></div>
          </div>
          <h3 className="font-semibold text-lg pt-4">Hero Section</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Hero Title</Label><Input value={settings.hero_title || ''} onChange={(e) => updateSetting('hero_title', e.target.value)} /></div>
            <div><Label>Hero CTA Text</Label><Input value={settings.hero_cta || ''} onChange={(e) => updateSetting('hero_cta', e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Hero Image URL</Label><Input value={settings.hero_image || ''} onChange={(e) => updateSetting('hero_image', e.target.value)} /></div>
            <div><Label>Hero Link</Label><Input value={settings.hero_link || ''} onChange={(e) => updateSetting('hero_link', e.target.value)} /></div>
          </div>
          <h3 className="font-semibold text-lg pt-4">Social Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Instagram</Label><Input value={settings.instagram_url || ''} onChange={(e) => updateSetting('instagram_url', e.target.value)} /></div>
            <div><Label>Facebook</Label><Input value={settings.facebook_url || ''} onChange={(e) => updateSetting('facebook_url', e.target.value)} /></div>
            <div><Label>Twitter</Label><Input value={settings.twitter_url || ''} onChange={(e) => updateSetting('twitter_url', e.target.value)} /></div>
            <div><Label>YouTube</Label><Input value={settings.youtube_url || ''} onChange={(e) => updateSetting('youtube_url', e.target.value)} /></div>
          </div>
        </TabsContent>
        <TabsContent value="payments" className="bg-white rounded-xl p-6 shadow-sm border mt-4 space-y-4">
          <h3 className="font-semibold text-lg">Payment Methods</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3"><Smartphone className="w-5 h-5" /><div><p className="font-medium">UPI Payments</p><p className="text-sm text-gray-500">Google Pay, PhonePe, Paytm</p></div></div>
              <Switch checked={settings.upi_enabled !== false} onCheckedChange={(v) => updateSetting('upi_enabled', v)} />
            </div>
            {settings.upi_enabled !== false && <div className="ml-12"><Label>UPI ID</Label><Input value={settings.upi_id || ''} onChange={(e) => updateSetting('upi_id', e.target.value)} placeholder="yourname@upi" /></div>}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3"><CreditCard className="w-5 h-5" /><div><p className="font-medium">Razorpay</p><p className="text-sm text-gray-500">Cards, Net Banking, Wallets</p></div></div>
              <Switch checked={settings.razorpay_enabled !== false} onCheckedChange={(v) => updateSetting('razorpay_enabled', v)} />
            </div>
            {settings.razorpay_enabled !== false && (
              <div className="ml-12 grid md:grid-cols-2 gap-4">
                <div><Label>Key ID</Label><Input value={settings.razorpay_key_id || ''} onChange={(e) => updateSetting('razorpay_key_id', e.target.value)} /></div>
                <div><Label>Key Secret</Label><Input type="password" value={settings.razorpay_key_secret || ''} onChange={(e) => updateSetting('razorpay_key_secret', e.target.value)} /></div>
              </div>
            )}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3"><Globe className="w-5 h-5" /><div><p className="font-medium">Stripe</p><p className="text-sm text-gray-500">International Cards</p></div></div>
              <Switch checked={settings.stripe_enabled !== false} onCheckedChange={(v) => updateSetting('stripe_enabled', v)} />
            </div>
            {settings.stripe_enabled !== false && (
              <div className="ml-12 grid md:grid-cols-2 gap-4">
                <div><Label>Public Key</Label><Input value={settings.stripe_public_key || ''} onChange={(e) => updateSetting('stripe_public_key', e.target.value)} /></div>
                <div><Label>Secret Key</Label><Input type="password" value={settings.stripe_secret_key || ''} onChange={(e) => updateSetting('stripe_secret_key', e.target.value)} /></div>
              </div>
            )}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3"><Truck className="w-5 h-5" /><div><p className="font-medium">Cash on Delivery</p><p className="text-sm text-gray-500">Pay when delivered</p></div></div>
              <Switch checked={settings.cod_enabled !== false} onCheckedChange={(v) => updateSetting('cod_enabled', v)} />
            </div>
            {settings.cod_enabled !== false && <div className="ml-12"><Label>COD Extra Charge (₹)</Label><Input type="number" value={settings.cod_extra_charge || 0} onChange={(e) => updateSetting('cod_extra_charge', parseFloat(e.target.value) || 0)} /></div>}
          </div>
        </TabsContent>
        <TabsContent value="email" className="bg-white rounded-xl p-6 shadow-sm border mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Email Settings (SMTP)</h3>
            <Button variant="outline" onClick={testEmail}><Send className="w-4 h-4 mr-2" />Send Test Email</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>SMTP Host</Label><Input value={settings.smtp_host || 'smtp.gmail.com'} onChange={(e) => updateSetting('smtp_host', e.target.value)} /></div>
            <div><Label>SMTP Port</Label><Input type="number" value={settings.smtp_port || 587} onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))} /></div>
            <div><Label>SMTP Username (Email)</Label><Input value={settings.smtp_user || ''} onChange={(e) => updateSetting('smtp_user', e.target.value)} /></div>
            <div><Label>SMTP Password (App Password)</Label><Input type="password" value={settings.smtp_password || ''} onChange={(e) => updateSetting('smtp_password', e.target.value)} /></div>
            <div><Label>From Name</Label><Input value={settings.email_from_name || ''} onChange={(e) => updateSetting('email_from_name', e.target.value)} /></div>
            <div><Label>From Email</Label><Input value={settings.email_from_address || ''} onChange={(e) => updateSetting('email_from_address', e.target.value)} /></div>
          </div>
          <h3 className="font-semibold text-lg pt-4">Email Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3"><input type="checkbox" checked={settings.send_order_confirmation !== false} onChange={(e) => updateSetting('send_order_confirmation', e.target.checked)} />Send order confirmation email to customers</label>
            <label className="flex items-center gap-3"><input type="checkbox" checked={settings.send_shipping_notification !== false} onChange={(e) => updateSetting('send_shipping_notification', e.target.checked)} />Send shipping notification when order is shipped</label>
            <label className="flex items-center gap-3"><input type="checkbox" checked={settings.send_delivery_notification !== false} onChange={(e) => updateSetting('send_delivery_notification', e.target.checked)} />Send delivery notification when order is delivered</label>
          </div>
        </TabsContent>
        <TabsContent value="shipping" className="bg-white rounded-xl p-6 shadow-sm border mt-4 space-y-4">
          <h3 className="font-semibold text-lg">Shipping Settings</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Free Shipping Threshold (₹)</Label><Input type="number" value={settings.free_shipping_threshold || 1000} onChange={(e) => updateSetting('free_shipping_threshold', parseFloat(e.target.value))} /></div>
            <div><Label>Standard Shipping Cost (₹)</Label><Input type="number" value={settings.shipping_cost || 99} onChange={(e) => updateSetting('shipping_cost', parseFloat(e.target.value))} /></div>
            <div><Label>Express Shipping Cost (₹)</Label><Input type="number" value={settings.express_shipping_cost || 199} onChange={(e) => updateSetting('express_shipping_cost', parseFloat(e.target.value))} /></div>
          </div>
        </TabsContent>
        <TabsContent value="advanced" className="bg-white rounded-xl p-6 shadow-sm border mt-4 space-y-4">
          <h3 className="font-semibold text-lg">SEO & Analytics</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Meta Title</Label><Input value={settings.meta_title || ''} onChange={(e) => updateSetting('meta_title', e.target.value)} /></div>
            <div><Label>Google Analytics ID</Label><Input value={settings.google_analytics_id || ''} onChange={(e) => updateSetting('google_analytics_id', e.target.value)} placeholder="G-XXXXXXXXXX" /></div>
            <div className="md:col-span-2"><Label>Meta Description</Label><Textarea value={settings.meta_description || ''} onChange={(e) => updateSetting('meta_description', e.target.value)} /></div>
            <div><Label>Facebook Pixel ID</Label><Input value={settings.facebook_pixel_id || ''} onChange={(e) => updateSetting('facebook_pixel_id', e.target.value)} /></div>
          </div>
          <h3 className="font-semibold text-lg pt-4">Data Management</h3>
          <div className="flex gap-4">
            <Button variant="outline" onClick={seedData}>Seed Demo Data</Button>
            <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export Orders (CSV)</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Main Admin Page
const AdminPage = () => {
  const { admin, token, login, logout, setAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => { if (res.data.role === 'admin' || res.data.role === 'staff') setAdmin(res.data); else logout(); })
        .catch(() => logout());
    }
  }, [token, setAdmin, logout]);

  if (!token || !admin) return <AdminLogin onLogin={login} />;

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab token={token} />;
      case 'orders': return <OrdersTab token={token} />;
      case 'products': return <ProductsTab token={token} />;
      case 'customers': return <CustomersTab token={token} />;
      case 'coupons': return <CouponsTab token={token} />;
      case 'media': return <MediaTab token={token} />;
      case 'settings': return <SettingsTab token={token} />;
      default: return <DashboardTab token={token} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => { logout(); navigate('/admin'); }} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu className="w-6 h-6" /></button>
            <h2 className="text-lg font-medium capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Welcome, {admin.name}</span>
            <Link to="/" className="text-sm text-sky-500 hover:underline">View Store →</Link>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{renderTab()}</main>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminPage;
