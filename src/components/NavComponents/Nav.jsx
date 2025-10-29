import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@/context/ToastContext.jsx';
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
  FaClock,
  FaStore 
} from 'react-icons/fa';
import { setUserData, setCity } from '../../redux/userSlice';
import { selectCartItemCount } from '../../redux/cartSlice';
import useGetCity from '../../hooks/useGetCity';

// Import all new components
import Logo from './Logo';
import CitySelectorDropdown from './CitySelectorDropdown';
import DesktopActions from './DesktopActions';
import ProfileDropdown from './ProfileDropdown';
import MobileMenu from './MobileMenu';
import MobileIcons from './MobileIcons';


// --- Constants (Keep here for easy management) ---

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow',
  'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Patna', 'Gaya',
  'Bhagalpur', 'Muzaffarpur', 'Purnia'
];
// Example static value (should be replaced with actual Redux/API data.)
const ORDERS_COUNT_STATIC = 3; 
// --- Main Nav Component ---

const Nav = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Select your location');
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  
  const { userData, city } = useSelector((state) => state.user);
  // Assuming the structure is state.owner.myShopData
  const { myShopData } = useSelector(state => state.owner);
  const cartItemCount = useSelector(selectCartItemCount); 
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  // Refs for click-outside logic
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const cityRef = useRef(null);
  const cityRefMobile = useRef(null);

  const { detectedCity, loading: cityLoading, error: cityError, requestCity } = useGetCity();
  
  // Computed values
  const isOwner = userData?.role === 'owner';
  const hasShop = isOwner && myShopData !== null && myShopData !== undefined;

  // --- Handlers & Effects ---

  // Optimize handleClickOutside with useCallback
  const handleClickOutside = useCallback((event) => {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setIsProfileOpen(false);
    }
    if (
      (cityRef.current && !cityRef.current.contains(event.target)) &&
      (cityRefMobile.current && !cityRefMobile.current.contains(event.target))
    ) {
      setIsCitySelectorOpen(false);
    }
  }, []);

  // Update useEffect to use the memoized handleClickOutside
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Optimize toggle functions with useCallback
  const toggleProfile = useCallback(() => {
    setIsProfileOpen(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const toggleCitySelector = useCallback(() => {
    setIsCitySelectorOpen(prev => !prev);
  }, []);

  // Optimize handleCitySearchChange with useCallback
  const handleCitySearchChange = useCallback((e) => {
    setCitySearch(e.target.value);
  }, []);

  // Add toast to handleLogout dependencies
  const handleLogout = useCallback(async () => {
    try {
      await axios.get('http://localhost:3000/api/auth/signout', {
        withCredentials: true
      });
      toast.show('Signed out', 'success');
    } catch (error) {
      toast.show('Failed to sign out. Please try again.', 'error');
    } finally {
      dispatch(setUserData(null));
      navigate('/signin');
      setIsProfileOpen(false); 
      setIsMobileMenuOpen(false); 
    }
  }, [dispatch, navigate, toast]);

  // Add setSearchQuery and setIsMobileMenuOpen to handleSearch dependencies
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}&city=${city || location}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  }, [searchQuery, navigate, city, location, setSearchQuery, setIsMobileMenuOpen]);
  
  // Helper for all internal navigation, closes mobile menu
  const handleNavigate = useCallback((path) => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    navigate(path);
  }, [navigate]);
    
  // Toggle functions
  // Remove these duplicate declarations since they're already defined with useCallback above
  // Delete these lines:
  // const toggleProfile = () => setIsProfileOpen((prev) => !prev);
  // const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  // const toggleCitySelector = () => setIsCitySelectorOpen((prev) => !prev);
  // const handleCitySearchChange = (e) => setCitySearch(e.target.value);

  const handleCitySelect = useCallback((selectedCity) => {
    dispatch(setCity(selectedCity));
    setLocation(selectedCity);
    setCitySearch('');
    setIsCitySelectorOpen(false);
  }, [dispatch]);


  // --- Render ---
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Logo navigate={navigate} />

          {/* Desktop Navigation - Center/Right Side */}
          <div className="hidden lg:flex items-center justify-end space-x-6 flex-1">
            
            {/* Desktop Location Selector */}
            <CitySelectorDropdown
              cityRef={cityRef}
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
              isOwner={isOwner} // Conditional visibility for desktop
              isMobile={false} // Indicates desktop version
            />

            {/* Desktop Actions (Search, Cart, Owner Buttons) */}
            <DesktopActions
              isOwner={isOwner}
              hasShop={hasShop}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              handleNavigate={handleNavigate}
              cartCount={cartItemCount}
              ordersCount={ORDERS_COUNT_STATIC}
            />
            
            {/* Profile Dropdown */}
            <ProfileDropdown
              profileRef={profileRef}
              isProfileOpen={isProfileOpen}
              toggleProfile={toggleProfile}
              userData={userData}
              isOwner={isOwner}
              hasShop={hasShop}
              handleLogout={handleLogout}
              handleNavigate={handleNavigate}
              handleCreateShopClick={() => handleNavigate('/owner/create-shop')}
            />
          </div>

          {/* Mobile Icons and Menu Button */}
          <MobileIcons
            isOwner={isOwner}
            hasShop={hasShop}
            ordersCount={ORDERS_COUNT_STATIC}
            cartCount={cartItemCount}
            isMobileMenuOpen={isMobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
            handleNavigate={handleNavigate}
          />
        </div>

        {/* Mobile Menu Content (Search, Location, Links) */}
        <MobileMenu
          isMobileMenuOpen={isMobileMenuOpen}
          mobileMenuRef={mobileMenuRef}
          isOwner={isOwner}
          hasShop={hasShop}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          handleNavigate={handleNavigate}
          cartCount={cartItemCount}
          ordersCount={ORDERS_COUNT_STATIC}
          handleLogout={handleLogout}  // Add this line
          // Props for Mobile City Selector
          cityRefMobile={cityRefMobile}
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
        />
      </div>
    </nav>
  );
};

export default Nav;