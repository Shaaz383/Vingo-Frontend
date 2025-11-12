import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaBox, FaMapMarkerAlt, FaUser, FaSync, FaTruck, FaClock, FaCheckCircle, FaBan } from 'react-icons/fa';

// Helper function to determine button and status bar styling
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return { bg: 'bg-green-600', text: 'text-white', label: 'Delivered' };
    case 'out_for_delivery':
      return { bg: 'bg-blue-600', text: 'text-white', label: 'Out for Delivery' };
    case 'ready_for_pickup':
      return { bg: 'bg-yellow-500', text: 'text-black', label: 'Ready for Pickup' };
    case 'accepted':
    case 'preparing':
      return { bg: 'bg-yellow-500', text: 'text-black', label: 'Preparing/Accepted' };
    case 'cancelled':
      return { bg: 'bg-red-600', text: 'text-white', label: 'Cancelled' };
    default:
      return { bg: 'bg-gray-500', text: 'text-white', label: 'Pending/Unknown' };
  }
};

const DeliveryBoy = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);

  // Fetch orders assigned to the current delivery boy
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Using direct API call as implemented in the original file
      const response = await axios.get('http://localhost:3000/api/delivery/my-orders', { withCredentials: true });
      const fetchedOrders = response.data.orders || [];
      setOrders(fetchedOrders);
      if (fetchedOrders.length > 0) {
        toast.success(`Found ${fetchedOrders.length} assigned orders!`);
      } else {
        toast('No active orders right now.', { icon: '📦' });
      }
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

  // Handle status update for an assigned shop order
  const handleStatusUpdate = async (orderId, newStatus) => {
    if (processingOrder === orderId) return;

    try {
      setProcessingOrder(orderId);
      // Using direct API call as implemented in the original file
      const response = await axios.patch(
        `http://localhost:3000/api/delivery/${orderId}/status`, 
        { status: newStatus }, 
        { withCredentials: true }
      );
      
      // Update local state with the returned order
      setOrders(orders.map(order => (order._id === orderId ? response.data.order : order)));
      toast.success(`Order #${orderId.slice(-6)} status updated to: ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update order status.');
      console.error(err);
    } finally {
      setProcessingOrder(null);
    }
  };

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
            <FaTruck className="mr-3 text-red-500" />
            Delivery Dashboard
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
          Active Orders ({orders.length})
        </h2>

        {/* Order List */}
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map(order => {
              const { bg, text, label } = getStatusColor(order.status);
              const { deliveryAddress } = order.order;
              const isDelivered = order.status.toLowerCase() === 'delivered' || order.status.toLowerCase() === 'cancelled';
              
              return (
                <div key={order._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  
                  {/* Order Header */}
                  <div className={`p-4 ${bg} ${text} flex justify-between items-center`}>
                    <div className="font-bold text-lg">
                      Order #{order.order._id.slice(-6)}
                    </div>
                    <div className="font-medium flex items-center space-x-2">
                      <FaClock />
                      <span className="text-sm">{label}</span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer & Address */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-700 flex items-center">
                        <FaUser className="mr-2 text-red-500" /> Customer Details
                      </h3>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        <p className="font-medium">{deliveryAddress.name}</p>
                        <p className="text-gray-600">{deliveryAddress.mobileNumber}</p>
                        <p className="font-semibold text-gray-700 mt-2 flex items-center">
                            <FaMapMarkerAlt className="mr-1 text-red-500" /> Delivery To:
                        </p>
                        <p className="text-gray-600">{deliveryAddress.addressLine}, {deliveryAddress.city}, {deliveryAddress.pincode}</p>
                      </div>
                    </div>

                    {/* Shop & Items */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-700 flex items-center">
                        <FaBox className="mr-2 text-red-500" /> Shop & Items
                      </h3>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        <p className="font-medium mb-1">From: {order.shop.name}</p>
                        <ul className="space-y-1">
                          {/* Note: order.order contains item details for the entire customer order */}
                          {order.order.shopOrders?.find(so => so.shop?.name === order.shop.name)?.items?.map((item, index) => (
                            <li key={item._id || index} className="flex justify-between border-t border-gray-200 pt-1">
                                <span className="text-gray-700">{item.quantity} x {item.itemName || item.item?.name || 'Item'}</span>
                                <span className="font-medium">₹{Math.round(item.total)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex justify-between font-bold pt-2 border-t border-gray-300 mt-2">
                            <span>Shop Subtotal:</span>
                            <span>₹{Math.round(order.subtotal || 0)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-1">
                            <span>Order Total:</span>
                            <span>₹{Math.round(order.total || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0">
                    <h3 className="font-semibold text-gray-700 flex items-center mb-3">
                        <FaTruck className="mr-2 text-red-500" /> Update Delivery Status
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        
                        {/* Action: Ready for Pickup */}
                        <DeliveryButton 
                            orderId={order._id} 
                            currentStatus={order.status}
                            targetStatus="ready_for_pickup"
                            icon={<FaClock />}
                            handleUpdate={handleStatusUpdate}
                            isDisabled={isDelivered || order.status.toLowerCase() === 'out_for_delivery' || order.status.toLowerCase() === 'delivered'}
                            isLoading={processingOrder === order._id}
                        />

                        {/* Action: Out for Delivery */}
                        <DeliveryButton 
                            orderId={order._id} 
                            currentStatus={order.status}
                            targetStatus="out_for_delivery"
                            icon={<FaTruck />}
                            handleUpdate={handleStatusUpdate}
                            isDisabled={isDelivered || order.status.toLowerCase() === 'delivered' || order.status.toLowerCase() === 'cancelled'}
                            isLoading={processingOrder === order._id}
                        />

                        {/* Action: Delivered */}
                        <DeliveryButton 
                            orderId={order._id} 
                            currentStatus={order.status}
                            targetStatus="delivered"
                            icon={<FaCheckCircle />}
                            handleUpdate={handleStatusUpdate}
                            isDisabled={isDelivered}
                            isLoading={processingOrder === order._id}
                        />

                        {/* Action: Cancelled (Reject) - Can be used to reject an order on the spot */}
                        <DeliveryButton 
                            orderId={order._id} 
                            currentStatus={order.status}
                            targetStatus="cancelled"
                            icon={<FaBan />}
                            handleUpdate={handleStatusUpdate}
                            isDisabled={isDelivered}
                            isLoading={processingOrder === order._id}
                            isDanger={true}
                        />

                        <div className="col-span-full pt-2">
                          <p className="text-xs text-gray-500">Note: Tap to change status. Use "Ready for Pickup" after collecting the order from the shop.</p>
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
            <h2 className="text-xl font-semibold mb-2">Nooo Active Orders</h2>
            <p className="text-gray-600 mb-4">You have no assigned deliveries at the moment. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for the status buttons
const DeliveryButton = ({ orderId, currentStatus, targetStatus, icon, handleUpdate, isDisabled, isLoading, isDanger = false }) => {
    const { bg, text } = getStatusColor(targetStatus);
    const isCurrentStatus = currentStatus.toLowerCase() === targetStatus.toLowerCase();
    
    let buttonClass = '';
    
    if (isDisabled) {
        buttonClass = isCurrentStatus ? 
            `${bg} ${text} shadow-md opacity-100` : 
            'bg-gray-300 text-gray-600 cursor-not-allowed opacity-70';
    } else {
        buttonClass = isDanger ? 
            'bg-white text-red-600 hover:bg-red-50 border border-red-300' : 
            `${bg.replace('600', '500')} ${text.replace('white', 'white')} hover:${bg.replace('600', '700')} shadow-md`;
    }

    return (
        <button
            onClick={() => handleUpdate(orderId, targetStatus)}
            className={`px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center h-full ${buttonClass}`}
            disabled={isDisabled}
        >
            {isLoading && isCurrentStatus && targetStatus === 'delivered' ? ( // Only show loading spinner for the target status if it's the current action
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                </span>
            ) : (
                <>
                    {icon && <span className="mr-2">{icon}</span>}
                    <span className="capitalize">{targetStatus.replace(/_/g, ' ')}</span>
                </>
            )}
        </button>
    );
};


export default DeliveryBoy;