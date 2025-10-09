import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaSearch, 
  FaShoppingCart, 
  FaUser, 
  FaMapMarkerAlt, 
  FaBars, 
  FaTimes,
  FaSignOutAlt,
  FaUserCircle,
  FaHistory,
  FaHeart,
  FaCog,
  FaPlus,
  FaClock 
} from 'react-icons/fa';
import { setUserData, setCity } from '../redux/userSlice';
import useGetCity from '../hooks/useGetCity';

// The BLINKING_CLASS is now redundant, but kept here for context if needed later.
// const BLINKING_CLASS = 'animate-pulse';

const Nav = () => {

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Select your location');
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  
  // Example static values (should be replaced with actual Redux/API data.)
  const cartCount = 2; 
  const ordersCount = 3; // Example static value for pending orders

  const { userData, city } = useSelector((state) => state.user);
  // const {myShopData} = useSelector(state => state.owner) // Currently unused
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const cityRef = useRef(null);
  const cityRefMobile = useRef(null);

  const { detectedCity, loading: cityLoading, error: cityError, requestCity } = useGetCity();

  const INDIAN_CITIES = [
    'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad',
    'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow',
    'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Patna', 'Gaya',
    'Bhagalpur', 'Muzaffarpur', 'Purnia'
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the profile dropdown
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      // Check if the click is outside the mobile menu
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && event.target.closest('button') === null) {
        // A more complex check is needed for mobile menu to ignore the toggle button itself
        // For simplicity in this example, we rely on the component's main state update
      }
      // Check if the click is outside the desktop city selector
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setIsCitySelectorOpen(false);
      }
      // Check if the click is outside the mobile city selector
      if (cityRefMobile.current && !cityRefMobile.current.contains(event.target)) {
        setIsCitySelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync detected city into UI/Redux
  useEffect(() => {
    // If a city is already set in Redux, use it
    if (city) {
      setLocation(city);
      return;
    }
    // Otherwise, use the detected city if available and set it in Redux
    if (detectedCity) {
      setLocation(detectedCity);
      dispatch(setCity(detectedCity));
    }
  }, [detectedCity, dispatch, city]);

  const handleLogout = async () => {
    try {
      // NOTE: Replace with your actual signout endpoint and configuration
      await axios.get('http://localhost:3000/api/auth/signout', {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with client-side state cleanup even if API call fails
    } finally {
      dispatch(setUserData(null));
      navigate('/signin');
      setIsProfileOpen(false); // Close dropdown
      setIsMobileMenuOpen(false); // Close mobile menu
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Add actual search logic here, e.g., navigate('/search?q=' + searchQuery)
      console.log('Searching for:', searchQuery);
    }
  };
  
  const handleOwnerOrdersClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/owner/manage-orders'); 
  };

  const handleUserOrdersClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/my-orders'); 
  };

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleCitySelector = () => setIsCitySelectorOpen((prev) => !prev);
  
  const handleCitySelect = (selectedCity) => {
    dispatch(setCity(selectedCity));
    setLocation(selectedCity);
    setCitySearch('');
    setIsCitySelectorOpen(false);
  };

  // Determine if the user is an owner
  const isOwner = userData?.role === 'owner';

  // Helper function for navigation to close mobile menu
  const handleNavigate = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          
          {/* Logo - Left Side */}
          <div className="flex-shrink-0 flex items-center">
            <button onClick={() => navigate('/')} className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-lg p-1 -m-1">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-gray-800 hidden sm:block">Vingo</span>
            </button>
          </div>

      
          {/* Desktop Navigation - Center/Right Side */}
          <div className="hidden lg:flex items-center justify-end space-x-6 flex-1">

            {/* Location Selector — visible only if NOT owner (Desktop) */}
            {!isOwner && (
              <div className="relative" ref={cityRef} onClick={(e) => e.stopPropagation()}>
                <button 
                  type="button" 
                  onClick={toggleCitySelector} 
                  className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-lg p-1 -m-1"
                >
                  <FaMapMarkerAlt className="text-orange-500" />
                  <span className="text-sm font-medium">
                    {cityLoading ? 'Detecting location...' : (location || 'Select your location')}
                  </span>
                </button>

                {isCitySelectorOpen && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-2 transform origin-top-left animate-in fade-in zoom-in-95">
                    <div className="px-2 pb-2">
                      <div className="text-xs text-gray-500 mb-1">Select your city (India)</div>
                      <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        placeholder="Search for city..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {INDIAN_CITIES
                        .filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
                        .map((c) => (
                          <button
                            type="button"
                            key={c}
                            onClick={() => handleCitySelect(c)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                              location === c ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                    </div>
                    <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-100 mt-2">
                      <button type="button" onClick={requestCity} className="text-xs text-orange-600 hover:text-orange-700 hover:underline disabled:opacity-50" disabled={cityLoading}>
                        {cityLoading ? 'Locating...' : 'Use current location'}
                      </button>
                      {cityError && (
                        <span className="text-[10px] text-red-500 truncate max-w-[50%]">{cityError}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* Search Bar — visible only if NOT owner (Desktop) */}
            {!isOwner && (
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
            )}


            {/* Cart — visible only if NOT owner (Desktop) */}
            {!isOwner && (
              <button 
                onClick={() => navigate('/cart')} 
                className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-full"
              >
                <FaShoppingCart className="text-xl" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            )}


            {/* Add Food Item (only for owner, desktop/large screen) */}
            {isOwner && (
              <button
                onClick={() => navigate('/add-food')}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <FaPlus className="text-sm" />
                <span>Add Food Item</span>
              </button>
            )}


            {/* OWNER: Manage Orders (Desktop) - STATIC BADGE */}
            {isOwner && (
              <button 
                onClick={handleOwnerOrdersClick}
                className="relative text-gray-700 hover:text-orange-500 transition-colors font-medium text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-lg"
              >
                Manage Orders
                {ordersCount > 0 && (
                  <span className={`
                    absolute -top-2 -right-3 
                    bg-red-600 // Solid red background
                    text-white text-[10px] font-semibold
                    rounded-full h-5 min-w-5 px-1 
                    flex items-center justify-center border-2 border-white
                  `}>
                    {ordersCount}
                  </span>
                )}
              </button>
            )}

            {/* USER: My Orders (Desktop) */}
            {!isOwner && (
              <button 
                onClick={handleUserOrdersClick}
                className="relative text-gray-700 hover:text-orange-500 transition-colors font-medium text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-lg"
              >
                My Orders
              </button>
            )}


              {/* Profile Dropdown - Right Side */}
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

                  <div className="py-1">
                    {/* Profile */}
                    <button onClick={() => {handleNavigate('/profile'); setIsProfileOpen(false);}} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <FaUserCircle className="text-gray-400 w-4" />
                      <span>Profile</span>
                    </button>
                    {/* Order History (User Only, Owner uses 'Manage Orders') */}
                    {!isOwner && (
                      <button onClick={() => {handleNavigate('/order-history'); setIsProfileOpen(false);}} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <FaHistory className="text-gray-400 w-4" />
                        <span>Order History</span>
                      </button>
                    )}
                    {/* Favorites (User Only) */}
                    {!isOwner && (
                      <button onClick={() => {handleNavigate('/favorites'); setIsProfileOpen(false);}} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <FaHeart className="text-gray-400 w-4" />
                        <span>Favorites</span>
                      </button>
                    )}
                    {/* Settings */}
                    <button onClick={() => {handleNavigate('/settings'); setIsProfileOpen(false);}} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
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
          </div>



          {/* Mobile Icons and Menu Button */}
          <div className="flex items-center space-x-3 lg:hidden">
            
        {/* OWNER: Manage Orders (Mobile) - STATIC BADGE */}
            {isOwner && (
              <button
                onClick={handleOwnerOrdersClick}
                className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-full"
                title={`Manage Pending Orders (${ordersCount} New)`} 
              >
                <FaClock className="text-2xl"/>
                
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


       {/* OWNER: Add Food Item (Mobile) */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => navigate('/add-food')}
                  className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  title="Add Food Item" 
                >
                  <FaPlus className="text-lg" />
                </button>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button onClick={toggleMobileMenu} className="p-2 text-gray-700 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-lg">
              {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Search and Location */}
        <div className="lg:hidden pb-4 px-4 sm:px-6">
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
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </form>
          )}

          {/* Mobile Location - hide for owners */}
          {!isOwner && (
            <div className="relative" ref={cityRefMobile} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={toggleCitySelector}
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-lg p-1 -m-1"
              >
                <FaMapMarkerAlt className="text-orange-500" />
                <span className="text-sm font-medium">
                  {cityLoading ? 'Detecting location...' : (location || 'Select your location')}
                </span>
              </button>

              {isCitySelectorOpen && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-2 transform origin-top animate-in fade-in slide-in-from-top-1">
                  <div className="px-2 pb-2">
                    <div className="text-xs text-gray-500 mb-1">Select your city (India)</div>
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      placeholder="Search for city..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {INDIAN_CITIES
                      .filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
                      .map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => handleCitySelect(c)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${location === c ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {c}
                        </button>
                      ))}
                  </div>
                  <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-100 mt-2">
                    <button type="button" onClick={requestCity} className="text-xs text-orange-600 hover:text-orange-700 hover:underline disabled:opacity-50" disabled={cityLoading}>
                      {cityLoading ? 'Locating...' : 'Use current location'}
                    </button>
                    {cityError && <span className="text-[10px] text-red-500 truncate max-w-[50%]">{cityError}</span>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 px-4 sm:px-6 transition-all duration-300 ease-out" ref={mobileMenuRef}>
            <div className="space-y-2">
              
              {/* Cart - hide for owners */}
              {!isOwner && (
                <button 
                  onClick={() => handleNavigate('/cart')} 
                  className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <div className="flex items-center space-x-3">
                    <FaShoppingCart className="text-xl text-orange-500" />
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
                  onClick={handleUserOrdersClick}
                  className="relative w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <FaHistory className="text-xl text-gray-400" />
                  <span className="font-medium">My Orders</span>
                </button>
              )}
              
              {/* Profile Section in Mobile Menu */}
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                {/* User Info */}
                <div className="flex items-center space-x-3 p-3 mb-2">
                  {userData?.profilePicture ? (
                    <img src={userData.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <FaUser className="text-gray-600 text-base" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 truncate">{userData?.fullName || 'User'}</p>
                    <p className="text-sm text-gray-500 truncate">{userData?.email}</p>
                  </div>
                </div>

                {/* Profile Links */}
                <button onClick={() => handleNavigate('/profile')} className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <FaUserCircle className='text-gray-400' />
                  <span>Profile</span>
                </button>
                {!isOwner && (
                  <button onClick={() => handleNavigate('/favorites')} className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <FaHeart className='text-gray-400' />
                    <span>Favorites</span>
                  </button>
                )}
                <button onClick={() => handleNavigate('/settings')} className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <FaCog className='text-gray-400' />
                  <span>Settings</span>
                </button>
                
                {/* Logout Button */}
                <div className='pt-2 border-t border-gray-100'>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <FaSignOutAlt className='text-red-500' />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Nav;