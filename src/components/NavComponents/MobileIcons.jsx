import React from 'react';
import { 
  FaShoppingCart, 
  FaBars, 
  FaTimes, 
  FaPlus, 
  FaClock, 
  FaStore 
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectCartItemCount } from '../../redux/cartSlice';

const MobileIcons = ({
  isOwner,
  hasShop,
  ordersCount,
  isMobileMenuOpen,
  toggleMobileMenu,
  handleNavigate
}) => {
  const cartCount = useSelector(selectCartItemCount);
  const handleOwnerOrdersClick = () => handleNavigate('/shop/orders');
  const handleCreateShopClick = () => handleNavigate('/owner/create-shop');
  const handleAddFoodClick = () => handleNavigate('/owner/add-food');

  return (
    <div className="flex items-center space-x-3 lg:hidden">
      
      {/* OWNER: Manage Orders (Mobile) - SHOW ONLY IF HAS SHOP */}
      {hasShop && (
        <button
          onClick={handleOwnerOrdersClick}
          className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-full"
          title={`Manage Pending Orders (${ordersCount} New)`} 
        >
          <FaClock className="text-xl"/>
          {ordersCount > 0 && (
            <span className={`
              absolute -top-1 -right-1 
              bg-red-600 
              text-white text-[10px] font-semibold 
              rounded-full h-4 min-w-4 px-[2px] 
              flex items-center justify-center border-2 border-white 
            `}>
              {ordersCount}
            </span>
          )}
        </button>
      )}

      {/* OWNER: Add Food Item (Mobile) - SHOW ONLY IF HAS SHOP */}
      {hasShop && (
        <div className="relative">
          <button
            onClick={handleAddFoodClick}
            className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            title="Add Food Item" 
          >
            <FaPlus className="text-lg" />
          </button>
        </div>
      )}
      
      {/* OWNER: Create Shop (Mobile) - SHOW ONLY IF OWNER BUT NO SHOP FOUND */}
      {isOwner && !hasShop && (
        <div className="relative">
          <button
            onClick={handleCreateShopClick}
            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            title="Create Shop" 
          >
            <FaStore className="text-lg" />
          </button>
        </div>
      )}
      
      {/* USER: Cart (Mobile) - SHOW ONLY IF NOT OWNER */}
      {!isOwner && (
        <button 
          onClick={() => handleNavigate('/cart')} 
          className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-full"
        >
          <FaShoppingCart className="text-xl" />
          {cartCount > 0 && (
            <span className={`
              absolute -top-1 -right-1 
              bg-red-600 
              text-white text-[10px] font-semibold 
              rounded-full h-4 min-w-4 px-[2px] 
              flex items-center justify-center border-2 border-white 
            `}>
              {cartCount}
            </span>
          )}
        </button>
      )}

      {/* Mobile Menu Button */}
      <button onClick={toggleMobileMenu} className="p-2 text-gray-700 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-lg">
        {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>
    </div>
  );
};

export default MobileIcons;