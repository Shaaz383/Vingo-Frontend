import React from 'react';
import { 
  FaUser, 
  FaSignOutAlt,
  FaUserCircle,
  FaHistory,
  FaHeart,
  FaCog,
  FaStore 
} from 'react-icons/fa';

const ProfileDropdown = ({
  profileRef,
  isProfileOpen,
  toggleProfile,
  userData,
  isOwner,
  hasShop,
  handleLogout,
  handleNavigate,
  handleCreateShopClick,
}) => {
  
  // Handlers to close dropdown after navigation
  const navigateAndClose = (path) => {
    handleNavigate(path);
    // toggleProfile(); // Not needed as handleNavigate also closes the profile dropdown in main Nav.jsx
  };

  return (
    <div className="hidden lg:flex items-center">
      <div className="relative" ref={profileRef} onClick={(e) => e.stopPropagation()}>
        <button onClick={toggleProfile} className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors rounded-full p-1 -m-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
          {userData?.profilePicture ? (
            <img src={userData.profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <FaUser className="text-gray-600 text-sm" />
            </div>
          )}
          <span className="hidden xl:block text-sm font-medium">{userData?.fullName || 'My Account'}</span>
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 transform origin-top-right animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                {userData?.profilePicture ? (
                  <img src={userData.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <FaUser className="text-gray-600 text-base" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900 truncate">{userData?.fullName || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{userData?.email}</p>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="py-1">
              <button onClick={() => navigateAndClose('/profile')} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <FaUserCircle className="text-gray-400 w-4" />
                <span>Profile</span>
              </button>

              {/* OWNER Links */}
              {isOwner && (
                <>
                  <hr className="my-1 border-gray-100" />
                  {hasShop ? (
                    <button onClick={() => navigateAndClose('/owner/dashboard')} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors font-medium">
                      <FaStore className="w-4" />
                      <span>Shop Dashboard</span>
                    </button>
                  ) : (
                    <button onClick={() => navigateAndClose('/owner/create-shop')} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors font-medium">
                      <FaStore className="w-4" />
                      <span>Create Shop</span>
                    </button>
                  )}
                  <hr className="my-1 border-gray-100" />
                </>
              )}

              {/* User-Only Links */}
              {!isOwner && (
                <>
                  <button onClick={() => navigateAndClose('/order-history')} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <FaHistory className="text-gray-400 w-4" />
                    <span>Order History</span>
                  </button>
                  <button onClick={() => navigateAndClose('/favorites')} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <FaHeart className="text-gray-400 w-4" />
                    <span>Favorites</span>
                  </button>
                </>
              )}

              <button onClick={() => navigateAndClose('/settings')} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <FaCog className="text-gray-400 w-4" />
                <span>Settings</span>
              </button>
              
              <hr className="my-2 border-gray-100" />
              
              {/* Logout */}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <FaSignOutAlt className="text-red-500 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDropdown;