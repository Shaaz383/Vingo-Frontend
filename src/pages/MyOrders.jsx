import { useEffect, useState } from 'react';
import { getMyOrders, getOrderById } from '../services/orderApi';
import { Link } from 'react-router-dom';
import { FaBox, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaSync, FaStore, FaMoneyBillWave, FaShippingFast, FaReceipt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      
      // CRITICAL FIX: Filter out null, undefined, or incomplete order objects
      const validOrders = (data.orders || []).filter(order => 
        order && 
        order.shopOrders && 
        order.shopOrders.length > 0 &&
        order.totalAmount !== undefined &&
        order.totalAmount !== null &&
        order.totalAmount > 0 // Ensure order has a valid amount
      );
      
      setOrders(validOrders);
      if (validOrders.length > 0) {
        // toast.success('Orders loaded successfully'); // Keeping toast minimal
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || 'Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Socket.io event listener for real-time order status updates
  useEffect(() => {
    if (!socket) return;

    const handleOrderStatusUpdate = (data) => {
      console.log('Received order status update:', data);
      
      // Update orders list with new status
      setOrders(prevOrders => 
        prevOrders.map(order => {
          // Find the shop order that matches the updated one
          const updatedShopOrders = (order.shopOrders || []).map(shopOrder => {
            if (shopOrder._id === data.shopOrderId) {
              // Show toast notification for status update
              toast.success(`Order status updated to: ${data.status}`);
              return { ...shopOrder, status: data.status, deliveryBoy: data.deliveryBoy || shopOrder.deliveryBoy };
            }
            return shopOrder;
          });
          
          return {
            ...order,
            status: data.status, // <-- Update top-level status
            shopOrders: updatedShopOrders
          };
        })
      );
      
      // Update order details if expanded
      if (orderDetails[data.orderId]) {
        setOrderDetails(prev => ({
          ...prev,
          [data.orderId]: {
            ...prev[data.orderId],
            status: data.status, // <-- Update top-level status
            shopOrders: prev[data.orderId].shopOrders.map(shopOrder => {
              if (shopOrder._id === data.shopOrderId) {
                return { ...shopOrder, status: data.status, deliveryBoy: data.deliveryBoy || shopOrder.deliveryBoy };
              }
              return shopOrder;
            })
          }
        }));
      }
    };

    socket.on('orderStatusUpdated', handleOrderStatusUpdate);

    return () => {
      socket.off('orderStatusUpdated', handleOrderStatusUpdate);
    };
  }, [socket, orderDetails]);

  const fetchOrderDetails = async (orderId) => {
    if (orderDetails[orderId]) {
      return;
    }

    try {
      setLoadingDetails(true);
      const data = await getOrderById(orderId);
      setOrderDetails(prev => ({
        ...prev,
        [orderId]: data.order || data
      }));
    } catch (err) {
      console.error("Error fetching order details:", err);
      // Fallback to basic order info if fetch fails
      const currentOrder = orders.find(o => o._id === orderId);
      if (currentOrder) {
        setOrderDetails(prev => ({
          ...prev,
          [orderId]: {
            ...currentOrder,
            user: currentOrder.user || { name: 'User', email: 'Not available' },
            deliveryAddress: currentOrder.deliveryAddress || { 
              addressLine: 'Address not available',
              city: '',
              state: '',
              pincode: ''
            },
            payment: currentOrder.payment || { method: 'Cash on Delivery', status: 'Pending' }
          }
        }));
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const toggleOrderExpand = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      try {
        setLoadingDetails(true);
        // Fetch complete order details from the backend
        const data = await getOrderById(orderId);
        setOrderDetails(prev => ({
          ...prev,
          [orderId]: data.order || data
        }));
      } catch (err) {
        console.error("Error fetching order details:", err);
        // Fallback to basic order info if fetch fails
        const currentOrder = orders.find(o => o._id === orderId);
        if (currentOrder) {
          setOrderDetails(prev => ({
            ...prev,
            [orderId]: {
              ...currentOrder,
              user: currentOrder.user || { name: 'User', email: 'Not available' },
              deliveryAddress: currentOrder.deliveryAddress || { 
                addressLine: 'Address not available',
                city: '',
                state: '',
                pincode: ''
              },
              payment: currentOrder.payment || { method: 'Cash on Delivery', status: 'Pending' }
            }
          }));
        }
      } finally {
        setLoadingDetails(false);
      }
    }
  };

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

  // Compute aggregate totals for a given order's shopOrders
  const computeTotals = (shopOrders = []) => {
    const itemsSubtotal = shopOrders.reduce((sum, so) => sum + (so.subtotal || 0), 0);
    const deliveryFee = shopOrders.reduce((sum, so) => sum + (so.deliveryFee || 0), 0);
    const taxes = shopOrders.reduce((sum, so) => sum + (so.tax || 0), 0);
    const grandTotal = shopOrders.reduce((sum, so) => sum + (so.total || 0), 0);
    return { itemsSubtotal, deliveryFee, taxes, grandTotal };
  };

  // Compute overall status from shopOrders (handles cases where main order status is not updated)
  const computeOverallStatus = (orderObj) => {
    const baseStatus = orderObj?.status || 'created';
    const ranks = ['created', 'pending', 'preparing', 'accepted', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'];
    let overall = baseStatus;
    (orderObj?.shopOrders || []).forEach(so => {
      const soStatus = (so.status || '').toLowerCase();
      if (ranks.indexOf(soStatus) > ranks.indexOf(overall?.toLowerCase())) {
        overall = so.status;
      }
    });
    return overall;
  };

  const calculateSubtotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    
    return items.reduce((total, item) => {
      // Use pre-calculated total if available, otherwise calculate from price/quantity
      const quantity = item.quantity || 0;
      const price = item.priceAtPurchase || (item.item?.price) || 0;
      return total + (item.total || (quantity * price));
    }, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-4">Looks like you haven't placed any orders yet.</p>
          <Link to="/" className="inline-block bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-full transition duration-200">
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-transform duration-200">
              <div 
                className="border-b border-gray-100 bg-white p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleOrderExpand(order._id)}
              >
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <div className="bg-red-500 text-white p-3 rounded-full">
                      <FaReceipt className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Order #{order._id.slice(-6)}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {(order.shopOrders || []).reduce((total, shop) => total + (shop.items?.length || 0), 0) || 0} items
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-bold text-lg">₹{Math.round(order.totalAmount)}</div>
                    <div className={`text-xs px-2 py-1 rounded-full text-white capitalize ${getStatusColor(computeOverallStatus(order))}`}>
                      {computeOverallStatus(order)?.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
              </div>

              {expandedOrder === order._id && (
                <div className="p-4 border-t border-gray-100">
                  {loadingDetails ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                    </div>
                  ) : orderDetails[order._id] ? (
                    <div className="space-y-6">
                      {/* User Details */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                          <FaUser className="mr-2 text-red-500" />
                          User Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium">{orderDetails[order._id].deliveryAddress?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{orderDetails[order._id].user?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                          <FaMapMarkerAlt className="mr-2 text-red-500" />
                          Delivery Address
                        </h3>
                        <p className="text-gray-800">{orderDetails[order._id].deliveryAddress?.addressLine || 'N/A'}</p>
                        <p className="text-gray-600">
                          {orderDetails[order._id].deliveryAddress?.city || 'N/A'}, 
                          {orderDetails[order._id].deliveryAddress?.state || 'N/A'} - 
                          {orderDetails[order._id].deliveryAddress?.pincode || 'N/A'}
                        </p>
                        <p className="text-gray-600 mt-1">
                          <span className="font-medium">Mobile:</span> {orderDetails[order._id].deliveryAddress?.mobileNumber || 'N/A'}
                        </p>
                      </div>

                      {/* Order Items by Restaurant */}
                      <div>
                        <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                          <FaBox className="mr-2 text-red-500" />
                          Order Items
                        </h3>
                        <div className="space-y-4">
                          {orderDetails[order._id]?.shopOrders?.map((shopOrder, shopIndex) => (
                            <div key={shopOrder._id || `shop-order-${shopIndex}`} className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
                                <div className="flex items-center">
                                  <FaStore className="text-red-500 mr-2" />
                                  <span className="font-medium">{shopOrder.shop?.name || 'Restaurant'}</span>
                                </div>
                                <div className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(shopOrder.status)}`}>
                                  {shopOrder.status || 'Processing'}
                                </div>
                              </div>
                              
                              <div className="p-3">
                                <div className="space-y-3">
                                  {shopOrder.items?.map((item, index) => {
                                    // Get the item details
                                    const itemDetails = item.item || {};
                                    const itemName = itemDetails.name || item.itemName || 'Food item';
                                    const itemImage = itemDetails.image || '';
                                    const quantity = item.quantity || 0;
                                    const price = item.priceAtPurchase || (item.item?.price) || 0;
                                    const total = item.total || (quantity * price);
                                    
                                    return (
                                      <div key={item._id || `item-${shopOrder._id}-${index}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center space-x-3">
                                          {itemImage ? (
                                            <img 
                                              src={itemImage} 
                                              alt={itemName} 
                                              className="w-16 h-16 object-cover rounded-md"
                                            />
                                          ) : (
                                            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                              <FaBox className="text-gray-400" size={24} />
                                            </div>
                                          )}
                                          <div>
                                            <div className="font-medium">{itemName}</div>
                                            <div className="text-sm text-gray-600">
                                              {quantity} × ₹{price}
                                            </div>
                                          </div>
                                        </div>
                                        <span className="font-medium">₹{Math.round(total)}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                                  <span className="text-gray-600 text-sm">Subtotal</span>
                                  <span className="font-bold">₹{Math.round(calculateSubtotal(shopOrder.items))}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                          <FaReceipt className="mr-2 text-red-500" />
                          Order Summary
                        </h3>
                        <div className="space-y-2">
                          {(() => {
                            const shopOrders = orderDetails[order._id]?.shopOrders || [];
                            const totals = computeTotals(shopOrders);
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Items Total</span>
                                  <span>₹{Math.round(totals.itemsSubtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Delivery Fee</span>
                                  <span>₹{Math.round(totals.deliveryFee)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Taxes</span>
                                  <span>₹{Math.round(totals.taxes)}</span>
                                </div>
                                <div className="flex justify-between font-bold pt-2 border-t border-gray-200 mt-2">
                                  <span>Total</span>
                                  <span>₹{Math.round(totals.grandTotal || order.totalAmount || 0)}</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                          <FaMoneyBillWave className="mr-2 text-red-500" />
                          Payment Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Payment Method</p>
                            <p className="font-medium">{orderDetails[order._id].payment?.method || 'Cash on Delivery'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Payment Status</p>
                            <p className="font-medium">{orderDetails[order._id].payment?.status || 'Pending'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Status */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                          <FaShippingFast className="mr-2 text-red-500" />
                          Delivery Status
                        </h3>
                        <div className={`inline-block px-3 py-1 rounded-full text-white capitalize ${getStatusColor(computeOverallStatus(orderDetails[order._id] || order))}`}>
                          {(computeOverallStatus(orderDetails[order._id] || order) || 'created').replace(/_/g, ' ')}
                        </div>
                        {(() => {
                          const shopOrders = orderDetails[order._id]?.shopOrders || [];
                          const assigned = shopOrders.map(so => so.deliveryBoy).filter(Boolean);
                          if (assigned.length === 0) return null;
                          const db = assigned[0];
                          return (
                            <div className="mt-3 p-3 rounded-md bg-white border border-gray-200">
                              <h4 className="font-medium text-gray-700 mb-1">Assigned Delivery</h4>
                              <p className="text-sm text-gray-800">{db.fullName}</p>
                              <p className="text-sm text-gray-600">Mobile: {db.mobile || 'N/A'}</p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Failed to load order details. Please try again.
                    </div>
                  )}
                </div>
              )}

              {!expandedOrder || expandedOrder !== order._id ? (
                <div className="p-4">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FaBox className="mr-2 text-red-500" />
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {order.shopOrders?.map((shopOrder) => (
                      <div key={shopOrder._id || `shop-order-${shopOrder.shop?._id || Math.random()}`} className="bg-gray-50 p-3 rounded-md">
                        <div className="font-medium mb-2">{shopOrder.shop?.name || 'Restaurant'}</div>
                        {shopOrder.items?.map((item, index) => (
                          <div key={item._id || `collapsed-item-${shopOrder._id}-${index}`} className="flex items-center justify-between py-2 border-t border-gray-100">
                            <div className="flex items-center space-x-3">
                              {item.item?.image ? (
                                <img 
                                  src={item.item.image} 
                                  alt={item.item?.name || 'Food item'} 
                                  className="w-16 h-16 object-cover rounded-md"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                  <FaBox className="text-gray-400" size={24} />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{item.item?.name || 'Food item'}</div>
                                <div className="text-sm text-gray-600">
                                  {item.quantity || 0} × ₹{item.priceAtPurchase || item.item?.price || item.pricePerUnit || 0}
                                </div>
                              </div>
                            </div>
                            <span className="font-medium">₹{Math.round((item.quantity || 0) * (item.priceAtPurchase || item.item?.price || item.pricePerUnit || 0))}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {(order.shopOrders || []).length || 0} {order.shopOrders?.length === 1 ? 'restaurant' : 'restaurants'}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOrderExpand(order._id);
                      }}
                      className="flex items-center text-red-500 hover:text-red-600 font-medium"
                    >
                      {expandedOrder === order._id ? 'Hide Details' : 'View Full Details'}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={fetchOrders} 
        className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
        aria-label="Refresh orders"
      >
        <FaSync className="h-5 w-5" />
      </button>
    </div>
  );
}