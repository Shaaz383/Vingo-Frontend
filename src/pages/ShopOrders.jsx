import { useEffect, useState } from 'react';
import { getShopOrders, updateShopOrderStatus } from '../services/orderApi';
import { Link } from 'react-router-dom';

export default function ShopOrders() {
  const [shopOrders, setShopOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchShopOrders = async () => {
      try {
        const data = await getShopOrders();
        setShopOrders(data.shopOrders || []);
      } catch (err) {
        setError(err.message || 'Failed to load shop orders');
      } finally {
        setLoading(false);
      }
    };
    fetchShopOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500';
      case 'preparing':
        return 'bg-yellow-500';
      case 'out for delivery':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // This is a placeholder - you'll need to implement the actual API call
      await updateShopOrderStatus(orderId, newStatus);
      
      // Update local state
      setShopOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update order status');
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? shopOrders 
    : shopOrders.filter(order => order.status?.toLowerCase() === statusFilter);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-red-400 text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h1 className="text-3xl font-bold">Restaurant Orders</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 pt-8">
        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <span className="text-gray-700 font-medium">Filter by status:</span>
              <div className="inline-flex rounded-md shadow-sm">
                <button 
                  onClick={() => setStatusFilter('all')} 
                  className={`px-4 py-2 text-sm font-medium rounded-l-md ${statusFilter === 'all' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300`}
                >
                  All
                </button>
                <button 
                  onClick={() => setStatusFilter('preparing')} 
                  className={`px-4 py-2 text-sm font-medium ${statusFilter === 'preparing' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-t border-b border-gray-300`}
                >
                  Preparing
                </button>
                <button 
                  onClick={() => setStatusFilter('out for delivery')} 
                  className={`px-4 py-2 text-sm font-medium ${statusFilter === 'out for delivery' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-t border-b border-gray-300`}
                >
                  Out for Delivery
                </button>
                <button 
                  onClick={() => setStatusFilter('delivered')} 
                  className={`px-4 py-2 text-sm font-medium ${statusFilter === 'delivered' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-t border-b border-r border-gray-300 rounded-r-md`}
                >
                  Delivered
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {shopOrders.length} orders
            </div>
          </div>
        </div>

        {shopOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-4">You haven't received any orders for your restaurant yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((so) => (
              <div key={so._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-gray-100 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                      <div className="bg-red-500 text-white p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-lg">Order #{so.order?._id?.slice(-6)}</div>
                        <div className="text-sm text-gray-500">{new Date(so.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-bold text-lg">₹{so.total}</div>
                      <div className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(so.status)}`}>
                        {so.status}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Customer
                    </h3>
                    <p className="text-gray-800 font-medium">{so.order?.user?.fullName}</p>
                    <p className="text-gray-600 text-sm">{so.order?.user?.email}</p>
                    <p className="text-gray-600 text-sm">{so.order?.user?.phone || 'No phone provided'}</p>
                  </div>

                  {/* Order Items */}
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Order Items
                    </h3>
                    <ul className="space-y-2">
                      {so.items?.map((it) => (
                        <li key={it._id} className="flex justify-between items-center bg-white p-2 rounded-md border border-gray-100">
                          <div className="flex items-center">
                            <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
                              {it.quantity}
                            </span>
                            <span>{it.item?.name}</span>
                          </div>
                          <span className="font-medium">₹{it.pricePerUnit * it.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-4 border-t pt-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>₹{so.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax:</span>
                        <span>₹{so.tax}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee:</span>
                        <span>₹{so.deliveryFee}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total:</span>
                        <span>₹{so.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 border-t border-gray-100 flex flex-wrap items-center justify-between">
                  <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                    Update order status:
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleStatusChange(so._id, 'preparing')}
                      className={`px-3 py-1 text-xs font-medium rounded ${so.status === 'preparing' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-yellow-100 border border-gray-300'}`}
                    >
                      Preparing
                    </button>
                    <button 
                      onClick={() => handleStatusChange(so._id, 'out for delivery')}
                      className={`px-3 py-1 text-xs font-medium rounded ${so.status === 'out for delivery' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-100 border border-gray-300'}`}
                    >
                      Out for Delivery
                    </button>
                    <button 
                      onClick={() => handleStatusChange(so._id, 'delivered')}
                      className={`px-3 py-1 text-xs font-medium rounded ${so.status === 'delivered' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-green-100 border border-gray-300'}`}
                    >
                      Delivered
                    </button>
                    <button 
                      onClick={() => handleStatusChange(so._id, 'cancelled')}
                      className={`px-3 py-1 text-xs font-medium rounded ${so.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-red-100 border border-gray-300'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}