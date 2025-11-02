import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderApi';

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
        return 'bg-yellow-500';
      case 'out for delivery':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'preparing':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'out for delivery':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-red-400 text-white py-6 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/orders" className="text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold">Order #{order._id?.slice(-6)}</h1>
            </div>
            <div className={`px-3 py-1 rounded-full text-white text-sm flex items-center space-x-1 ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
              <span>{status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Order Summary
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
                  <span className="font-bold text-lg">₹{totalAmount}</span>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Delivery Address
              </h3>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-gray-800">{deliveryAddress?.addressLine}</p>
                <p className="text-gray-600">{deliveryAddress?.city}, {deliveryAddress?.state} - {deliveryAddress?.pincode}</p>
              </div>
            </div>

            {/* Shop Orders */}
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
                            {so.status}
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
                                <span>{it.item?.name}</span>
                              </div>
                              <span className="font-medium">₹{it.pricePerUnit * it.quantity}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="border-t pt-3 space-y-1">
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
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Order Timeline */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Order Status
              </h2>
              
              <div className="space-y-6">
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="rounded-full h-8 w-8 bg-green-500 text-white flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="h-full border-l-2 border-green-500 mx-auto"></div>
                  </div>
                  <div className="pb-6">
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-gray-500">{new Date(createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`rounded-full h-8 w-8 ${status === 'preparing' || status === 'out_for_delivery' || status === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'} flex items-center justify-center`}>
                      {status === 'preparing' || status === 'out_for_delivery' || status === 'delivered' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span>2</span>
                      )}
                    </div>
                    <div className={`h-full border-l-2 ${status === 'out_for_delivery' || status === 'delivered' ? 'border-green-500' : 'border-gray-300'} mx-auto`}></div>
                  </div>
                  <div className="pb-6">
                    <p className={`font-medium ${status === 'preparing' || status === 'out_for_delivery' || status === 'delivered' ? 'text-black' : 'text-gray-500'}`}>Preparing</p>
                    <p className="text-sm text-gray-500">Your food is being prepared</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`rounded-full h-8 w-8 ${status === 'out_for_delivery' || status === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'} flex items-center justify-center`}>
                      {status === 'out_for_delivery' || status === 'delivered' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span>3</span>
                      )}
                    </div>
                    <div className={`h-full border-l-2 ${status === 'delivered' ? 'border-green-500' : 'border-gray-300'} mx-auto`}></div>
                  </div>
                  <div className="pb-6">
                    <p className={`font-medium ${status === 'out_for_delivery' || status === 'delivered' ? 'text-black' : 'text-gray-500'}`}>Out for Delivery</p>
                    <p className="text-sm text-gray-500">Your order is on the way</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`rounded-full h-8 w-8 ${status === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'} flex items-center justify-center`}>
                      {status === 'delivered' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span>4</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className={`font-medium ${status === 'delivered' ? 'text-black' : 'text-gray-500'}`}>Delivered</p>
                    <p className="text-sm text-gray-500">Enjoy your meal!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}