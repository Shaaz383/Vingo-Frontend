import { useEffect, useState } from 'react';
import { getMyOrders } from '../services/orderApi';
import { Link } from 'react-router-dom';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        console.log("Orders data:", data);
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
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
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h1 className="text-3xl font-bold">My Orders</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 pt-8">
        {orders.length === 0 ? (
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
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
                <div className="border-b border-gray-100 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-500 text-white p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-lg">Order #{order._id.slice(-6)}</div>
                        <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-bold text-lg">₹{order.totalAmount}</div>
                      <div className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {order.shopOrders?.length || 0} {order.shopOrders?.length === 1 ? 'restaurant' : 'restaurants'}
                  </div>
                  <Link 
                    to={`/orders/${order._id}`} 
                    className="flex items-center text-red-500 hover:text-red-600 font-medium"
                  >
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}