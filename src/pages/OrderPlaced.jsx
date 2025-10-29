import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaListAlt, FaArrowLeft } from 'react-icons/fa';

const OrderPlaced = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, totalAmount } = location.state || {};

  if (!orderId) {
    // Redirect to home if accessed directly without order data
    navigate('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <FaCheckCircle className="text-green-500 text-6xl" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h1>
        
        <p className="text-gray-600 mb-2">Your order has been received and is being processed.</p>
        <p className="text-gray-600 mb-6">Order ID: <span className="font-semibold">{orderId}</span></p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-700 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">₹{totalAmount?.toFixed(2) || '0.00'}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <FaHome /> Continue Shopping
          </Link>
          
          <Link 
            to="/my-orders" 
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaListAlt /> View My Orders
          </Link>
          
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPlaced;