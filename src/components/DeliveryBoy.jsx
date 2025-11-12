import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaBox, FaMapMarkerAlt, FaUser, FaSync, FaTruck, FaClock, FaCheckCircle, FaBan, FaMotorcycle } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext'; // Import useSocket

// Helper function to determine button and status bar styling
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return { bg: 'bg-green-600', text: 'text-white', label: 'Delivered' };
    case 'out_for_delivery':
      return { bg: 'bg-blue-600', text: 'text-white', label: 'Out for Delivery' };
    case 'ready_for_pickup':
      return { bg: 'bg-orange-500', text: 'text-black', label: 'Ready for Pickup' };
    case 'accepted':
      return { bg: 'bg-yellow-500', text: 'text-black', label: 'Accepted by Shop' };
    case 'preparing':
      return { bg: 'bg-yellow-500', text: 'text-black', label: 'Preparing' };
    case 'cancelled':
    case 'rejected':
      return { bg: 'bg-red-600', text: 'text-white', label: 'Cancelled/Rejected' };
    default:
      return { bg: 'bg-gray-500', text: 'text-white', label: 'Awaiting Shop' };
  }
};

const DeliveryBoy = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const { socket } = useSocket(); // Get socket instance

  const apiBase = 'http://localhost:3000/api/delivery';

  // Fetch orders assigned to the current delivery boy
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBase}/my-orders`, { withCredentials: true });
      const fetchedOrders = response.data.orders || [];
      setOrders(fetchedOrders);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch orders. Please try again later.');
      toast.error('Failed to fetch orders.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Socket.io Listener for new orders
  useEffect(() => {
    if (!socket) return;

    // Listen for new order request from the backend
    const handleNewOrderRequest = (data) => {
      toast('New delivery request assigned!', { icon: '🚨' });
      // Refetch all orders to get the new one
      fetchOrders();
    };

    // Listen for status updates (e.g., from Shop changing status)
    const handleStatusUpdate = (data) => {
        setOrders(prevOrders => prevOrders.map(order => 
            order._id === data.shopOrderId ? { ...order, status: data.status } : order
        ));
    };

    socket.on('newOrderRequest', handleNewOrderRequest);
    
    // Listen for when a shop accepts an order assigned to the delivery boy
    const handleShopAcceptance = (data) => {
      toast('Shop has accepted the order!', { icon: '✅' });
      fetchOrders(); // Refetch to update status and details
    };

    socket.on('deliveryOrderAcceptedByShop', handleShopAcceptance);
    socket.on('orderStatusUpdated', handleStatusUpdate);

    return () => {
      socket.off('newOrderRequest', handleNewOrderRequest);
      socket.off('deliveryOrderAcceptedByShop', handleShopAcceptance);
      socket.off('orderStatusUpdated', handleStatusUpdate);
    };
  }, [socket]); // Dependency on socket only

  // Handle status update for an assigned shop order
  const handleStatusUpdate = async (orderId, newStatus) => {
    if (processingOrder === orderId || newStatus.toLowerCase() === orders.find(o => o._id === orderId)?.status?.toLowerCase()) return;

    try {
      setProcessingOrder(orderId);
      const response = await axios.patch(
        `${apiBase}/${orderId}/status`, 
        { status: newStatus }, 
        { withCredentials: true }
      );
      
      // Update local state with the returned order
      setOrders(orders.map(order => (order._id === orderId ? response.data.order : order)));
      toast.success(`Delivery status updated to: ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update delivery status.');
      console.error(err);
    } finally {
      setProcessingOrder(null);
    }
  };

  const pendingOrders = orders.filter(o => o.status.toLowerCase() === 'pending');
  const activeOrders = orders.filter(o => !['delivered', 'cancelled', 'rejected', 'pending'].includes(o.status.toLowerCase()));
  const allActiveOrders = [...pendingOrders, ...activeOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-500"></div>
        <p className="ml-4 text-gray-700">Loading assigned orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-lg shadow-md">
          <p className="font-bold">Error Loading Orders</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchOrders}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 inline-flex items-center text-sm"
          >
            <FaSync className="mr-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaMotorcycle className="mr-3 text-red-500" />
            My Deliveries
          </h1>
          <button 
            onClick={fetchOrders}
            className="p-3 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors duration-200"
            aria-label="Refresh orders"
          >
            <FaSync className="h-5 w-5" />
          </button>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Assigned Orders ({allActiveOrders.length})
        </h2>

        {/* Order List */}
        {allActiveOrders.length > 0 ? (
          <div className="space-y-6">
            {allActiveOrders.map(order => {
              const { bg, text, label } = getStatusColor(order.status);
              const { deliveryAddress } = order.order;
              const isDelivered = order.status.toLowerCase() === 'delivered' || order.status.toLowerCase() === 'cancelled';
              const isPending = order.status.toLowerCase() === 'pending';
              
              return (
                <div key={order._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  
                  {/* Order Header */}
                  <div className={`p-4 ${bg} ${text} flex justify-between items-center`}>
                    <div className="font-bold text-lg">
                      Delivery for #{order.order._id.slice(-6)}
                    </div>
                    <div className="font-medium flex items-center space-x-2">
                      <FaClock />
                      <span className="text-sm">{label}</span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shop & Pickup */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-700 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-red-500" /> Pickup Location
                      </h3>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        <p className="font-medium">{order.shop.name}</p>
                        <p className="text-gray-600">{order.shop.address}</p>
                        <p className="font-bold pt-2 text-gray-800">Total: ₹{Math.round(order.total)}</p>
                      </div>
                    </div>

                    {/* Customer & Drop-off */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-700 flex items-center">
                        <FaUser className="mr-2 text-red-500" /> Drop-off Details
                      </h3>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        <p className="font-medium">{deliveryAddress.name}</p>
                        <p className="text-gray-600">{deliveryAddress.mobileNumber}</p>
                        <p className="text-gray-600">{deliveryAddress.addressLine}, {deliveryAddress.city}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0">
                    <h3 className="font-semibold text-gray-700 flex items-center mb-3">
                        <FaTruck className="mr-2 text-red-500" /> Update Status
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        
                        {/* Action: Accept/Reject (Only if pending) */}
                        {isPending && (
                            <>
                                <DeliveryButton 
                                    orderId={order._id} 
                                    targetStatus="accepted"
                                    icon={<FaCheckCircle />}
                                    label="Accept Order"
                                    handleUpdate={handleStatusUpdate}
                                    isDisabled={isDelivered}
                                    isLoading={processingOrder === order._id}
                                />
                                <DeliveryButton 
                                    orderId={order._id} 
                                    targetStatus="rejected"
                                    icon={<FaBan />}
                                    label="Reject Order"
                                    handleUpdate={handleStatusUpdate}
                                    isDisabled={isDelivered}
                                    isLoading={processingOrder === order._id}
                                    isDanger={true}
                                />
                            </>
                        )}

                        {/* Action: Out for Delivery (Visible if accepted/preparing/ready) */}
                        {!isPending && !isDelivered && (
                            <>
                                <DeliveryButton 
                                    orderId={order._id} 
                                    currentStatus={order.status}
                                    targetStatus="ready_for_pickup"
                                    icon={<FaClock />}
                                    label="Ready for Pickup"
                                    handleUpdate={handleStatusUpdate}
                                    isDisabled={isDelivered || order.status.toLowerCase() === 'out_for_delivery'}
                                    isLoading={processingOrder === order._id}
                                />

                                <DeliveryButton 
                                    orderId={order._id} 
                                    currentStatus={order.status}
                                    targetStatus="out_for_delivery"
                                    icon={<FaMotorcycle />}
                                    label="Out for Delivery"
                                    handleUpdate={handleStatusUpdate}
                                    isDisabled={isDelivered || order.status.toLowerCase() === 'delivered' || order.status.toLowerCase() === 'cancelled' || order.status.toLowerCase() !== 'ready_for_pickup'}
                                    isLoading={processingOrder === order._id}
                                />

                                {/* Action: Delivered */}
                                <DeliveryButton 
                                    orderId={order._id} 
                                    currentStatus={order.status}
                                    targetStatus="delivered"
                                    icon={<FaCheckCircle />}
                                    label="Delivered"
                                    handleUpdate={handleStatusUpdate}
                                    isDisabled={isDelivered || order.status.toLowerCase() !== 'out_for_delivery'}
                                    isLoading={processingOrder === order._id}
                                />
                            </>
                        )}
                        
                        <div className="col-span-full pt-2">
                          <p className="text-xs text-gray-500">
                            {isPending 
                                ? 'Tap Accept to confirm you will deliver this order.'
                                : 'Update status after pickup and drop-off.'
                            }
                          </p>
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No Active Deliveries</h2>
            <p className="text-gray-600 mb-4">New delivery requests will appear here when assigned by shops.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for the status buttons
const DeliveryButton = ({ orderId, currentStatus, targetStatus, icon, label, handleUpdate, isDisabled, isLoading, isDanger = false }) => {
    const { bg, text } = getStatusColor(targetStatus);
    const isCurrentStatus = currentStatus?.toLowerCase() === targetStatus.toLowerCase();
    
    let buttonClass = 'transition-all duration-200 flex items-center justify-center h-full rounded-md px-3 py-2 text-xs font-medium';
    
    if (isDisabled) {
        buttonClass += isCurrentStatus ? 
            ` ${bg} ${text} shadow-md opacity-100 cursor-default` : 
            ' bg-gray-200 text-gray-500 cursor-not-allowed';
    } else {
        if (isDanger) {
            buttonClass += ' bg-red-600 text-white hover:bg-red-700 shadow-md';
        } else {
            // Use specific colors for active statuses
            let activeBg = isCurrentStatus ? bg : 'bg-white border border-gray-200';
            let activeText = isCurrentStatus ? text : 'text-gray-700 hover:text-red-600';
            let hoverBg = isCurrentStatus ? `hover:${bg.replace('600', '700')}` : 'hover:bg-red-50';
            buttonClass += ` ${activeBg} ${activeText} ${hoverBg}`;
        }
    }

    const buttonLabel = isCurrentStatus && !isLoading ? label.split(' ')[0] + 'ed' : label;

    return (
        <button
            onClick={() => handleUpdate(orderId, targetStatus)}
            className={buttonClass}
            disabled={isDisabled || isLoading}
        >
            {isLoading && !isDisabled ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {buttonLabel.split(' ')[0] + 'ing...'}
                </span>
            ) : (
                <>
                    {icon && <span className="mr-2">{icon}</span>}
                    <span className="capitalize">{buttonLabel}</span>
                </>
            )}
        </button>
    );
};


export default DeliveryBoy;