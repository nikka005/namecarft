import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings, Tags,
  LogOut, Menu, X, ChevronDown, Search, Bell, Plus, Edit, Trash2,
  Eye, CheckCircle, Clock, XCircle, TrendingUp, DollarSign, UserCheck
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Admin Context
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
        toast({ title: 'Admin account created!', description: 'You can now login.' });
        setIsSetup(false);
      } else {
        await onLogin(email, password);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Login failed',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif italic text-gray-900">
            Name <span className="font-normal">Strings</span>
          </h1>
          <p className="text-gray-500 mt-2">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSetup && (
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait...' : isSetup ? 'Create Admin' : 'Login'}
          </Button>
        </form>

        <button
          onClick={() => setIsSetup(!isSetup)}
          className="w-full text-center text-sm text-gray-500 mt-4 hover:text-gray-700"
        >
          {isSetup ? 'Already have an account? Login' : 'First time? Setup admin account'}
        </button>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Tags },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform lg:transform-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-serif italic">
              Name <span className="font-normal">Strings</span>
            </h1>
            <button onClick={() => setIsOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>

        <nav className="px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
          >
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
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Total Revenue', value: `₹${(stats?.stats?.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats?.stats?.total_orders || 0, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Total Users', value: stats?.stats?.total_users || 0, icon: UserCheck, color: 'bg-purple-500' },
    { label: 'Products', value: stats?.stats?.total_products || 0, icon: Package, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
        {stats?.recent_orders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b">
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{order.order_number}</td>
                    <td className="py-3">{order.shipping_address?.email || 'N/A'}</td>
                    <td className="py-3">₹{order.total?.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.order_status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No orders yet</p>
        )}
      </div>
    </div>
  );
};

// Orders Tab
const OrdersTab = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [token, statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await axios.get(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { order_status: newStatus }
      });
      toast({ title: 'Order updated successfully' });
      fetchOrders();
    } catch (error) {
      toast({ title: 'Failed to update order', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Orders</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading orders...</div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500 text-sm">
                  <th className="px-6 py-4">Order #</th>
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
                  <tr key={order.id} className="border-t">
                    <td className="px-6 py-4 font-medium">{order.order_number}</td>
                    <td className="px-6 py-4">
                      <div>{order.shipping_address?.first_name} {order.shipping_address?.last_name}</div>
                      <div className="text-sm text-gray-500">{order.shipping_address?.email}</div>
                    </td>
                    <td className="px-6 py-4">{order.items?.length || 0} items</td>
                    <td className="px-6 py-4 font-medium">₹{order.total?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                        order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        value={order.order_status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
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
                      <button className="text-gray-500 hover:text-gray-700">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">No orders found</div>
        )}
      </div>
    </div>
  );
};

// Products Tab
const ProductsTab = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API}/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Product deleted successfully' });
      fetchProducts();
    } catch (error) {
      toast({ title: 'Failed to delete product', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
        <Button onClick={() => { setEditingProduct(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <ProductForm
          token={token}
          product={editingProduct}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); fetchProducts(); }}
        />
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading products...</div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500 text-sm">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">₹{product.price?.toLocaleString()}</div>
                      {product.original_price > product.price && (
                        <div className="text-sm text-gray-500 line-through">
                          ₹{product.original_price?.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{product.stock_quantity || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingProduct(product); setShowForm(true); }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">No products found</div>
        )}
      </div>
    </div>
  );
};

// Product Form Component
const ProductForm = ({ token, product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    price: product?.price || '',
    original_price: product?.original_price || '',
    discount: product?.discount || 0,
    image: product?.image || '',
    hover_image: product?.hover_image || '',
    category: product?.category || 'for-her',
    is_featured: product?.is_featured || false,
    is_active: product?.is_active !== false,
    stock_quantity: product?.stock_quantity || 100,
    description: product?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) {
        await axios.put(`${API}/admin/products/${product.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/admin/products`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      toast({ title: `Product ${product ? 'updated' : 'created'} successfully` });
      onSave();
    } catch (error) {
      toast({ title: 'Failed to save product', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{product ? 'Edit Product' : 'Add New Product'}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Slug</Label>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Price (₹)</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label>Original Price (₹)</Label>
          <Input
            type="number"
            value={formData.original_price}
            onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label>Discount (%)</Label>
          <Input
            type="number"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="for-her">For Her</SelectItem>
              <SelectItem value="for-him">For Him</SelectItem>
              <SelectItem value="kids">Kids</SelectItem>
              <SelectItem value="couple">Couple</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Image URL</Label>
          <Input
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Label>Hover Image URL</Label>
          <Input
            value={formData.hover_image}
            onChange={(e) => setFormData({ ...formData, hover_image: e.target.value })}
          />
        </div>
        <div>
          <Label>Stock Quantity</Label>
          <Input
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
          />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
            />
            Featured
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            Active
          </label>
        </div>
        <div className="md:col-span-2 flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

// Users Tab
const UsersTab = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      await axios.put(`${API}/admin/users/${userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { is_active: !isActive }
      });
      toast({ title: `User ${isActive ? 'blocked' : 'activated'} successfully` });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Failed to update user', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Users</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading users...</div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500 text-sm">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-6 py-4 font-medium">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                      >
                        {user.is_active ? 'Block' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">No users found</div>
        )}
      </div>
    </div>
  );
};

// Coupons Tab
const CouponsTab = ({ token }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: 0,
    max_discount: '',
    usage_limit: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, [token]);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${API}/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(response.data || []);
    } catch (error) {
      console.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/coupons`, {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: parseFloat(formData.min_order_amount) || 0,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Coupon created successfully' });
      setShowForm(false);
      setFormData({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: 0, max_discount: '', usage_limit: '' });
      fetchCoupons();
    } catch (error) {
      toast({ title: 'Failed to create coupon', variant: 'destructive' });
    }
  };

  const deleteCoupon = async (couponId) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await axios.delete(`${API}/admin/coupons/${couponId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Coupon deleted' });
      fetchCoupons();
    } catch (error) {
      toast({ title: 'Failed to delete coupon', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Coupons</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <form onSubmit={createCoupon} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Code</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SAVE10"
                required
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={formData.discount_type} onValueChange={(value) => setFormData({ ...formData, discount_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                required
              />
            </div>
            <div>
              <Label>Min Order Amount</Label>
              <Input
                type="number"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Max Discount</Label>
              <Input
                type="number"
                value={formData.max_discount}
                onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label>Usage Limit</Label>
              <Input
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                placeholder="Unlimited"
              />
            </div>
            <div className="md:col-span-3">
              <Button type="submit">Create Coupon</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading coupons...</div>
        ) : coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500 text-sm">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Min Order</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-t">
                    <td className="px-6 py-4 font-mono font-medium">{coupon.code}</td>
                    <td className="px-6 py-4">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : `₹${coupon.discount_value}`}
                    </td>
                    <td className="px-6 py-4">₹{coupon.min_order_amount}</td>
                    <td className="px-6 py-4">
                      {coupon.used_count}/{coupon.usage_limit || '∞'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">No coupons found</div>
        )}
      </div>
    </div>
  );
};

// Settings Tab
const SettingsTab = ({ token }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data || {});
    } catch (error) {
      console.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Settings saved successfully' });
    } catch (error) {
      toast({ title: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const seedData = async () => {
    try {
      await axios.post(`${API}/admin/seed`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Data seeded successfully' });
    } catch (error) {
      toast({ title: 'Failed to seed data', variant: 'destructive' });
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <h3 className="text-lg font-medium">Site Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Site Name</Label>
            <Input
              value={settings.site_name || ''}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Tagline</Label>
            <Input
              value={settings.tagline || ''}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Top Bar Text</Label>
            <Input
              value={settings.top_bar_text || ''}
              onChange={(e) => setSettings({ ...settings, top_bar_text: e.target.value })}
            />
          </div>
        </div>

        <h3 className="text-lg font-medium pt-4">Sale Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Sale Title</Label>
            <Input
              value={settings.sale_title || ''}
              onChange={(e) => setSettings({ ...settings, sale_title: e.target.value })}
            />
          </div>
          <div>
            <Label>Sale Discount Text</Label>
            <Input
              value={settings.sale_discount || ''}
              onChange={(e) => setSettings({ ...settings, sale_discount: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={settings.sale_active || false}
              onChange={(e) => setSettings({ ...settings, sale_active: e.target.checked })}
            />
            <Label>Sale Active</Label>
          </div>
        </div>

        <h3 className="text-lg font-medium pt-4">Shipping</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Free Shipping Threshold (₹)</Label>
            <Input
              type="number"
              value={settings.free_shipping_threshold || ''}
              onChange={(e) => setSettings({ ...settings, free_shipping_threshold: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label>Shipping Cost (₹)</Label>
            <Input
              type="number"
              value={settings.shipping_cost || ''}
              onChange={(e) => setSettings({ ...settings, shipping_cost: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <h3 className="text-lg font-medium pt-4">Payment Methods</h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.upi_enabled !== false}
              onChange={(e) => setSettings({ ...settings, upi_enabled: e.target.checked })}
            />
            UPI
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.razorpay_enabled !== false}
              onChange={(e) => setSettings({ ...settings, razorpay_enabled: e.target.checked })}
            />
            Razorpay
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.stripe_enabled !== false}
              onChange={(e) => setSettings({ ...settings, stripe_enabled: e.target.checked })}
            />
            Stripe
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.cod_enabled !== false}
              onChange={(e) => setSettings({ ...settings, cod_enabled: e.target.checked })}
            />
            Cash on Delivery
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button variant="outline" onClick={seedData}>
            Seed Demo Data
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Admin Page Component
const AdminPage = () => {
  const { admin, token, login, logout, setAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        if (response.data.role === 'admin' || response.data.role === 'staff') {
          setAdmin(response.data);
        } else {
          logout();
        }
      }).catch(() => {
        logout();
      });
    }
  }, [token]);

  if (!token || !admin) {
    return <AdminLogin onLogin={login} />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab token={token} />;
      case 'orders':
        return <OrdersTab token={token} />;
      case 'products':
        return <ProductsTab token={token} />;
      case 'users':
        return <UsersTab token={token} />;
      case 'coupons':
        return <CouponsTab token={token} />;
      case 'settings':
        return <SettingsTab token={token} />;
      default:
        return <DashboardTab token={token} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-medium text-gray-900 capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Welcome, {admin.name}</span>
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              View Store
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderTab()}
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminPage;