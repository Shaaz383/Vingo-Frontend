import React from "react";
import { 
  FaSearch,
  FaShoppingCart,
  FaHistory,
  FaStore,
  FaPlus,
  FaClock,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaTruck
} from "react-icons/fa";
import CitySelectorDropdown from './CitySelectorDropdown';

const MobileMenu = ({
  isMobileMenuOpen,
  mobileMenuRef,
  isOwner,
  isDeliveryBoy, // New prop added
  hasShop,
  searchQuery,
  setSearchQuery,
  handleSearch,
  handleNavigate,
  cartCount,
  ordersCount,
  handleLogout,
  cityRefMobile,
  isCitySelectorOpen,
  toggleCitySelector,
  location,
  cityLoading,
  cityError,
  citySearch,
  handleCitySearchChange,
  handleCitySelect,
  requestCity,
  INDIAN_CITIES,
}) => {
  if (!isMobileMenuOpen) return null;

  const DeliveryBoyLinks = (
    <div className="space-y-2 pt-2 border-t border-gray-200">
      <p className="text-sm font-semibold text-gray-500 px-3">
        Delivery Actions
      </p>
      
      <button
        onClick={() => handleNavigate("/delivery")}
        className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <FaTruck className="text-red-500 h-5 w-5" />
        <span className="text-sm font-medium">My Deliveries</span>
      </button>
    </div>
  );

  const OwnerLinks = isOwner && (
    <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
      <p className="text-sm font-semibold text-gray-500 px-3">
        Owner Actions
      </p>

      {hasShop ? (
        <>
          <button
            onClick={() => handleNavigate("/owner/dashboard")}
            className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <FaStore className="text-orange-500 h-5 w-5" />
            <span className="text-sm font-medium">Shop Dashboard</span>
          </button>

          <button
            onClick={() => handleNavigate("/add-food-item")}
            className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <FaPlus className="text-gray-400 h-5 w-5" />
            <span className="text-sm font-medium">Add Food Item</span>
          </button>

          <button
            onClick={() => handleNavigate("/shop/orders")}
            className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <div className="flex items-center space-x-3">
              <FaClock className="text-gray-400 h-5 w-5" />
              <span className="text-sm font-medium">Manage Orders</span>
            </div>
            {ordersCount > 0 && (
              <span className="bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                {ordersCount}
              </span>
            )}
          </button>
        </>
      ) : null}
    </div>
  );

  const CustomerLinks = !isOwner && (
    <>
      <button
        onClick={() => handleNavigate("/cart")}
        className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <div className="flex items-center space-x-3">
          <FaShoppingCart className="text-orange-500 h-5 w-5" />
          <span className="text-sm font-medium">Cart</span>
        </div>
        {cartCount > 0 && (
          <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {cartCount}
          </span>
        )}
      </button>

      <button
        onClick={() => handleNavigate("/my-orders")}
        className="relative w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <FaHistory className="text-gray-400 h-5 w-5" />
        <span className="text-sm font-medium">My Orders</span>
      </button>
    </>
  );


  return (
    <div
      className="lg:hidden border-t border-gray-200 py-4 px-4 sm:px-6 transition-all duration-300 ease-out"
      ref={mobileMenuRef}
    >
      {/* 📍 City Selector (Hidden for Delivery Boy) */}
      {!isDeliveryBoy && (
        <div className="pb-3">
          <CitySelectorDropdown
            cityRef={cityRefMobile}
            isCitySelectorOpen={isCitySelectorOpen}
            toggleCitySelector={toggleCitySelector}
            location={location}
            cityLoading={cityLoading}
            cityError={cityError}
            citySearch={citySearch}
            handleCitySearchChange={handleCitySearchChange}
            handleCitySelect={handleCitySelect}
            requestCity={requestCity}
            INDIAN_CITIES={INDIAN_CITIES}
            isOwner={isOwner}
            isMobile={true}
          />
        </div>
      )}

      {/* 🌐 Menu Items */}
      <div className="space-y-2 pt-2 border-t border-gray-200">
        
        {/* Delivery Boy Specific Links */}
        {isDeliveryBoy && DeliveryBoyLinks}

        {/* Customer Specific Links */}
        {!isDeliveryBoy && CustomerLinks}

        {/* Owner Specific Links */}
        {!isDeliveryBoy && OwnerLinks}

        {/* 👤 Profile / ⚙️ Settings / 🚪 Logout (Common) */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleNavigate("/profile")}
            className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <FaUser className="text-gray-400 h-5 w-5" />
            <span className="text-sm font-medium">Profile</span>
          </button>

          <button
            onClick={() => handleNavigate("/settings")}
            className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <FaCog className="text-gray-400 h-5 w-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLogout();
            }}
            type="button"
            className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 active:bg-red-100"
          >
            <FaSignOutAlt className="text-red-500 h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;