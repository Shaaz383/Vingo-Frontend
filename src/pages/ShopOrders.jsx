import { useEffect, useState, useCallback } from 'react';
import { getShopOrders, updateShopOrderStatus } from '../services/orderApi';
import { toast } from 'react-hot-toast';
import { FaBox, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaSync, FaTruck } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext'; 

export default function ShopOrders() {
  const [shopOrders, setShopOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingOrder, setProcessingOrder] = useState(null);
  const { socket } = useSocket(); 

  // Unified function to get professional status display properties
  const getStatusProps = useCallback((status) => {
    const lowerStatus = status?.toLowerCase();
    let label = status?.replace(/_/g, ' ') || 'Unknown';
    let colorClass = 'bg-gray-500';
    
    switch (lowerStatus) {
        case 'created':
        case 'pending':
            label = 'Awaiting Confirmation';
            colorClass = 'bg-yellow-500';
            break;
        case 'preparing':
            label = 'Preparing Food';
            colorClass = 'bg-blue-500';
            break;
        case 'accepted':
            label = 'Delivery Assigned';
            colorClass = 'bg-indigo-600';
            break;
        case 'ready_for_pickup':
            label = 'Ready for Pickup';
            colorClass = 'bg-orange-500';
            break;
        case 'out_for_delivery':
            label = 'Out for Delivery';
            colorClass = 'bg-green-600';
            break;
        case 'delivered':
            label = 'Delivered';
            colorClass = 'bg-red-600'; 
            break;
        case 'cancelled':
            label = 'Cancelled';
            colorClass = 'bg-gray-400';
            break;
        default:
            label = status;
            colorClass = 'bg-gray-500';
    }
    
    // Auto capitalize each word
    label = label.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return { label, colorClass };
  }, []); 


  const fetchShopOrders = async () => {
    try {
      setLoading(true);
      const data = await getShopOrders();
      setShopOrders(data.shopOrders || []);
    } catch (err) {
      setError(err.message || 'Failed to load shop orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopOrders();
  }, []);

  // Socket listener for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Updates when status changes or DB is assigned
    const handleOrderStatusUpdate = (data) => {
      setShopOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === data.shopOrderId
            ? { 
                ...order, 
                status: data.status, 
                deliveryBoy: data.deliveryBoy || order.deliveryBoy 
              } 
            : order
        )
      );
    };
    
    // Updates when a new order is placed (sent only to owner in placeOrder now)
    const handleNewShopOrder = (data) => {
        toast('New order received!', { icon: '🔔' });
        fetchShopOrders(); 
    };

    // Updates when a DB accepts an order
    const handleOrderAcceptedByDB = (data) => {
        toast.success(`Order #${data.orderId?.slice(-6)} accepted by a Delivery Boy!`, {
            icon: '🏍️',
            style: { borderRadius: '10px', background: '#4c1d95', color: '#fff' },
        });
        handleOrderStatusUpdate(data);
    };

    socket.on('orderStatusUpdated', handleOrderStatusUpdate);
    socket.on('newShopOrder', handleNewShopOrder);
    socket.on('orderAcceptedByDeliveryBoy', handleOrderAcceptedByDB);

    return () => {
      socket.off('orderStatusUpdated', handleOrderStatusUpdate);
      socket.off('newShopOrder', handleNewShopOrder);
      socket.off('orderAcceptedByDeliveryBoy', handleOrderAcceptedByDB);
    };
  }, [socket, fetchShopOrders]); 


  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setProcessingOrder(orderId);
      const res = await updateShopOrderStatus(orderId, newStatus);
      
      setShopOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? res.shopOrder : order
        )
      );
      toast.success(`Order status updated to ${getStatusProps(newStatus).label}`, {
        icon: '✅',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      const errorMessage = err?.message || err?.response?.data?.message || 'Failed to update order status';
      toast.error(errorMessage);
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
                {/* Status filters */}
                <button 
                  onClick={() => setStatusFilter('all')} 
                  className={`px-3 py-2 text-xs sm:text-sm font-medium ${statusFilter === 'all' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300 rounded-l-md flex-1`}
                >
                  All
                </button>
                <button 
                  onClick={() => setStatusFilter('pending')} 
                  className={`px-3 py-2 text-xs sm:text-sm font-medium ${statusFilter === 'pending' ? getStatusProps('pending').colorClass + ' text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-t border-b border-gray-300 flex-1`}
                >
                  {getStatusProps('pending').label}
                </button>
                <button 
                  onClick={() => setStatusFilter('accepted')} 
                  className={`px-3 py-2 text-xs sm:text-sm font-medium ${statusFilter === 'accepted' ? getStatusProps('accepted').colorClass + ' text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-t border-b border-gray-300 flex-1`}
                >
                  {getStatusProps('accepted').label}
                </button>
                <button 
                  onClick={() => setStatusFilter('preparing')} 
                  className={`px-3 py-2 text-xs sm:text-sm font-medium ${statusFilter === 'preparing' ? getStatusProps('preparing').colorClass + ' text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-t border-b border-gray-300 flex-1`}
                >
                  {getStatusProps('preparing').label}
                </button>
                <button 
                  onClick={() => setStatusFilter('delivered')} 
                  className={`px-3 py-2 text-xs sm:text-sm font-medium ${statusFilter === 'delivered' ? getStatusProps('delivered').colorClass + ' text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-t border-b border-r border-gray-300 rounded-r-md flex-1`}
                >
                  {getStatusProps('delivered').label}
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
              : `You don't have any ${statusFilter.replace(/_/g, ' ')} orders at the moment.`}
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
                    <div className="font-bold text-lg">₹{Math.round(so.total || 0)}</div>
                    <div className={`px-2 py-1 rounded-full text-white text-xs font-medium ${getStatusProps(so.status).colorClass}`}>
                      {getStatusProps(so.status).label}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Delivery Boy Info */}
                {so.deliveryBoy ? (
                    <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
                        <h3 className="font-medium text-orange-700 mb-2 flex items-center">
                            <FaTruck className="mr-2" /> Assigned Delivery
                        </h3>
                        <p className="text-gray-800 font-medium">{so.deliveryBoy.fullName}</p>
                        <p className="text-gray-600 text-sm">Mobile: {so.deliveryBoy.mobile || 'N/A'}</p>
                    </div>
                ) : (
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                        <h3 className="font-medium text-blue-700 mb-2 flex items-center">
                            <FaTruck className="mr-2" /> Delivery Assignment
                        </h3>
                        <p className="text-gray-800 font-medium text-sm">
                            {so.status === 'pending' ? 'Waiting for your acceptance to start preparation.' : 'Waiting for a Delivery Boy to accept this order...'}
                        </p>
                    </div>
                )}
                
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
                <div className="md:col-span-1">
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
                          <span>{it.itemName || it.item?.name || 'Item'}</span>
                        </div>
                        <span className="font-medium">₹{Math.round(it.total || 0)}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 border-t pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{Math.round(so.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span>₹{Math.round(so.deliveryFee || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxes</span>
                      <span>₹{Math.round(so.tax || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Grand Total</span>
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
                  
                  {/* OWNER ACTION: ACCEPT/START PREPARING BUTTON - Only visible/enabled when status is PENDING */}
                  {so.status === 'pending' && (
                    <button 
                      onClick={() => handleStatusChange(so._id, 'preparing')} // Owner accepts by moving to 'preparing'
                      className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center col-span-2 ${
                        processingOrder === so._id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-purple-600 text-white shadow-md hover:bg-purple-700"
                      }`}
                      disabled={processingOrder === so._id}
                    >
                      {processingOrder === so._id ? 'Accepting...' : 'Accept & Start Preparing'}
                    </button>
                  )}

                  {/* PREPARING BUTTON: Visible/Enabled when status is 'accepted' (by DB) or 'preparing' */}
                  {(so.status === 'accepted' || so.status === 'preparing') && (
                    <button 
                      onClick={() => handleStatusChange(so._id, 'preparing')}
                      className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center ${
                        so.status === 'preparing' 
                          ? 'bg-yellow-500 text-white shadow-md' 
                          : 'bg-white text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 border border-gray-200'
                      }`}
                      disabled={processingOrder === so._id || ['out_for_delivery', 'delivered', 'cancelled'].includes(so.status)} 
                    >
                      {processingOrder === so._id ? 'Updating...' : so.status === 'preparing' ? 'Preparing' : 'Set Preparing'}
                    </button>
                  )}
                  
                  {/* Ready for Pickup Button: Enabled only if DB is assigned AND status is 'preparing' or 'accepted' */}
                  {(so.status === 'preparing' || so.status === 'accepted') && so.deliveryBoy && (
                    <button 
                      onClick={() => handleStatusChange(so._id, 'ready_for_pickup')}
                      className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center ${
                        so.status === 'ready_for_pickup' 
                          ? 'bg-orange-500 text-white shadow-md' 
                          : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                      }`}
                      // Disabled if processing, or DB not assigned, or already set to ready
                      disabled={processingOrder === so._id || so.status === 'ready_for_pickup' || !so.deliveryBoy}
                    > 
                      {processingOrder === so._id ? 'Updating...' : 'Ready for Pickup'}
                    </button>
                  )}

                  {/* CANCELLATION: Add an option for the owner to cancel if status is still pending/preparing and no DB assigned */}
                  {so.status !== 'delivered' && so.status !== 'cancelled' && !so.deliveryBoy && (
                       <button 
                          onClick={() => handleStatusChange(so._id, 'cancelled')}
                          className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center ${
                              'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                          } ${so.status !== 'pending' ? 'col-span-1' : 'col-span-2'}`}
                          disabled={processingOrder === so._id || so.deliveryBoy} // Cannot cancel if DB is assigned
                        >
                          {processingOrder === so._id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                  )}
                  
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Note: Accepting the order (by setting to **Preparing**) notifies all Delivery Boys to bid for assignment.
                </p>
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