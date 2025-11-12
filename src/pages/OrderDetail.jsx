import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderApi';
import { FaUser, FaPhone, FaTruck, FaMapMarkerAlt } from 'react-icons/fa';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    fetchOrder();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500';
      case 'preparing':
      case 'accepted':
        return 'bg-blue-500';
      case 'out_for_delivery':
      case 'ready_for_pickup':
        return 'bg-orange-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    return status?.toLowerCase()?.replace(/_/g, ' ') || 'Unknown';
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

  const { totalAmount, status, createdAt, deliveryAddress, shopOrders = [] } = order;
  const deliveryBoy = shopOrders[0]?.deliveryBoy; // Assuming one delivery boy manages all shop orders

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
            <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(status)}`}>
              {getStatusLabel(status)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Summary & Delivery Details */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Delivery Boy Card (New) */}
            {deliveryBoy ? (
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                <h2 className="text-xl font-bold mb-3 flex items-center text-red-600">
                  <FaTruck className="mr-2" /> Your Delivery Hero
                </h2>
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-red-500 h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-semibold text-lg">{deliveryBoy.fullName}</p>
                        <p className="text-sm text-gray-600 flex items-center">
                            <FaPhone className="w-3 h-3 mr-1" /> {deliveryBoy.mobile || 'N/A'}
                        </p>
                    </div>
                </div>
                <div className='mt-4 text-sm text-gray-500'>
                    Status: {getStatusLabel(status)}
                </div>
              </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-3 flex items-center text-gray-700">
                        <FaTruck className="mr-2 text-gray-500" /> Delivery Status
                    </h2>
                    <p className="text-sm text-gray-500">A delivery boy will be assigned soon after the shop accepts the order.</p>
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
                  <span className="font-bold text-lg">₹{Math.round(totalAmount)}</span>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
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
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                              </svg>
                            </div>
                            <h3 className="font-medium">{so.shop?.name || 'Restaurant'}</h3>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(so.status)}`}>
                            {getStatusLabel(so.status)}
                          </div>
                        </div>
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
                            <span>Total:</span>
                            <span>₹{Math.round(so.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                Order Status
              </h2>
              
              {/* Simplified Timeline */}
              <div className="space-y-6">
                {['created', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'].map((step, index) => {
                    const isActive = status.toLowerCase() === step;
                    const isCompleted = step === 'delivered' ? status.toLowerCase() === 'delivered' : ['accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'].includes(status.toLowerCase());
                    const isOutForDelivery = status.toLowerCase() === 'out_for_delivery';

                    return (
                        <div key={step} className="flex">
                            <div className="flex flex-col items-center mr-4">
                                <div className={`rounded-full h-8 w-8 ${isCompleted || isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'} flex items-center justify-center`}>
                                    {isCompleted || isActive ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                                {index < 5 && (
                                    <div className={`h-full border-l-2 ${isCompleted ? 'border-green-500' : 'border-gray-300'} mx-auto`}></div>
                                )}
                            </div>
                            <div className="pb-6">
                                <p className={`font-medium ${isCompleted || isActive ? 'text-black' : 'text-gray-500'}`}>
                                    {getStatusLabel(step)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {step === 'created' && 'Order successfully placed'}
                                    {step === 'accepted' && 'Shop accepted your order'}
                                    {step === 'preparing' && 'The food is being prepared'}
                                    {step === 'ready_for_pickup' && 'Ready for courier pickup'}
                                    {step === 'out_for_delivery' && 'Your order is on the way'}
                                    {step === 'delivered' && 'Enjoy your meal!'}
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