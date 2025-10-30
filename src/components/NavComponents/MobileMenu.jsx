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
  FaSignOutAlt
} from "react-icons/fa";
import CitySelectorDropdown from './CitySelectorDropdown';

const MobileMenu = ({
  isMobileMenuOpen,
  mobileMenuRef,
  isOwner,
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

  // Use the shared CitySelectorDropdown component (desktop and mobile parity)

  return (
    <div
      className="lg:hidden border-t border-gray-200 py-4 px-4 sm:px-6 transition-all duration-300 ease-out"
      ref={mobileMenuRef}
    >
      {/* 🔍 Search (Hidden for Owner) */}
      {!isOwner && (
        <form onSubmit={handleSearch} className="mb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for restaurants, food, or cuisines"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </form>
      )}

      {/* 📍 City Selector */}
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

      {/* 🌐 Menu Items */}
      <div className="space-y-2 pt-2 border-t border-gray-200">
        {/* 🛒 Cart (only if not owner or owner with shop) */}
        {(!isOwner || (isOwner && hasShop)) && (
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
        )}

        {/* 📦 My Orders (for all users & owners with shop) */}
        {(!isOwner || (isOwner && hasShop)) && (
          <button
            onClick={() => handleNavigate("/my-orders")}
            className="relative w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <FaHistory className="text-gray-400 h-5 w-5" />
            <span className="text-sm font-medium">My Orders</span>
          </button>
        )}

        {/* 👑 Owner Actions */}
        {isOwner && (
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
        )}

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
  