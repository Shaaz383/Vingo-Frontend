import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderApi';
import { FaUser, FaPhone, FaTruck, FaMapMarkerAlt, FaReceipt, FaMotorcycle } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext'; // Import useSocket

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useSocket(); // Use the socket context

  const fetchOrder = async () => {
    try {
      const data = await getOrderById(id);
      setOrder(data.order || data);
    } catch (err) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Socket listener for real-time updates (CRITICAL FIX)
  useEffect(() => {
    if (!socket) return;

    const handleOrderStatusUpdate = (data) => {
      // Check if the update is for this specific order
      if (data.orderId === id) {
        setOrder(prevOrder => {
          if (!prevOrder) return null;

          // Find and update the specific shopOrder within the main order
          const updatedShopOrders = prevOrder.shopOrders.map(so => {
            if (so._id === data.shopOrderId) {
              return { 
                ...so, 
                status: data.status, 
                deliveryBoy: data.deliveryBoy || so.deliveryBoy 
              };
            }
            return so;
          });

          return { ...prevOrder, shopOrders: updatedShopOrders };
        });
      }
    };

    socket.on('orderStatusUpdated', handleOrderStatusUpdate);

    return () => {
      socket.off('orderStatusUpdated', handleOrderStatusUpdate);
    };
  }, [socket, id]); 

  // Unified function to get professional status display properties
  const getStatusProps = (status) => {
    const lowerStatus = status?.toLowerCase();
    let label = status?.replace(/_/g, ' ') || 'Unknown';
    let colorClass = 'bg-gray-500';
    let icon = null;
    let customMessage = '';

    switch (lowerStatus) {
        case 'created':
        case 'pending':
            label = 'Order Placed, Awaiting Shop Confirmation';
            colorClass = 'bg-yellow-500';
            icon = '☕';
            customMessage = 'The shop owner is reviewing your order and will confirm soon.';
            break;
        case 'preparing':
            label = 'Shop Accepted & Preparing Food';
            colorClass = 'bg-blue-500';
            icon = '👨‍🍳';
            customMessage = 'The shop has accepted your order and is currently cooking.';
            break;
        case 'accepted':
            label = 'Delivery Boy Assigned';
            colorClass = 'bg-indigo-600';
            icon = '✅';
            customMessage = 'A delivery hero has been assigned to your order.';
            break;
        case 'ready_for_pickup':
            label = 'Ready for Delivery Pickup';
            colorClass = 'bg-orange-500';
            icon = '📦';
            customMessage = 'Your food is ready and waiting for the assigned delivery hero to pick it up.';
            break;
        case 'out_for_delivery':
            label = 'Out for Delivery';
            colorClass = 'bg-green-600';
            icon = '🏍️';
            customMessage = 'Your delivery hero is on the way to your location.';
            break;
        case 'delivered':
            label = 'Delivered';
            colorClass = 'bg-red-600'; 
            icon = '🎉';
            customMessage = 'Enjoy your meal!';
            break;
        case 'cancelled':
            label = 'Cancelled';
            colorClass = 'bg-gray-400';
            icon = '❌';
            customMessage = 'This order was cancelled.';
            break;
        default:
            label = status;
            colorClass = 'bg-gray-500';
            customMessage = '';
    }
    
    // Auto capitalize each word
    label = label.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return { label, colorClass, icon, customMessage };
  };


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
  
  if (!order) return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p className="font-bold">Not Found</p>
        <p>Order not found</p>
      </div>
    </div>
  );

  const { status, createdAt, deliveryAddress, shopOrders = [] } = order;
  
  // FIX 1: Recalculate totals from shop orders for accurate display
  const itemsSubtotal = shopOrders.reduce((sum, so) => sum + (so.subtotal || 0), 0);
  const deliveryFee = shopOrders.reduce((sum, so) => sum + (so.deliveryFee || 0), 0);
  const taxes = shopOrders.reduce((sum, so) => sum + (so.tax || 0), 0);
  const finalTotal = shopOrders.reduce((sum, so) => sum + (so.total || 0), 0);
  
  // FIX 2: Determine overall order status and assigned Delivery Boy
  let overallOrderStatus = status; // Start with the main order status (which might be 'created')
  let assignedDeliveryBoy = null;
  
  // Find the MOST advanced status and the assigned DB from ANY shopOrder
  shopOrders.forEach(so => {
    // Check for DB assignment
    if (so.deliveryBoy) {
        assignedDeliveryBoy = so.deliveryBoy;
    }
    
    // Use the shop order status if it's more advanced than the main order status
    const currentStatusRank = ['created', 'pending', 'preparing', 'accepted', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'];
    if (currentStatusRank.indexOf(so.status?.toLowerCase()) > currentStatusRank.indexOf(overallOrderStatus?.toLowerCase())) {
        overallOrderStatus = so.status;
    }
  });

  // Use the calculated overall status for the header badge and the timeline
  const headerStatusProps = getStatusProps(overallOrderStatus);
  const dbStatusProps = getStatusProps(overallOrderStatus); 


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-red-400 text-white py-6 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/my-orders" className="text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold">Order #{order._id?.slice(-6)}</h1>
            </div>
            {/* Professional Status Badge */}
            <div className={`px-3 py-1 rounded-full text-white text-sm font-medium flex items-center space-x-1 ${headerStatusProps.colorClass}`}>
              <span role="img" aria-label="status icon">{headerStatusProps.icon}</span>
              <span>{headerStatusProps.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Summary & Delivery Details */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Delivery Boy Card (FIXED) */}
            {assignedDeliveryBoy ? (
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                <h2 className="text-xl font-bold mb-3 flex items-center text-red-600">
                  <FaMotorcycle className="mr-2" /> Your Delivery Hero
                </h2>
                <div className="flex items-center space-x-4">
                    {assignedDeliveryBoy.profilePicture ? (
                        <img src={assignedDeliveryBoy.profilePicture} alt="DB Profile" className="w-12 h-12 rounded-full object-cover border border-red-200" />
                    ) : (
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-red-500 h-6 w-6" />
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-lg">{assignedDeliveryBoy.fullName}</p>
                        <p className="text-sm text-gray-600 flex items-center">
                            <FaPhone className="w-3 h-3 mr-1" /> {assignedDeliveryBoy.mobile || 'N/A'}
                        </p>
                    </div>
                </div>
                <div className='mt-4 text-sm text-gray-500'>
                    Current Status: <span className={`font-semibold capitalize text-gray-800`}>{dbStatusProps.label}</span>
                    <p className='mt-1 text-xs text-gray-500'>{dbStatusProps.customMessage}</p>
                </div>
              </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-3 flex items-center text-gray-700">
                        <FaTruck className="mr-2 text-gray-500" /> Delivery Assignment Status
                    </h2>
                    <p className="text-sm text-gray-500">{dbStatusProps.customMessage}</p>
                </div>
            )}
            
            {/* Address and Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaMapMarkerAlt className="h-6 w-6 mr-2 text-red-500" />
                Delivery Information
              </h2>
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">{new Date(createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-lg">₹{Math.round(finalTotal)}</span>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                <FaMapMarkerAlt className="h-5 w-5 mr-2 text-red-500" />
                Delivery Address
              </h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-gray-800 font-medium">{deliveryAddress?.name || order?.user?.fullName || 'N/A'}</p>
                <p className="text-gray-800">{deliveryAddress?.addressLine}</p>
                <p className="text-gray-600">{deliveryAddress?.city}, {deliveryAddress?.state} - {deliveryAddress?.pincode}</p>
                <p className="text-gray-600 mt-1">
                  <span className="font-medium">Mobile:</span> {deliveryAddress?.mobileNumber || 'Not provided'}
                </p>
              </div>
            </div>

            {/* Shop Orders / Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaReceipt className="h-6 w-6 mr-2 text-red-500" />
                Restaurant Orders
              </h2>
              
              {shopOrders.length === 0 ? (
                <div className="text-center py-6 text-gray-500">No restaurant orders found.</div>
              ) : (
                <div className="space-y-6">
                  {shopOrders.map((so) => (
                    <div key={so._id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-red-100 text-red-600 p-2 rounded-full">
                              <FaReceipt className="h-5 w-5" />
                            </div>
                            <h3 className="font-medium">{so.shop?.name || 'Restaurant'}</h3>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs text-white ${getStatusProps(so.status).colorClass}`}>
                            {getStatusProps(so.status).label}
                          </div>
                        </div>
                        {so.deliveryBoy && (
                            <div className="mt-2 text-xs text-gray-700 flex items-center space-x-1">
                                <FaMotorcycle className="w-3 h-3 text-red-400" /> 
                                <span>Assigned to: {so.deliveryBoy.fullName}</span>
                            </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h4 className="font-medium text-sm text-gray-600 mb-2">Items</h4>
                        <ul className="space-y-2 mb-4">
                          {so.items?.map((it) => (
                            <li key={it._id} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
                                  {it.quantity}
                                </span>
                                <span>{it.item?.name || it.itemName || 'Item'}</span>
                              </div>
                              <span className="font-medium">₹{it.total}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="border-t pt-3 space-y-1">
                          <div className="flex justify-between font-bold pt-2 border-t">
                            <span>Total (incl. fees):</span>
                            <span>₹{Math.round(so.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Order Summary Details at the end */}
                  <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-medium text-gray-800 mb-2">Order Totals</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items Subtotal</span>
                        <span>₹{Math.round(itemsSubtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span>₹{Math.round(deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxes</span>
                        <span>₹{Math.round(taxes)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t mt-2">
                        <span>Grand Total</span>
                        <span>₹{Math.round(finalTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Timeline (Side Bar) */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Order Status Timeline
              </h2>
              
              {/* Simplified Timeline */}
              <div className="space-y-6">
                {['created', 'pending', 'preparing', 'accepted', 'ready_for_pickup', 'out_for_delivery', 'delivered'].map((step, index) => {
                    const currentStatus = overallOrderStatus; 
                    const isActive = currentStatus?.toLowerCase() === step; 
                    
                    const progressSteps = ['pending', 'preparing', 'accepted', 'ready_for_pickup', 'out_for_delivery', 'delivered'];
                    const currentProgressIndex = progressSteps.indexOf(currentStatus?.toLowerCase());
                    const stepIndex = progressSteps.indexOf(step);
                    const isCompleted = stepIndex < currentProgressIndex; 

                    const stepProps = getStatusProps(step);

                    return (
                        <div key={step} className="flex">
                            <div className="flex flex-col items-center mr-4">
                                <div className={`rounded-full h-8 w-8 ${isCompleted ? 'bg-green-500' : isActive ? 'bg-red-500' : 'bg-gray-300'} text-white flex items-center justify-center`}>
                                    {isCompleted || isActive ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                                {index < 6 && ( 
                                    <div className={`h-full border-l-2 ${isCompleted ? 'border-green-500' : 'border-gray-300'} mx-auto`}></div>
                                )}
                            </div>
                            <div className="pb-6">
                                <p className={`font-medium ${isCompleted || isActive ? 'text-black' : 'text-gray-500'}`}>
                                    {stepProps.label}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {stepProps.customMessage}
                                </p>
                            </div>
                        </div>
                    );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}