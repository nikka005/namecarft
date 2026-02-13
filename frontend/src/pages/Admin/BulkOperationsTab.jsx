import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Trash2, Edit, Package, TruckIcon, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from '../../hooks/use-toast';

const BulkOperationsTab = ({ token, api }) => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [bulkStatus, setBulkStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/admin/orders?limit=100', token),
        api.get('/admin/products?limit=100', token)
      ]);
      setOrders(ordersRes.data.orders || []);
      setProducts(productsRes.data.products || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const bulkUpdateOrderStatus = async () => {
    if (!bulkStatus || selectedOrders.length === 0) {
      toast({ title: 'Select orders and status', variant: 'destructive' });
      return;
    }
    try {
      const res = await api.post('/admin/bulk/orders/update-status', {
        order_ids: selectedOrders,
        status: bulkStatus
      }, token);
      toast({ title: 'Orders updated', description: `${res.data.modified} orders updated to ${bulkStatus}` });
      setSelectedOrders([]);
      setBulkStatus('');
      fetchData();
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const bulkDeleteProducts = async () => {
    if (selectedProducts.length === 0) return;
    if (!window.confirm(`Delete ${selectedProducts.length} products? This cannot be undone.`)) return;
    
    try {
      const res = await api.post('/admin/bulk/products/delete', {
        product_ids: selectedProducts
      }, token);
      toast({ title: 'Products deleted', description: `${res.data.deleted} products removed` });
      setSelectedProducts([]);
      fetchData();
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bulk Operations</h2>
        <p className="text-gray-500">Perform actions on multiple items at once</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium border-b-2 -mb-px ${
            activeTab === 'orders' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500'
          }`}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium border-b-2 -mb-px ${
            activeTab === 'products' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500'
          }`}
        >
          Products ({products.length})
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Bulk Actions Bar */}
          <div className="bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={selectAllOrders}>
                {selectedOrders.length === orders.length ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                {selectedOrders.length === orders.length ? 'Deselect All' : 'Select All'}
              </Button>
              <span className="text-sm text-gray-500">
                {selectedOrders.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select status" />
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
              <Button onClick={bulkUpdateOrderStatus} disabled={selectedOrders.length === 0}>
                Update Status
              </Button>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.slice(0, 50).map((order) => (
                  <tr key={order.id} className={selectedOrders.includes(order.id) ? 'bg-sky-50' : ''}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleOrderSelection(order.id)}>
                        {selectedOrders.includes(order.id) ? (
                          <CheckSquare className="w-5 h-5 text-sky-500" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium">{order.order_number}</td>
                    <td className="px-4 py-3 text-gray-600">{order.shipping_address?.first_name} {order.shipping_address?.last_name}</td>
                    <td className="px-4 py-3">₹{order.total?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.order_status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Bulk Actions Bar */}
          <div className="bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={selectAllProducts}>
                {selectedProducts.length === products.length ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
              </Button>
              <span className="text-sm text-gray-500">
                {selectedProducts.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={bulkDeleteProducts} disabled={selectedProducts.length === 0}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => toggleProductSelection(product.id)}
                className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all ${
                  selectedProducts.includes(product.id) ? 'ring-2 ring-sky-500 bg-sky-50' : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  {selectedProducts.includes(product.id) ? (
                    <CheckSquare className="w-5 h-5 text-sky-500" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-300" />
                  )}
                  <span className={`px-2 py-1 rounded text-xs ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <img
                  src={product.image || product.images?.[0] || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                <p className="text-sky-600 font-semibold">₹{product.price}</p>
                <p className="text-sm text-gray-500">Stock: {product.stock}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOperationsTab;
