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
  FaCog
} from 'react-icons/fa';
import { setUserData, setCity } from '../redux/userSlice';
import useGetCity from '../hooks/useGetCity';

const Nav = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Select your location');
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [cartCount, setCartCount] = useState(0);
  
  const { userData, city } = useSelector((state) => state.user);
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

  // 🧩 Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setIsCitySelectorOpen(false);
      }
      if (cityRefMobile.current && !cityRefMobile.current.contains(event.target)) {
        setIsCitySelectorOpen(false);
      }
    };

    // ✅ use mousedown instead of click (fix timing issue)
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🧠 Sync detected city into UI/Redux
  useEffect(() => {
    if (city) {
      setLocation(city);
      return;
    }
    if (detectedCity) {
      setLocation(detectedCity);
      dispatch(setCity(detectedCity));
    }
  }, [detectedCity, dispatch, city]);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:3000/api/auth/signout', {
        withCredentials: true
      });
      dispatch(setUserData(null));
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(setUserData(null));
      navigate('/signin');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
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

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-gray-800 hidden sm:block">Vingo</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 flex-1 max-w-4xl mx-8">
            
            {/* Location */}
            <div className="relative" ref={cityRef} onClick={(e) => e.stopPropagation()}>
              <button 
                type="button" 
                onClick={toggleCitySelector} 
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 cursor-pointer transition-colors"
              >
                <FaMapMarkerAlt className="text-orange-500" />
                <span className="text-sm font-medium">
                  {cityLoading ? 'Detecting location...' : (location || 'Select your location')}
                </span>
              </button>

              {isCitySelectorOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-2">
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
                  <div className="max-h-64 overflow-auto">
                    {Array.from(new Set([
                      ...(location && !INDIAN_CITIES.includes(location) ? [location] : []),
                      ...INDIAN_CITIES
                    ]))
                      .filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
                      .map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => handleCitySelect(c)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 ${location === c ? 'bg-orange-50 text-orange-600' : 'text-gray-700'}`}
                        >
                          {c}
                        </button>
                      ))}
                  </div>
                  <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-100 mt-2">
                    <button type="button" onClick={requestCity} className="text-xs text-orange-600 hover:underline">Use current location</button>
                    {cityError && <span className="text-[10px] text-red-500 truncate max-w-[50%]">{cityError}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for restaurants, food, or cuisines"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            {/* Cart */}
            <button className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors">
              <FaShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* My Orders */}
            <button className="text-gray-700 hover:text-orange-500 transition-colors font-medium text-sm">
              My Orders
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={toggleProfile}
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors"
              >
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <FaUser className="text-gray-600" />
                  </div>
                )}
                <span className="hidden xl:block text-sm font-medium">
                  {userData?.fullName || 'User'}
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      {userData?.profilePicture ? (
                        <img
                          src={userData.profilePicture}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <FaUser className="text-gray-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {userData?.fullName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{userData?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <FaUserCircle className="text-gray-400" />
                      <span>Profile</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <FaHistory className="text-gray-400" />
                      <span>Order History</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <FaHeart className="text-gray-400" />
                      <span>Favorites</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <FaCog className="text-gray-400" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-2" />
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt className="text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-700 hover:text-orange-500 transition-colors"
            >
              {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & City */}
        <div className="lg:hidden pb-4">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for restaurants, food, or cuisines"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </form>

          {/* Mobile Location */}
          <div className="relative" ref={cityRefMobile} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={toggleCitySelector}
              className="flex items-center space-x-2 text-gray-700 hover:text-orange-500"
            >
              <FaMapMarkerAlt className="text-orange-500" />
              <span className="text-sm font-medium">
                {cityLoading ? 'Detecting location...' : (location || 'Select your location')}
              </span>
            </button>

            {isCitySelectorOpen && (
              <div className="mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-2">
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
                <div className="max-h-64 overflow-auto">
                  {Array.from(new Set([
                    ...(location && !INDIAN_CITIES.includes(location) ? [location] : []),
                    ...INDIAN_CITIES
                  ]))
                    .filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
                    .map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => handleCitySelect(c)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 ${location === c ? 'bg-orange-50 text-orange-600' : 'text-gray-700'}`}
                      >
                        {c}
                      </button>
                    ))}
                </div>
                <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-100 mt-2">
                  <button type="button" onClick={requestCity} className="text-xs text-orange-600 hover:underline">Use current location</button>
                  {cityError && <span className="text-[10px] text-red-500 truncate max-w-[50%]">{cityError}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4" ref={mobileMenuRef}>
            <div className="space-y-4">
              
              {/* Mobile Cart */}
              <button className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <FaShoppingCart className="text-xl" />
                  <span className="font-medium">Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile My Orders */}
              <button className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <FaHistory className="text-xl" />
                <span className="font-medium">My Orders</span>
              </button>

              {/* Mobile Profile */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-3 p-3">
                  {userData?.profilePicture ? (
                    <img
                      src={userData.profilePicture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <FaUser className="text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{userData?.fullName || 'User'}</p>
                    <p className="text-sm text-gray-500">{userData?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <FaUserCircle />
                    <span>Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <FaHeart />
                    <span>Favorites</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <FaCog />
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaSignOutAlt />
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
