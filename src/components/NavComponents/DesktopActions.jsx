import React from 'react';
import { FaSearch, FaShoppingCart, FaPlus, FaClock, FaTruck } from 'react-icons/fa';

const DesktopActions = ({
  isOwner,
  isDeliveryBoy, // New prop added
  hasShop,
  searchQuery,
  setSearchQuery,
  handleSearch,
  handleNavigate,
  cartCount,
  ordersCount,
}) => {
  const handleOwnerOrdersClick = () => handleNavigate('/shop/orders');
  const handleUserOrdersClick = () => handleNavigate('/my-orders');
  const handleAddFoodClick = () => handleNavigate('/add-food-item');
  const handleDeliveryOrdersClick = () => handleNavigate('/delivery');

  // --- Delivery Boy View ---
  if (isDeliveryBoy) {
    return (
      <button 
        onClick={handleDeliveryOrdersClick}
        className="relative text-gray-700 hover:text-red-500 transition-colors font-medium text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-lg flex items-center space-x-2"
      >
        <FaTruck className="text-lg" />
        <span>My Deliveries</span>
      </button>
    );
  }

  // --- Owner View ---
  if (isOwner && hasShop) {
    return (
      <>
        <button
          onClick={handleAddFoodClick}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <FaPlus className="text-sm" />
          <span>Add Food Item</span>
        </button>

        <button 
          onClick={handleOwnerOrdersClick}
          className="relative text-gray-700 hover:text-orange-500 transition-colors font-medium text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-lg"
        >
          Manage Orders
          {ordersCount > 0 && (
            <span className={`
              absolute -top-2 -right-3 
              bg-red-600 
              text-white text-[10px] font-semibold
              rounded-full h-5 min-w-5 px-1 
              flex items-center justify-center border-2 border-white
            `}>
              {ordersCount}
            </span>
          )}
        </button>
      </>
    );
  }

  // --- User (Customer) View (Default) ---
  return (
    <>
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for restaurants, food, or cuisines"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-shadow"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </form>
      
      <button 
        onClick={() => handleNavigate('/cart')} 
        className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-full"
      >
        <FaShoppingCart className="text-xl" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold border-2 border-white shadow-sm">
            {cartCount}
          </span>
        )}
      </button>

      <button 
        onClick={handleUserOrdersClick}
        className="relative text-gray-700 hover:text-orange-500 transition-colors font-medium text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-lg"
      >
        My Orders
      </button>
    </>
  );
};

export default DesktopActions;