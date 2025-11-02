import { useEffect, useState } from 'react';
import { getShopOrders, updateShopOrderStatus } from '../services/orderApi';
import { toast } from 'react-hot-toast';
import { FaBox, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaSync } from 'react-icons/fa';

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
      if (data.shopOrders && data.shopOrders.length > 0) {
        toast.success('Orders loaded successfully');
      }
    } catch (err) {
      setError(err.message || 'Failed to load shop orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'Delivered': return 'bg-green-500';
      case 'Accepted': return 'bg-blue-500';
      case 'Preparing': return 'bg-yellow-500';
      case 'Out for Delivery': return 'bg-indigo-500';
      case 'Rejected':
      case 'Cancelled': return 'bg-red-500'; 
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
      toast.success(`Order status updated to ${newStatus}`, {
        icon: '✅',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update order status');
    } finally {
      setProcessingOrder(null);
    }
  };
  
  const filteredOrders = statusFilter === 'all' 
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Manage Orders</h1>
        
        <div className="flex flex-col space-y-2 w-full md:w-auto">
          <div className="flex items-center justify-between md:justify-end">
            <div className="flex overflow-x-auto pb-2 w-full">
              <div className="flex w-full min-w-max">
                <button 
                  onClick={() => setStatusFilter('all')} 
                  className={`px-3 py-2 text-xs sm:text-sm font-medium ${statusFilter === 'all' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300 rounded-l-md flex-1`}
                >
                  All Orders
                </button>
                <button 
                  onClick={() => setStatusFilter('pending')} 
                  className={`px-3 py-2 text-xs sm:text-sm font-medium ${statusFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-t border-b border-gray-300 flex-1`}
                >
                  Pending
                </button>
                <button 
                  onClick={() => setStatusFilter('accepted')} 
                  className={`px-3 py-2 text-xs sm:text-sm font-medium ${statusFilter === 'accepted' ? 'bg-purple-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-t border-b border-gray-300 flex-1`}
                >
                  Accepted
                </button>
                <button 
                  onClick={() => setStatusFilter('preparing')} 
                  className={`px-3 py-2 text-xs sm:text-sm font-medium ${statusFilter === 'preparing' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-t border-b border-gray-300 flex-1`}
                >
                  Preparing
                </button>
                <button 
                  onClick={() => setStatusFilter('out_for_delivery')} 
                  className={`px-3 py-2 text-xs sm:text-sm font-medium ${statusFilter === 'out_for_delivery' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-t border-b border-gray-300 flex-1`}
                >
                  Out for Delivery
                </button>
                <button 
                  onClick={() => setStatusFilter('delivered')} 
                  className={`px-3 py-2 text-xs sm:text-sm font-medium ${statusFilter === 'delivered' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-t border-b border-r border-gray-300 rounded-r-md flex-1`}
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
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : shopOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No orders found</h2>
          <p className="text-gray-600 mb-4">
            {statusFilter === 'all' 
              ? "You don't have any orders yet. Orders will appear here when customers place them." 
              : `You don't have any ${statusFilter} orders at the moment.`}
          </p>
          <button 
            onClick={fetchShopOrders}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 inline-flex items-center"
          >
            <FaSync className="mr-2" /> Refresh Orders
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((so) => (
            <div key={so._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.01] transition-transform duration-200">
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
                    <div className="font-bold text-lg">₹{so.total || 0}</div>
                    <div className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(so.status)}`}>
                      {so.status || 'Processing'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Customer Info */}
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FaUser className="mr-2 text-red-500" />
                    Customer
                  </h3>
                  <p className="text-gray-800 font-medium">{so.order?.deliveryAddress?.name || so.order?.user?.fullName}</p>
                  <p className="text-gray-600 text-sm">{so.order?.user?.email}</p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Mobile:</span> {so.order?.deliveryAddress?.mobileNumber || 'Not provided'}
                  </p>
                  
                  {/* Delivery Address */}
                  <h3 className="font-medium text-gray-700 mt-3 mb-1 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                    Delivery Address
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {so.order?.deliveryAddress?.addressLine}, {so.order?.deliveryAddress?.city}, {so.order?.deliveryAddress?.state} - {so.order?.deliveryAddress?.pincode}
                  </p>
                </div>

                {/* Order Items */}
                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FaBox className="mr-2 text-red-500" />
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
                        <span className="font-medium">₹{(it.priceAtPurchase || it.item?.price || it.pricePerUnit || 0) * (it.quantity || 0)}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 border-t pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>₹{so.subtotal || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span>₹{Math.round(so.tax) || 0}</span>
                      
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span>₹{so.deliveryFee || 0}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span>₹{Math.round(so.total) || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 border-t border-gray-100 rounded-b-lg shadow-sm">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Update Order Status</h3>
                  <div className="h-1 w-24 bg-indigo-500 rounded mt-1"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleStatusChange(so._id, 'accepted')}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center ${
                      so.status === 'accepted' 
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200'
                    }`}
                    disabled={processingOrder === so._id}
                  >
                    {processingOrder === so._id ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Accept
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => handleStatusChange(so._id, 'preparing')}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center ${
                      so.status === 'preparing' 
                        ? 'bg-yellow-500 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 border border-gray-200'
                    }`}
                    disabled={processingOrder === so._id}
                  >
                    {processingOrder === so._id ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Preparing
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => handleStatusChange(so._id, 'out_for_delivery')}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center ${
                      so.status === 'out_for_delivery' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                    }`}
                    disabled={processingOrder === so._id}
                  > 
                    {processingOrder === so._id ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Out for Delivery
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => handleStatusChange(so._id, 'delivered')}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center ${
                      so.status === 'delivered' 
                        ? 'bg-green-600 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200'
                    }`}
                    disabled={processingOrder === so._id}
                  >
                    {processingOrder === so._id ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Delivered
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={fetchShopOrders} 
        className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
        aria-label="Refresh orders"
      >
        <FaSync className="h-5 w-5" />
      </button>
    </div>
  );
}