import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart } from '@/redux/cartSlice';
import { useToast } from '@/context/ToastContext';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const placeholder = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop';
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b">
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
        <img 
          src={item.image || placeholder} 
          alt={item.name} 
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = placeholder; }}
        />
      </div>
      
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-600">{item.shopName}</p>
        <div className="flex items-center mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            item.foodType === 'Veg' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {item.foodType}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
            className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50"
          >
            -
          </button>
          <span className="min-w-[2ch] text-center">{item.quantity}</span>
          <button 
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="px-3 py-1 rounded-md border bg-white hover:bg-gray-50"
          >
            +
          </button>
        </div>
        
        <div className="text-right">
          <div className="font-semibold">₹{item.price * item.quantity}</div>
          <div className="text-sm text-gray-500">₹{item.price} each</div>
        </div>
        
        <button 
          onClick={() => onRemove(item.id)}
          className="p-2 text-gray-500 hover:text-red-600"
          aria-label="Remove item"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const { items, totalAmount, totalQuantity } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  const handleUpdateQuantity = (itemId, quantity) => {
    dispatch(updateQuantity({ id: itemId, quantity }));
  };
  
  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
    showToast('Item removed from cart', 'success');
  };
  
  const handleClearCart = () => {
    dispatch(clearCart());
    showToast('Cart cleared', 'success');
  };
  
  const handleCheckout = () => {
    showToast('Checkout functionality coming soon!', 'info');
  };
  
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 mt-8">
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Add some delicious items to your cart and come back!</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700">
            <FaArrowLeft /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Your Cart ({totalQuantity} items)</h1>
        <button 
          onClick={handleClearCart}
          className="px-4 py-2 text-sm text-gray-600 hover:text-red-600"
        >
          Clear Cart
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="divide-y">
          {items.map(item => (
            <CartItem 
              key={item.id} 
              item={item} 
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold">₹{totalAmount}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-semibold">₹40</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Tax</span>
          <span className="font-semibold">₹{Math.round(totalAmount * 0.05)}</span>
        </div>
        <div className="border-t my-4"></div>
        <div className="flex justify-between mb-6">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold">₹{totalAmount + 40 + Math.round(totalAmount * 0.05)}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/" className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-center">
            Continue Shopping
          </Link>
          <button 
            onClick={handleCheckout}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;