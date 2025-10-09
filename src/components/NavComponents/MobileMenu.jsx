import React from 'react';
import { 
  Search, 
  ShoppingCart, 
  History, 
  Store, 
  Plus, 
  Clock, 
  User, // Used for 'Profile'
  Settings, // New icon for 'Settings'
  LogOut // Used for 'Logout'
} from 'lucide-react'; // Switched back to lucide-react to resolve the build error

// Assuming CitySelectorDropdown is available in the environment
// import CitySelectorDropdown from './CitySelectorDropdown';

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
  // City Selector Props
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

  // Placeholder for CitySelectorDropdown if the actual component is not provided,
  // to ensure the component is runnable in this single file context.
  const CitySelectorDropdown = ({ isMobile, location, toggleCitySelector }) => (
    <div 
      className={`p-3 bg-gray-50 rounded-lg flex items-center justify-between cursor-pointer ${isMobile ? 'shadow-sm' : ''}`}
      onClick={toggleCitySelector}
    >
      <span className="font-semibold text-gray-700">
        Location: {location?.city || 'Select City'}
      </span>
      {/* Used the imported Search icon */}
      <Search className="text-gray-400 h-5 w-5"/> 
    </div>
  );

  return (
    <div className="lg:hidden border-t border-gray-200 py-4 px-4 sm:px-6 transition-all duration-300 ease-out" ref={mobileMenuRef}>
      
      {/* Mobile Search - hide for owners */}
      {!isOwner && (
        <form onSubmit={handleSearch} className="mb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for restaurants, food, or cuisines"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            {/* Used the imported Search icon */}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </form>
      )}

      {/* Mobile Location Selector */}
      <div className="pb-3">
        {/* Note: Placeholder used for CitySelectorDropdown */}
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
          isMobile={true} // Indicates mobile version
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-200">
        
        {/* Cart - hide for owners */}
        {!isOwner && (
          <button 
            onClick={() => handleNavigate('/cart')} 
            className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <div className="flex items-center space-x-3">
              {/* Used the imported ShoppingCart icon */}
              <ShoppingCart className="text-xl text-orange-500 h-6 w-6" />
              <span className="font-medium">Cart</span>
            </div>
            {cartCount > 0 && (
              <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                {cartCount}
              </span>
            )}
          </button>
        )}

        {/* USER: My Orders (Mobile Menu) */}
        {!isOwner && (
          <button 
            onClick={() => handleNavigate('/my-orders')}
            className="relative w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {/* Used the imported History icon */}
            <History className="text-xl text-gray-400 h-6 w-6" />
            <span className="font-medium">My Orders</span>
          </button>
        )}
        
        {/* OWNER Mobile Menu Links */}
        {isOwner && (
          <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
            <p className='text-sm font-semibold text-gray-500 px-3'>Owner Actions</p>

            {hasShop ? (
              // Links for Owner with a Shop
              <>
                <button onClick={() => handleNavigate('/owner/dashboard')} className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {/* Used the imported Store icon */}
                  <Store className='text-orange-500 h-5 w-5' />
                  <span className="font-medium">Shop Dashboard</span>
                </button>
                <button 
                  onClick={() => handleNavigate('/owner/add-food')} 
                  className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {/* Used the imported Plus icon */}
                  <Plus className='text-gray-400 h-5 w-5' />
                  <span className="font-medium">Add Food Item</span>
                </button>
                <button
                  onClick={() => handleNavigate('/owner/manage-orders')}
                  className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <div className='flex items-center space-x-3'>
                    {/* Used the imported Clock icon */}
                    <Clock className='text-gray-400 h-5 w-5' />
                    <span className="font-medium">Manage Orders</span>
                  </div>
                  {ordersCount > 0 && (
                    <span className="bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                      {ordersCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              // Link for Owner without a Shop
              <button
                onClick={() => handleNavigate('/owner/create-shop')}
                className="w-full flex items-center space-x-3 p-3 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold"
              >
                {/* Used the imported Store icon */}
                <Store className='text-green-600 h-5 w-5' />
                <span>Create My Shop Now!</span>
              </button>
            )}
          </div>
        )}

        {/* --- Profile, Settings, and Logout Links (Common for All Users) --- */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          {/* 1. Profile */}
          <button 
            onClick={() => handleNavigate('/profile')} // Changed path to /profile
            className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {/* Used the imported User icon */}
            <User className="text-xl text-gray-400 h-6 w-6" />
            <span className="font-medium">Profile</span>
          </button>
          
          {/* 2. Settings (New Button) */}
          <button 
            onClick={() => handleNavigate('/settings')} // New path for settings
            className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {/* Used the imported Settings icon */}
            <Settings className="text-xl text-gray-400 h-6 w-6" />
            <span className="font-medium">Settings</span>
          </button>

          {/* 3. Logout */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {/* Used the imported LogOut icon */}
            <LogOut className="text-xl text-red-500 h-6 w-6" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default MobileMenu;