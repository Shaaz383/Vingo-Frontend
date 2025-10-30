import { useEffect, useState } from 'react';
import { getShopOrders, updateShopOrderStatus } from '../services/orderApi';
import { toast } from 'react-hot-toast';

export default function ShopOrders() {
  const [shopOrders, setShopOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingOrder, setProcessingOrder] = useState(null);

  useEffect(() => {
    fetchShopOrders();
  }, []);

  const fetchShopOrders = async () => {
    try {
      setLoading(true);
      const data = await getShopOrders();
      setShopOrders(data.shopOrders || []);
    } catch (err) {
      setError(err.message || 'Failed to load shop orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-500';
      case 'accepted': return 'bg-blue-500';
      case 'preparing': return 'bg-yellow-500';
      case 'out for delivery': return 'bg-indigo-500';
      case 'rejected':
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setProcessingOrder(orderId);
      await updateShopOrderStatus(orderId, newStatus);
      setShopOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update order status');
    } finally {
      setProcessingOrder(null);
    }
  };

  const filteredOrders =
    statusFilter === 'all'
      ? shopOrders
      : shopOrders.filter(order => order.status?.toLowerCase() === statusFilter);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-400 text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h1 className="text-3xl font-bold">Manage Orders</h1>
          </div>
          <button
            onClick={fetchShopOrders}
            className="bg-white text-red-600 px-4 py-2 rounded-md shadow-sm hover:bg-red-50 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto p-4 pt-8">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">Filter by status:</span>
            <div className="inline-flex rounded-md shadow-sm">
              {['all', 'pending', 'accepted', 'preparing', 'out for delivery', 'delivered'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-4 py-2 text-sm font-medium border border-gray-300 ${
                    statusFilter === st ? `${getStatusColor(st)} text-white` : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredOrders.length} of {shopOrders.length} orders
          </div>
        </div>

        {/* Orders */}
        {shopOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-600">You haven't received any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(so => (
              <div key={so._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="border-b border-gray-100 bg-white p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Order #{so._id.slice(-6)}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(so.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">₹{so.total}</div>
                    <div className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(so.status)}`}>
                      {so.status || 'Pending'}
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="bg-gray-50 p-4 border-t border-gray-100 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange(so._id, 'accepted')}
                    disabled={processingOrder === so._id || so.status === 'accepted'}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      so.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange(so._id, 'preparing')}
                    disabled={processingOrder === so._id || !['accepted'].includes(so.status)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      so.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                  >
                    Preparing
                  </button>
                  <button
                    onClick={() => handleStatusChange(so._id, 'out for delivery')}
                    disabled={processingOrder === so._id || !['preparing'].includes(so.status)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      so.status === 'out for delivery' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    }`}
                  >
                    Out for Delivery
                  </button>
                  <button
                    onClick={() => handleStatusChange(so._id, 'delivered')}
                    disabled={processingOrder === so._id || !['out for delivery'].includes(so.status)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      so.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    Delivered
                  </button>
                  <button
                    onClick={() => handleStatusChange(so._id, 'rejected')}
                    disabled={processingOrder === so._id || ['rejected', 'cancelled', 'delivered'].includes(so.status)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      ['rejected', 'cancelled', 'delivered'].includes(so.status)
                        ? 'bg-red-100 text-red-700'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
