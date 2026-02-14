import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings, Tags,
  LogOut, Menu, X, Plus, Edit, Trash2, Eye, Image, Mail, Globe,
  CreditCard, Smartphone, Truck, DollarSign, UserCheck, TrendingUp,
  Search, Download, RefreshCw, Save, Send, Check, AlertCircle,
  CheckCircle, XCircle, Upload, Star, ArrowUpRight, ArrowDownRight,
  Clock, Filter, MoreVertical, ExternalLink, ChevronRight
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

// Import advanced tabs
import AnalyticsTab from './Admin/AnalyticsTab';
import StaffTab from './Admin/StaffTab';
import ReportsTab from './Admin/ReportsTab';
import BulkOperationsTab from './Admin/BulkOperationsTab';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

// Custom hook for admin auth
const useAdmin = () => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      const savedToken = localStorage.getItem('admin_token');
      if (savedToken) {
        try {
          const response = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (response.data.role === 'admin' || response.data.role === 'staff') {
            setAdmin(response.data);
            setToken(savedToken);
          } else {
            localStorage.removeItem('admin_token');
            setToken(null);
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('admin_token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    fetchAdmin();
  }, []);

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

  return { admin, token, login, logout, setAdmin, loading };
};

// API helper with auth
const api = {
  get: (url, token) => axios.get(`${API}${url}`, { headers: { Authorization: `Bearer ${token}` } }),
  post: (url, data, token) => axios.post(`${API}${url}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  put: (url, data, token) => axios.put(`${API}${url}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  delete: (url, token) => axios.delete(`${API}${url}`, { headers: { Authorization: `Bearer ${token}` } })
};

// ==================== MODERN LOGIN COMPONENT ====================
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-sky-500/30">
              <span className="text-2xl font-bold text-white">N</span>
            </div>
            <h1 className="text-2xl font-bold text-white">NameCraft Admin</h1>
            <p className="text-slate-400 mt-2 text-sm">Sign in to manage your store</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSetup && (
              <div>
                <Label className="text-slate-300 text-sm mb-2 block">Name</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 rounded-xl" 
                  placeholder="Your name"
                  required 
                />
              </div>
            )}
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">Email</Label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 rounded-xl" 
                placeholder="admin@example.com"
                required 
                data-testid="login-email"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">Password</Label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 rounded-xl" 
                placeholder="Enter password"
                required 
                data-testid="login-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/25 transition-all duration-200" 
              disabled={loading}
              data-testid="login-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Please wait...
                </span>
              ) : isSetup ? 'Create Admin Account' : 'Sign In'}
            </Button>
          </form>
          
          <button 
            onClick={() => setIsSetup(!isSetup)} 
            className="w-full text-center text-sm text-slate-400 mt-6 hover:text-sky-400 transition-colors"
          >
            {isSetup ? 'Already have an account? Sign in' : 'First time? Create admin account'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MODERN SIDEBAR ====================
const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen, admin }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, badge: 'PRO' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Tags },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'refunds', label: 'Refunds', icon: RefreshCw },
    { id: 'bulk', label: 'Bulk Actions', icon: CheckCircle },
    { id: 'staff', label: 'Staff', icon: UserCheck },
    { id: 'reports', label: 'Reports', icon: Download },
    { id: 'navigation', label: 'Navigation', icon: Menu },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}
      
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 
          bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 
          transform transition-all duration-300 ease-out lg:transform-none flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          border-r border-slate-800/50
        `}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">NameCraft</h1>
                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        {admin && (
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 px-3 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                {admin.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{admin.name || 'Admin'}</p>
                <p className="text-xs text-slate-400 truncate">{admin.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                  data-testid={`nav-${item.id}`}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-sky-500/20 to-blue-500/10 text-white' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }
                  `}
                >
                  <div className={`
                    w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30' 
                      : 'bg-slate-800 group-hover:bg-slate-700'
                    }
                  `}>
                    <item.icon className="w-[18px] h-[18px]" />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50">
          <Link 
            to="/" 
            className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all mb-2"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
              <ExternalLink className="w-[18px] h-[18px]" />
            </div>
            <span className="text-sm font-medium">View Store</span>
          </Link>
          <button 
            onClick={onLogout} 
            data-testid="logout-btn"
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-800 group-hover:bg-red-500/20 flex items-center justify-center transition-colors">
              <LogOut className="w-[18px] h-[18px]" />
            </div>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// ==================== STATUS BADGE COMPONENT ====================
const StatusBadge = ({ status, className = '' }) => {
  const statusStyles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    shipped: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending_verification: 'bg-violet-50 text-violet-700 border-violet-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-50 text-slate-600 border-slate-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blocked: 'bg-red-50 text-red-700 border-red-200',
  };
  
  const normalizedStatus = status?.toLowerCase()?.replace(/\s+/g, '_') || 'pending';
  const style = statusStyles[normalizedStatus] || 'bg-slate-50 text-slate-600 border-slate-200';
  const displayText = status?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${style} ${className}`}>
      {displayText}
    </span>
  );
};

// ==================== STAT CARD COMPONENT ====================
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {
  const colorStyles = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
    purple: 'from-violet-500 to-violet-600 shadow-violet-500/30',
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/30',
    pink: 'from-pink-500 to-pink-600 shadow-pink-500/30',
    cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-500/30',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorStyles[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-sm text-slate-500">{title}</p>
    </div>
  );
};

// ==================== MODERN DASHBOARD TAB ====================
const DashboardTab = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard', token)
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: `₹${(stats?.stats?.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'green', trend: 'up', trendValue: '+12%' },
    { label: 'Total Orders', value: stats?.stats?.total_orders || 0, icon: ShoppingCart, color: 'blue', trend: 'up', trendValue: '+8%' },
    { label: 'Pending Orders', value: stats?.stats?.pending_orders || 0, icon: Clock, color: 'orange' },
    { label: 'Customers', value: stats?.stats?.total_users || 0, icon: Users, color: 'purple', trend: 'up', trendValue: '+5%' },
    { label: 'Products', value: stats?.stats?.total_products || 0, icon: Package, color: 'cyan' },
    { label: "Today's Orders", value: stats?.stats?.today_orders || 0, icon: TrendingUp, color: 'pink' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <StatCard key={i} title={stat.label} value={stat.value} icon={stat.icon} color={stat.color} trend={stat.trend} trendValue={stat.trendValue} />
        ))}
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Orders</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {(stats?.recent_orders || []).slice(0, 5).map((order) => (
              <div key={order.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{order.order_number}</p>
                      <p className="text-sm text-slate-500">{order.shipping_address?.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">₹{order.total?.toLocaleString()}</p>
                    <StatusBadge status={order.order_status} />
                  </div>
                </div>
              </div>
            ))}
            {(!stats?.recent_orders || stats.recent_orders.length === 0) && (
              <div className="px-6 py-12 text-center text-slate-500">
                No recent orders
              </div>
            )}
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Order Status</h3>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(stats?.order_status_stats || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'delivered' ? 'bg-emerald-500' :
                    status === 'shipped' ? 'bg-blue-500' :
                    status === 'cancelled' ? 'bg-red-500' :
                    'bg-amber-500'
                  }`}></div>
                  <span className="text-slate-600 capitalize">{status}</span>
                </div>
                <span className="font-semibold text-slate-900">{count}</span>
              </div>
            ))}
            {Object.keys(stats?.order_status_stats || {}).length === 0 && (
              <p className="text-slate-500 text-center py-4">No order data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== ORDERS TAB ====================
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
      toast({ title: 'Order updated successfully' });
      fetchOrders();
    } catch (e) { toast({ title: 'Error updating order', variant: 'destructive' }); }
  };

  const approvePayment = async (orderId) => {
    try {
      await api.post(`/admin/orders/${orderId}/approve-payment`, {}, token);
      toast({ title: 'Payment approved', description: 'Order has been confirmed' });
      fetchOrders();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const rejectPayment = async (orderId) => {
    try {
      await api.post(`/admin/orders/${orderId}/reject-payment`, {}, token);
      toast({ title: 'Payment rejected' });
      fetchOrders();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search orders..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-10 bg-white border-slate-200"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-white">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Filter" />
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

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500">Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{order.order_number}</p>
                      <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{order.shipping_address?.first_name} {order.shipping_address?.last_name}</p>
                      <p className="text-sm text-slate-500">{order.shipping_address?.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{order.items?.length} items</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">₹{order.total?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.payment_status} />
                      {order.utr_number && <p className="text-xs text-slate-400 mt-1">UTR: {order.utr_number}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <Select value={order.order_status} onValueChange={(v) => updateOrder(order.id, { order_status: v })}>
                        <SelectTrigger className="w-32 h-9 text-xs"><SelectValue /></SelectTrigger>
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
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => approvePayment(order.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => rejectPayment(order.id)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-slate-600" />
              </div>
              Order #{selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-slate-900 mb-2">Customer</h4>
                  <p className="text-slate-700">{selectedOrder.shipping_address?.first_name} {selectedOrder.shipping_address?.last_name}</p>
                  <p className="text-sm text-slate-500">{selectedOrder.shipping_address?.email}</p>
                  <p className="text-sm text-slate-500">{selectedOrder.shipping_address?.phone}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-slate-900 mb-2">Shipping Address</h4>
                  <p className="text-slate-700">{selectedOrder.shipping_address?.address}</p>
                  <p className="text-slate-600">{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}</p>
                  <p className="text-slate-600">{selectedOrder.shipping_address?.pincode}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                      <img src={item.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">Name: {item.customization?.name || 'N/A'}</p>
                        {item.customization?.metal && <p className="text-sm text-slate-500">Metal: {item.customization.metal}</p>}
                      </div>
                      <p className="text-slate-600">x{item.quantity}</p>
                      <p className="font-semibold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 rounded-xl">
                <div className="flex justify-between mb-2"><span className="text-slate-600">Subtotal</span><span className="text-slate-900">₹{selectedOrder.subtotal?.toLocaleString()}</span></div>
                <div className="flex justify-between mb-2"><span className="text-slate-600">Shipping</span><span className="text-slate-900">{selectedOrder.shipping_cost === 0 ? 'FREE' : `₹${selectedOrder.shipping_cost}`}</span></div>
                {selectedOrder.discount_amount > 0 && <div className="flex justify-between mb-2 text-emerald-600"><span>Discount</span><span>-₹{selectedOrder.discount_amount?.toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 mt-2"><span className="text-slate-900">Total</span><span className="text-slate-900">₹{selectedOrder.total?.toLocaleString()}</span></div>
              </div>
              
              <div>
                <Label className="text-slate-700">Tracking Number</Label>
                <div className="flex gap-2 mt-2">
                  <Input placeholder="Enter tracking number" defaultValue={selectedOrder.tracking_number || ''} id="tracking" className="flex-1" />
                  <Button onClick={() => {
                    const tracking = document.getElementById('tracking').value;
                    updateOrder(selectedOrder.id, { tracking_number: tracking, order_status: 'shipped' });
                    setSelectedOrder(null);
                  }} className="bg-sky-500 hover:bg-sky-600">Update & Ship</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ==================== PRODUCTS TAB ====================
const ProductsTab = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

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

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      toast({ title: 'Please upload a CSV file', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${BACKEND_URL}/api/admin/products/bulk-upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      toast({ title: `${data.message}` });
      fetchProducts();
    } catch (err) {
      toast({ title: `Upload failed: ${err.message}`, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white" />
        </div>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleBulkUpload} className="hidden" />
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload className="w-4 h-4 mr-2" />{uploading ? 'Uploading...' : 'Bulk Upload'}
        </Button>
        <Button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="bg-sky-500 hover:bg-sky-600">
          <Plus className="w-4 h-4 mr-2" />Add Product
        </Button>
      </div>

      {/* Product Form */}
      {showForm && <ProductForm token={token} product={editingProduct} onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); fetchProducts(); }} />}

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative aspect-square bg-slate-100">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {product.is_featured && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-lg">Featured</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 truncate">{product.name}</h3>
                <p className="text-sm text-slate-500 mb-2">{product.category}</p>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-900">₹{product.price?.toLocaleString()}</p>
                    {product.original_price > product.price && (
                      <p className="text-xs text-slate-400 line-through">₹{product.original_price?.toLocaleString()}</p>
                    )}
                  </div>
                  <StatusBadge status={product.is_active ? 'active' : 'inactive'} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditingProduct(product); setShowForm(true); }}>
                    <Edit className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => deleteProduct(product.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No products found</p>
        </div>
      )}
    </div>
  );
};

// ==================== PRODUCT FORM ====================
const ProductForm = ({ token, product, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: product?.name || '', slug: product?.slug || '', description: product?.description || '',
    price: product?.price || '', original_price: product?.original_price || '', discount: product?.discount || 0,
    image: product?.image || '', hover_image: product?.hover_image || '', category: product?.category || 'for-her',
    is_featured: product?.is_featured || false, is_active: product?.is_active !== false, stock_quantity: product?.stock_quantity || 100, 
    tags: product?.tags?.join(', ') || '', allow_custom_image: product?.allow_custom_image || false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, price: parseFloat(form.price), original_price: parseFloat(form.original_price), discount: parseInt(form.discount), stock_quantity: parseInt(form.stock_quantity), tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (product) await api.put(`/admin/products/${product.id}`, data, token);
      else await api.post('/admin/products', data, token);
      toast({ title: `Product ${product ? 'updated' : 'created'} successfully` });
      onSave();
    } catch (e) { toast({ title: 'Error saving product', variant: 'destructive' }); }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{product ? 'Edit Product' : 'Add New Product'}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div><Label className="text-slate-700 mb-1.5 block">Name*</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><Label className="text-slate-700 mb-1.5 block">Slug*</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
          <div><Label className="text-slate-700 mb-1.5 block">Price (₹)*</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
          <div><Label className="text-slate-700 mb-1.5 block">Original Price (₹)*</Label><Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} required /></div>
          <div><Label className="text-slate-700 mb-1.5 block">Discount (%)</Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></div>
          <div>
            <Label className="text-slate-700 mb-1.5 block">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="for-her">For Her</SelectItem>
                <SelectItem value="for-him">For Him</SelectItem>
                <SelectItem value="couples">Couples</SelectItem>
                <SelectItem value="personalized-gifts">Personalized</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2"><Label className="text-slate-700 mb-1.5 block">Image URL*</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required /></div>
          <div className="md:col-span-2"><Label className="text-slate-700 mb-1.5 block">Hover Image URL</Label><Input value={form.hover_image} onChange={(e) => setForm({ ...form, hover_image: e.target.value })} /></div>
          <div><Label className="text-slate-700 mb-1.5 block">Stock</Label><Input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} /></div>
          <div><Label className="text-slate-700 mb-1.5 block">Tags</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="gift, valentine" /></div>
          <div className="md:col-span-2"><Label className="text-slate-700 mb-1.5 block">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
        </div>
        <div className="flex flex-wrap gap-6 py-4 border-t border-slate-100 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 rounded border-slate-300" />
            <span className="text-sm text-slate-700">Featured Product</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded border-slate-300" />
            <span className="text-sm text-slate-700">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sky-600">
            <input type="checkbox" checked={form.allow_custom_image} onChange={(e) => setForm({ ...form, allow_custom_image: e.target.checked })} className="w-4 h-4 rounded border-slate-300" />
            <span className="text-sm">Allow Photo Upload</span>
          </label>
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="bg-sky-500 hover:bg-sky-600">{loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

// ==================== CUSTOMERS TAB ====================
const CustomersTab = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : users.filter(u => u.role === 'user').length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Orders</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Total Spent</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.filter(u => u.role === 'user').map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700">{user.email}</p>
                      <p className="text-sm text-slate-500">{user.phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{user.orders_count || 0}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">₹{(user.total_spent || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={user.is_active ? 'active' : 'blocked'} /></td>
                    <td className="px-6 py-4">
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(user.id, user.is_active)}>
                        {user.is_active ? 'Block' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No customers found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== COUPONS TAB ====================
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
      toast({ title: 'Coupon created successfully' });
      setShowForm(false);
      setForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: 0, max_discount: '', usage_limit: '' });
      fetchCoupons();
    } catch (e) { toast({ title: 'Error creating coupon', variant: 'destructive' }); }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try { await api.delete(`/admin/coupons/${id}`, token); toast({ title: 'Coupon deleted' }); fetchCoupons(); }
    catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} className="bg-sky-500 hover:bg-sky-600">
          <Plus className="w-4 h-4 mr-2" />Add Coupon
        </Button>
      </div>
      
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Create New Coupon</h3>
          <form onSubmit={createCoupon} className="grid md:grid-cols-3 gap-4">
            <div><Label className="text-slate-700 mb-1.5 block">Code*</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required /></div>
            <div>
              <Label className="text-slate-700 mb-1.5 block">Type</Label>
              <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label className="text-slate-700 mb-1.5 block">Value*</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} required /></div>
            <div><Label className="text-slate-700 mb-1.5 block">Min Order (₹)</Label><Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} /></div>
            <div><Label className="text-slate-700 mb-1.5 block">Max Discount (₹)</Label><Input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} /></div>
            <div><Label className="text-slate-700 mb-1.5 block">Usage Limit</Label><Input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} /></div>
            <div className="md:col-span-3 flex gap-3">
              <Button type="submit" className="bg-sky-500 hover:bg-sky-600">Create Coupon</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : coupons.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Discount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Min Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Usage</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{c.code}</td>
                  <td className="px-6 py-4 text-slate-700">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                  <td className="px-6 py-4 text-slate-600">₹{c.min_order_amount}</td>
                  <td className="px-6 py-4 text-slate-600">{c.used_count}/{c.usage_limit || '∞'}</td>
                  <td className="px-6 py-4"><StatusBadge status={c.is_active ? 'active' : 'inactive'} /></td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => deleteCoupon(c.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Tags className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No coupons found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== REVIEWS TAB ====================
const ReviewsTab = ({ token }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews', token);
      setReviews(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const updateReviewStatus = async (reviewId, approved) => {
    try {
      await api.put(`/admin/reviews/${reviewId}?approved=${approved}`, {}, token);
      toast({ title: approved ? 'Review approved' : 'Review rejected' });
      fetchReviews();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try { await api.delete(`/admin/reviews/${id}`, token); toast({ title: 'Review deleted' }); fetchReviews(); }
    catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === 'pending') return !r.approved;
    if (filter === 'approved') return r.approved;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {['all', 'pending', 'approved'].map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className="capitalize">
            {f} {f === 'pending' && `(${reviews.filter(r => !r.approved).length})`}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <StatusBadge status={review.approved ? 'approved' : 'pending'} />
                    {review.verified_purchase && (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Verified</span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-900">{review.reviewer_name}</p>
                  <p className="text-sm text-slate-500 mb-2">{review.reviewer_email}</p>
                  {review.title && <p className="font-medium text-slate-800">{review.title}</p>}
                  <p className="text-slate-600 text-sm">{review.comment}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {!review.approved ? (
                    <Button size="sm" onClick={() => updateReviewStatus(review.id, true)} className="bg-emerald-500 hover:bg-emerald-600">
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => updateReviewStatus(review.id, false)}>
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => deleteReview(review.id)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== REFUNDS TAB ====================
const RefundsTab = ({ token }) => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ order_id: '', amount: '', reason: '' });
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/admin/refunds${params}`, token);
      setRefunds(res.data.refunds || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [token, statusFilter]);

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);

  const createRefund = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/refunds', { ...form, amount: parseFloat(form.amount) }, token);
      toast({ title: 'Refund request created' });
      setShowForm(false);
      setForm({ order_id: '', amount: '', reason: '' });
      fetchRefunds();
    } catch (e) { toast({ title: 'Error', description: e.response?.data?.detail, variant: 'destructive' }); }
  };

  const updateRefundStatus = async (refundId, status) => {
    try {
      await api.put(`/admin/refunds/${refundId}`, { status }, token);
      toast({ title: `Refund ${status}` });
      fetchRefunds();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const deleteRefund = async (id) => {
    if (!window.confirm('Delete this refund request?')) return;
    try { await api.delete(`/admin/refunds/${id}`, token); toast({ title: 'Deleted' }); fetchRefunds(); }
    catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-44 bg-white">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1"></div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-sky-500 hover:bg-sky-600">
          <Plus className="w-4 h-4 mr-2" />New Refund
        </Button>
      </div>
      
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Create Refund Request</h3>
          <form onSubmit={createRefund} className="grid md:grid-cols-3 gap-4">
            <div><Label className="text-slate-700 mb-1.5 block">Order ID</Label><Input value={form.order_id} onChange={(e) => setForm({...form, order_id: e.target.value})} required /></div>
            <div><Label className="text-slate-700 mb-1.5 block">Amount (₹)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} required /></div>
            <div><Label className="text-slate-700 mb-1.5 block">Reason</Label><Input value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} required /></div>
            <div className="md:col-span-3 flex gap-3">
              <Button type="submit" className="bg-sky-500 hover:bg-sky-600">Create Refund</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : refunds.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Order #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {refunds.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-900">{r.order_number}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{r.user_email}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">₹{r.amount?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{r.reason}</td>
                  <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {r.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => updateRefundStatus(r.id, 'approved')}><Check className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => updateRefundStatus(r.id, 'rejected')}><XCircle className="w-4 h-4" /></Button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <Button variant="outline" size="sm" onClick={() => updateRefundStatus(r.id, 'processed')}>Process</Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteRefund(r.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No refund requests</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== NAVIGATION TAB ====================
const NavigationTab = ({ token }) => {
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', href: '', order: 0, highlight: false });
  const [editingId, setEditingId] = useState(null);

  const fetchNavigation = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/navigation', token);
      setNavItems(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchNavigation(); }, [fetchNavigation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/navigation/${editingId}`, form, token);
        toast({ title: 'Navigation updated' });
      } else {
        await api.post('/admin/navigation', form, token);
        toast({ title: 'Navigation item added' });
      }
      setShowForm(false);
      setForm({ name: '', href: '', order: 0, highlight: false });
      setEditingId(null);
      fetchNavigation();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const editItem = (item) => {
    setForm({ name: item.name, href: item.href, order: item.order || 0, highlight: item.highlight || false });
    setEditingId(item.id);
    setShowForm(true);
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this navigation item?')) return;
    try { await api.delete(`/admin/navigation/${id}`, token); toast({ title: 'Deleted' }); fetchNavigation(); }
    catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const seedDefaults = async () => {
    try {
      const res = await api.post('/admin/navigation/seed', {}, token);
      toast({ title: `Added ${res.data.added} navigation items` });
      fetchNavigation();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const toggleActive = async (item) => {
    try {
      await api.put(`/admin/navigation/${item.id}`, { is_active: !item.is_active }, token);
      fetchNavigation();
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={seedDefaults}>Seed Defaults</Button>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', href: '', order: 0, highlight: false }); }} className="bg-sky-500 hover:bg-sky-600">
          <Plus className="w-4 h-4 mr-2" />{editingId ? 'Cancel' : 'Add Item'}
        </Button>
      </div>
      
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">{editingId ? 'Edit Navigation Item' : 'Add Navigation Item'}</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-4">
            <div><Label className="text-slate-700 mb-1.5 block">Name</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
            <div><Label className="text-slate-700 mb-1.5 block">Link</Label><Input value={form.href} onChange={(e) => setForm({...form, href: e.target.value})} required /></div>
            <div><Label className="text-slate-700 mb-1.5 block">Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({...form, order: parseInt(e.target.value) || 0})} /></div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2"><Switch checked={form.highlight} onCheckedChange={(v) => setForm({...form, highlight: v})} /><span className="text-sm text-slate-700">Highlight</span></label>
              <Button type="submit" className="bg-sky-500 hover:bg-sky-600">{editingId ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : navItems.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Link</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Highlight</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {navItems.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-slate-900">{item.order || 0}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.href}</td>
                  <td className="px-6 py-4">{item.highlight ? <span className="text-sky-500 font-medium">Yes</span> : <span className="text-slate-400">No</span>}</td>
                  <td className="px-6 py-4"><Switch checked={item.is_active !== false} onCheckedChange={() => toggleActive(item)} /></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editItem(item)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteItem(item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Menu className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium mb-3">No navigation items</p>
            <Button onClick={seedDefaults}>Seed Default Items</Button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== MEDIA TAB ====================
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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Add Image by URL</h3>
        <div className="flex gap-4 flex-wrap">
          <Input placeholder="Image name" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1 min-w-48" />
          <Input placeholder="Image URL" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="flex-[2] min-w-64" />
          <Button onClick={addMedia} className="bg-sky-500 hover:bg-sky-600"><Plus className="w-4 h-4 mr-2" />Add Image</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
              <div className="aspect-square bg-slate-100 relative">
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button size="icon" variant="destructive" className="h-9 w-9" onClick={() => deleteMedia(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No media files</p>
        </div>
      )}
    </div>
  );
};

// ==================== SETTINGS TAB ====================
const SettingsTab = ({ token }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings', token)
      .then(res => setSettings(res.data || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', settings, token);
      toast({ title: 'Settings saved successfully' });
    } catch (e) {
      toast({ title: 'Error saving settings', variant: 'destructive' });
    }
    setSaving(false);
  };

  const sendTestEmail = async () => {
    try {
      await api.post('/admin/settings/test-email', {}, token);
      toast({ title: 'Test email sent!' });
    } catch (e) {
      toast({ title: 'Failed to send test email', variant: 'destructive' });
    }
  };

  const seedData = async () => {
    if (!window.confirm('This will add demo data. Continue?')) return;
    try {
      await api.post('/admin/seed-data', {}, token);
      toast({ title: 'Demo data added successfully' });
    } catch (e) {
      toast({ title: 'Error seeding data', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Tabs defaultValue="general">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg">General</TabsTrigger>
          <TabsTrigger value="shipping" className="rounded-lg">Shipping</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg">Payments</TabsTrigger>
          <TabsTrigger value="email" className="rounded-lg">Email</TabsTrigger>
          <TabsTrigger value="seo" className="rounded-lg">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 mb-4">Store Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label className="text-slate-700 mb-1.5 block">Store Name</Label><Input value={settings.store_name || ''} onChange={(e) => setSettings({...settings, store_name: e.target.value})} /></div>
              <div><Label className="text-slate-700 mb-1.5 block">Contact Email</Label><Input type="email" value={settings.contact_email || ''} onChange={(e) => setSettings({...settings, contact_email: e.target.value})} /></div>
              <div><Label className="text-slate-700 mb-1.5 block">Contact Phone</Label><Input value={settings.contact_phone || ''} onChange={(e) => setSettings({...settings, contact_phone: e.target.value})} /></div>
              <div><Label className="text-slate-700 mb-1.5 block">Currency</Label><Input value={settings.currency || 'INR'} onChange={(e) => setSettings({...settings, currency: e.target.value})} /></div>
            </div>
            <div><Label className="text-slate-700 mb-1.5 block">Store Address</Label><Textarea value={settings.store_address || ''} onChange={(e) => setSettings({...settings, store_address: e.target.value})} rows={2} /></div>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 mb-4">Shipping Settings</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label className="text-slate-700 mb-1.5 block">Shipping Cost (₹)</Label><Input type="number" value={settings.shipping_cost || 0} onChange={(e) => setSettings({...settings, shipping_cost: parseInt(e.target.value)})} /></div>
              <div><Label className="text-slate-700 mb-1.5 block">Free Shipping Above (₹)</Label><Input type="number" value={settings.free_shipping_threshold || 0} onChange={(e) => setSettings({...settings, free_shipping_threshold: parseInt(e.target.value)})} /></div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 mb-4">Payment Settings</h3>
            <div><Label className="text-slate-700 mb-1.5 block">Razorpay Key ID</Label><Input value={settings.razorpay_key_id || ''} onChange={(e) => setSettings({...settings, razorpay_key_id: e.target.value})} /></div>
            <div><Label className="text-slate-700 mb-1.5 block">Razorpay Key Secret</Label><Input type="password" value={settings.razorpay_key_secret || ''} onChange={(e) => setSettings({...settings, razorpay_key_secret: e.target.value})} /></div>
            <div className="flex items-center gap-3 pt-4">
              <Switch checked={settings.enable_cod} onCheckedChange={(v) => setSettings({...settings, enable_cod: v})} />
              <Label className="text-slate-700">Enable Cash on Delivery</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={settings.enable_upi} onCheckedChange={(v) => setSettings({...settings, enable_upi: v})} />
              <Label className="text-slate-700">Enable UPI Payments</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 mb-4">Email Configuration</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label className="text-slate-700 mb-1.5 block">SMTP Email</Label><Input type="email" value={settings.smtp_email || ''} onChange={(e) => setSettings({...settings, smtp_email: e.target.value})} /></div>
              <div><Label className="text-slate-700 mb-1.5 block">SMTP Password</Label><Input type="password" value={settings.smtp_password || ''} onChange={(e) => setSettings({...settings, smtp_password: e.target.value})} /></div>
              <div><Label className="text-slate-700 mb-1.5 block">SMTP Server</Label><Input value={settings.smtp_server || 'smtp.gmail.com'} onChange={(e) => setSettings({...settings, smtp_server: e.target.value})} /></div>
              <div><Label className="text-slate-700 mb-1.5 block">SMTP Port</Label><Input type="number" value={settings.smtp_port || 587} onChange={(e) => setSettings({...settings, smtp_port: parseInt(e.target.value)})} /></div>
            </div>
            <Button variant="outline" onClick={sendTestEmail}><Send className="w-4 h-4 mr-2" />Send Test Email</Button>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 mb-4">SEO & Analytics</h3>
            <div><Label className="text-slate-700 mb-1.5 block">Meta Title</Label><Input value={settings.meta_title || ''} onChange={(e) => setSettings({...settings, meta_title: e.target.value})} /></div>
            <div><Label className="text-slate-700 mb-1.5 block">Meta Description</Label><Textarea value={settings.meta_description || ''} onChange={(e) => setSettings({...settings, meta_description: e.target.value})} rows={2} /></div>
            <div><Label className="text-slate-700 mb-1.5 block">Google Analytics ID</Label><Input value={settings.ga_id || ''} onChange={(e) => setSettings({...settings, ga_id: e.target.value})} placeholder="G-XXXXXXXXXX" /></div>
            <div><Label className="text-slate-700 mb-1.5 block">Facebook Pixel ID</Label><Input value={settings.fb_pixel || ''} onChange={(e) => setSettings({...settings, fb_pixel: e.target.value})} /></div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button onClick={saveSettings} disabled={saving} className="bg-sky-500 hover:bg-sky-600">
          <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button variant="outline" onClick={seedData}><Download className="w-4 h-4 mr-2" />Seed Demo Data</Button>
      </div>
    </div>
  );
};

// ==================== MAIN ADMIN PAGE ====================
const AdminPage = () => {
  const { admin, token, login, logout, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token || !admin) return <AdminLogin onLogin={login} />;

  const getPageTitle = () => {
    const titles = {
      dashboard: { title: 'Dashboard', subtitle: 'Welcome back! Here\'s your store overview' },
      analytics: { title: 'Analytics', subtitle: 'Track your store performance metrics' },
      orders: { title: 'Orders', subtitle: 'Manage and track customer orders' },
      products: { title: 'Products', subtitle: 'Manage your product catalog' },
      customers: { title: 'Customers', subtitle: 'View and manage your customers' },
      coupons: { title: 'Coupons', subtitle: 'Create and manage discount codes' },
      reviews: { title: 'Reviews', subtitle: 'Moderate customer reviews' },
      refunds: { title: 'Refunds', subtitle: 'Process refund requests' },
      bulk: { title: 'Bulk Operations', subtitle: 'Perform batch actions on multiple items' },
      staff: { title: 'Staff Management', subtitle: 'Manage team members and permissions' },
      reports: { title: 'Reports', subtitle: 'Export data and generate reports' },
      navigation: { title: 'Navigation', subtitle: 'Configure site navigation' },
      media: { title: 'Media Library', subtitle: 'Manage images and media files' },
      settings: { title: 'Settings', subtitle: 'Configure your store settings' },
    };
    return titles[activeTab] || { title: activeTab, subtitle: '' };
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab token={token} />;
      case 'orders': return <OrdersTab token={token} />;
      case 'products': return <ProductsTab token={token} />;
      case 'customers': return <CustomersTab token={token} />;
      case 'coupons': return <CouponsTab token={token} />;
      case 'reviews': return <ReviewsTab token={token} />;
      case 'refunds': return <RefundsTab token={token} />;
      case 'analytics': return <AnalyticsTab token={token} api={api} />;
      case 'staff': return <StaffTab token={token} api={api} />;
      case 'reports': return <ReportsTab token={token} api={api} />;
      case 'bulk': return <BulkOperationsTab token={token} api={api} />;
      case 'navigation': return <NavigationTab token={token} />;
      case 'media': return <MediaTab token={token} />;
      case 'settings': return <SettingsTab token={token} />;
      default: return <DashboardTab token={token} />;
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="min-h-screen bg-slate-50 flex" data-testid="admin-panel">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => { logout(); navigate('/admin'); }} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        admin={admin}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
                data-testid="mobile-menu-btn"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{title}</h1>
                <p className="text-sm text-slate-500">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-slate-500">Welcome, <span className="font-semibold text-slate-700">{admin.name}</span></span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">View Store</span>
                </Link>
              </Button>
            </div>
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
