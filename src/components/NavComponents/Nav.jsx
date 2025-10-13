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
// Example static values (should be replaced with actual Redux/API data.)
const CART_COUNT_STATIC = 2; 
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Logic for closing the Profile Dropdown
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      // Logic for closing the City Selector (desktop and mobile versions)
      if (
        (cityRef.current && !cityRef.current.contains(event.target)) &&
        (cityRefMobile.current && !cityRefMobile.current.contains(event.target))
      ) {
        setIsCitySelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync detected city into UI/Redux
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
  }, [dispatch, navigate]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}&city=${city || location}`);
      setSearchQuery('');
      // Close mobile menu after search
      setIsMobileMenuOpen(false);
    }
  }, [searchQuery, navigate, city, location]);
  
  // Helper for all internal navigation, closes mobile menu
  const handleNavigate = useCallback((path) => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    navigate(path);
  }, [navigate]);
    
  // Toggle functions
  const toggleProfile = () => setIsProfileOpen((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const toggleCitySelector = () => setIsCitySelectorOpen((prev) => !prev);
  
  const handleCitySelect = useCallback((selectedCity) => {
    dispatch(setCity(selectedCity));
    setLocation(selectedCity);
    setCitySearch('');
    setIsCitySelectorOpen(false);
  }, [dispatch]);

  const handleCitySearchChange = (e) => setCitySearch(e.target.value);


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
              cartCount={CART_COUNT_STATIC}
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
            cartCount={CART_COUNT_STATIC}
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
          cartCount={CART_COUNT_STATIC}
          ordersCount={ORDERS_COUNT_STATIC}
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