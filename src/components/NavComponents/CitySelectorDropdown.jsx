import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

const CitySelectorDropdown = ({
  cityRef,
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
  isOwner,
  isMobile
}) => {
  // Determine ref based on usage
  const ref = isMobile ? cityRef : cityRef;
  const containerClass = isMobile 
    ? "relative" 
    : isOwner ? "hidden" : "relative"; // Only hide for owner on desktop

  const dropdownClass = isMobile 
    ? "absolute left-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-2 transform origin-top animate-in fade-in slide-in-from-top-1"
    : "absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-2 transform origin-top-left animate-in fade-in zoom-in-95";

  // Hide on desktop if user is an owner
  if (!isMobile && isOwner) {
    return null;
  }

  return (
    <div className={containerClass} ref={ref} onClick={(e) => e.stopPropagation()}>
      <button 
        type="button" 
        onClick={toggleCitySelector} 
        className={`flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-lg ${isMobile ? 'p-1 -m-1' : 'p-1 -m-1'}`}
      >
        <FaMapMarkerAlt className="text-orange-500" />
        <span className="text-sm font-medium">
          {cityLoading ? 'Detecting location...' : (location || 'Select your location')}
        </span>
      </button>

      {isCitySelectorOpen && (
        <div className={dropdownClass}>
          <div className="px-2 pb-2">
            <div className="text-xs text-gray-500 mb-1">Select your city (India)</div>
            <input
              type="text"
              value={citySearch}
              onChange={handleCitySearchChange}
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
  );
};

export default CitySelectorDropdown;