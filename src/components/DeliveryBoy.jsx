import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaBox, FaMapMarkerAlt, FaUser, FaSync, FaTruck, FaClock, FaCheckCircle, FaBan, FaMotorcycle, FaBell } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext'; // Import useSocket
import { useSelector } from 'react-redux'; // To get current user ID

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
      return { bg: 'bg-yellow-500', text: 'text-black', label: 'Accepted by You' };
    case 'preparing': // New requests are now in 'preparing' state
      return { bg: 'bg-purple-600', text: 'text-white', label: 'New Request' };
    case 'cancelled':
    case 'rejected':
      return { bg: 'bg-red-600', text: 'text-white', label: 'Cancelled/Rejected' };
    case 'pending':
    default:
      return { bg: 'bg-gray-500', text: 'text-white', label: 'Unknown Status' };
  }
};

const DeliveryBoy = () => {
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [newOrderRequests, setNewOrderRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const { socket } = useSocket(); // Get socket instance
  const { userData } = useSelector((state) => state.user); // Get current delivery boy's ID

  const apiBase = 'http://localhost:3000/api/delivery';

  // Fetch orders assigned to the current delivery boy AND new requests
  const fetchOrders = useCallback(async () => {
    if (!userData?._id) return;
    
    try {
      setLoading(true);
      // The backend API handles the complex logic of fetching assigned + unassigned/'preparing' orders
      const response = await axios.get(`${apiBase}/my-orders`, { withCredentials: true });
      const fetchedOrders = response.data.orders || [];

      // Assigned orders (deliveryBoy is current user's ID)
      const assigned = fetchedOrders.filter(order => 
        order.deliveryBoy?._id === userData._id
      );
      
      // New requests: deliveryBoy is null AND status is 'preparing' (Owner accepted)
      const newRequests = fetchedOrders.filter(order => 
        !order.deliveryBoy && order.status === 'preparing'
      );

      setAssignedOrders(assigned);
      setNewOrderRequests(newRequests);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch orders. Please try again later.');
      if (!/not found/i.test(err?.response?.data?.message || '')) {
         toast.error('Failed to fetch orders.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userData?._id]);


  useEffect(() => {
    if (userData?._id) { // Fetch orders only when user data is available
      fetchOrders();
    }
  }, [userData?._id, fetchOrders]); // Dependency on userData._id and fetchOrders

  // Socket.io Listener for new orders and updates
  useEffect(() => {
    if (!socket || !userData?._id) return;

    // Listen for new order request from the backend (sent to all DBs by Owner's acceptance)
    const handleNewOrderRequest = (data) => {
      // data contains { shopOrderId, orderId, shopName, total, customerAddress }
      toast('New delivery request available!', { icon: '🚨' });
      
      // Trigger a full fetch to get the complete populated order structure
      fetchOrders(); 
    };

    // Listen for when an order request has been accepted by ANY delivery boy
    const handleOrderRequestAccepted = (data) => {
      if (data.acceptedBy !== userData._id) { // If accepted by someone else
        toast(`Order #${data.shopOrderId.slice(-6)} accepted by another delivery boy.`, { icon: 'ℹ️' });
      }
      // Remove from new requests regardless of who accepted it
      setNewOrderRequests(prev => prev.filter(req => req._id !== data.shopOrderId));
    };

    // Listen for status updates (e.g., from Shop changing status)
    const handleStatusUpdate = (data) => {
        setAssignedOrders(prevOrders => prevOrders.map(order => 
            order._id === data.shopOrderId ? { ...order, status: data.status } : order
        ));
        
        // Remove from new requests if status changes away from 'preparing'
        setNewOrderRequests(prev => prev.filter(req => 
          req._id !== data.shopOrderId || data.status === 'preparing')
        );

        // Show a toast for important updates related to assigned orders
        if (assignedOrders.some(order => order._id === data.shopOrderId)) {
             toast(`Order status updated to: ${data.status.replace(/_/g, ' ').toUpperCase()}`, { icon: '🔄' });
        }
    };
    
    // Listen for general status updates (covers Shop actions like 'ready_for_pickup')
    socket.on('orderStatusUpdated', handleStatusUpdate);
    
    // Listen for the specific new request event triggered by owner acceptance
    socket.on('newOrderRequest', handleNewOrderRequest);
    
    // Listen for acceptance event triggered by another DB
    socket.on('orderRequestAccepted', handleOrderRequestAccepted);

    return () => {
      socket.off('orderStatusUpdated', handleStatusUpdate);
      socket.off('newOrderRequest', handleNewOrderRequest);
      socket.off('orderRequestAccepted', handleOrderRequestAccepted);
    };
  }, [socket, userData?._id, fetchOrders, assignedOrders]); 

  // Handle status update for an assigned shop order
  const handleStatusUpdate = async (orderId, newStatus) => {
    if (processingOrder === orderId || newStatus.toLowerCase() === assignedOrders.find(o => o._id === orderId)?.status?.toLowerCase()) return;

    try {
      setProcessingOrder(orderId);
      const response = await axios.patch(
        `${apiBase}/${orderId}/status`, 
        { status: newStatus }, 
        { withCredentials: true }
      );
      
      // Update local state with the returned order
      setAssignedOrders(prev => prev.map(order => (order._id === orderId ? response.data.order : order)));
      toast.success(`Delivery status updated to: ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update delivery status.');
      console.error(err);
    } finally {
      setProcessingOrder(null);
    }
  };

  // Handle delivery boy accepting a new order request
  const handleAcceptOrder = async (shopOrderId) => {
    if (processingOrder === shopOrderId) return;

    try {
      setProcessingOrder(shopOrderId);
      const response = await axios.patch(
        `${apiBase}/accept-order/${shopOrderId}`, 
        {}, // No body needed for acceptance
        { withCredentials: true }
      );
      
      toast.success(`Order #${shopOrderId.slice(-6)} accepted!`);
      
      // Manually add to assigned orders (full object comes from response)
      setAssignedOrders(prev => [...prev, response.data.shopOrder]);
      // Note: The socket event 'orderRequestAccepted' will automatically remove the item 
      // from `newOrderRequests` for ALL DBs, including this one.
      
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to accept order.';
      if (/accepted by another/i.test(message)) {
          // If another DB took it first, just fetch to update UI state
          fetchOrders(); 
      }
      toast.error(message);
      console.error(err);
    } finally {
      setProcessingOrder(null);
    }
  };


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

        {/* New Order Requests Section */}
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <FaBell className="mr-2 text-purple-600" /> New Order Requests ({newOrderRequests.length})
        </h2>
        {newOrderRequests.length > 0 ? (
          <div className="space-y-6 mb-8">
            {newOrderRequests.map(order => {
              const { bg, text, label } = getStatusColor(order.status);
              // Ensure order.order and deliveryAddress exist before accessing properties
              const deliveryAddress = order.order?.deliveryAddress || {};
              
              return (
                <div key={order._id} className="bg-white rounded-xl shadow-lg border border-purple-200 overflow-hidden">
                  
                  {/* Order Header */}
                  <div className={`p-4 ${bg} ${text} flex justify-between items-center`}>
                    <div className="font-bold text-lg">
                      New Request #{order.order?._id?.slice(-6) || 'N/A'}
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
                        <p className="font-medium">{deliveryAddress.name || 'N/A'}</p>
                        <p className="text-gray-600">{deliveryAddress.mobileNumber || 'N/A'}</p>
                        <p className="text-gray-600">{deliveryAddress.addressLine || 'N/A'}, {deliveryAddress.city || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0">
                    <DeliveryButton 
                        orderId={order._id} 
                        targetStatus="accept" // Custom targetStatus for acceptance
                        icon={<FaCheckCircle />}
                        label="Accept Order"
                        handleUpdate={handleAcceptOrder} // Use new handler
                        isDisabled={processingOrder === order._id}
                        isLoading={processingOrder === order._id}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h2l2 1v2H1V19l2-1h2M5 10V7a7 7 0 0114 0v3M12 6v0" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No New Requests</h2>
            <p className="text-gray-600 mb-4">New delivery requests will appear here after the shop starts preparing the order.</p>
          </div>
        )}

        {/* My Assigned Deliveries Section */}
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          My Assigned Deliveries ({assignedOrders.length})
        </h2>

        {/* Order List */}
        {assignedOrders.length > 0 ? (
          <div className="space-y-6">
            {assignedOrders.map(order => {
              const { bg, text, label } = getStatusColor(order.status);
              const { deliveryAddress } = order.order;
              const isDelivered = order.status.toLowerCase() === 'delivered' || order.status.toLowerCase() === 'cancelled';
              
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
                        
                        {/* Ready for Pickup Button - DB must wait for Owner to set this now */}
                        <DeliveryButton 
                            orderId={order._id} 
                            currentStatus={order.status}
                            targetStatus="ready_for_pickup"
                            icon={<FaClock />}
                            label="Ready for Pickup"
                            handleUpdate={handleStatusUpdate}
                            // DB is disabled from managing this status now. It's the owner's responsibility.
                            isDisabled={true} 
                            isLoading={false}
                        />

                        <DeliveryButton 
                            orderId={order._id} 
                            currentStatus={order.status}
                            targetStatus="out_for_delivery"
                            icon={<FaMotorcycle />}
                            label="Out for Delivery"
                            handleUpdate={handleStatusUpdate}
                            isDisabled={isDelivered || order.status.toLowerCase() !== 'ready_for_pickup'} // DB can only set this AFTER owner sets it to 'ready_for_pickup'
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
                        
                        <div className="col-span-full pt-2">
                          <p className="text-xs text-gray-500">
                            Update status after pickup and drop-off.
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
            <p className="text-gray-600 mb-4">You currently have no orders assigned for delivery.</p>
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
        } else if (targetStatus === 'accept') { // Special styling for accept button
            buttonClass += ' bg-purple-600 text-white hover:bg-purple-700 shadow-md';
        }
        else {
            // Use specific colors for active statuses
            let activeBg = isCurrentStatus ? bg : 'bg-white border border-gray-200';
            let activeText = isCurrentStatus ? text : 'text-gray-700 hover:text-red-600';
            let hoverBg = isCurrentStatus ? `hover:${bg.replace('600', '700')}` : 'hover:bg-red-50';
            buttonClass += ` ${activeBg} ${activeText} ${hoverBg}`;
        }
    }

    const buttonLabel = isCurrentStatus && !isLoading && targetStatus !== 'accept' ? label.split(' ')[0] + 'ed' : label;

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