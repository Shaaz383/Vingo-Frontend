// OwnerComponent/SetupShopCard.jsx

import React from 'react';
import { FaUtensils, FaMapMarkerAlt, FaRegClock, FaPencilAlt, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/**
 * Renders the setup card prompting the owner to register their restaurant.
 * @component
 * @param {Object} myShopData - The shop data if it exists (expected to have name, address, logoUrl, maybe operationHours)
 */
const SetupShopCard = ({ myShopData }) => {
  const navigate = useNavigate();
  const shopExists = myShopData && myShopData.name;

  // --- Professional Welcome Card for Existing Shop ---
  if (shopExists) {
    const defaultLogoUrl = "https://via.placeholder.com/80/ef4444/ffffff?text=LOGO"; // Placeholder for logo
    const shopLogo = myShopData.image || defaultLogoUrl;
    
    // Fallback for address if your data is simple
    const shopAddress = myShopData.address || "123 Dashboard Avenue, Metropolis"; 
    
    // Example operational status (you might replace this with real logic)
    const operationalStatus = "Active - Receiving Orders"; 

    return (
      // Flex container to center the card vertically and horizontally
      <div className="flex justify-center items-start pt-10 h-full md:items-center">
        
        {/* Professional Welcome Card Container - Wider and more prominent */}
        <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-3xl transform hover:scale-[1.01] overflow-hidden">
          
          {/* Card Header/Banner Area */}
          <div className="relative h-28 bg-red-600/10 flex items-center p-6 md:h-36">
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 z-10">
              Welcome Back, <span className="text-red-600">{myShopData.name}</span>
            </h2>
            {/* Background pattern/image for effect */}
            <div className="absolute top-0 right-0 h-full w-40 bg-red-600/5 opacity-50 skew-x-[-20deg] origin-top-right"></div>
          </div>

          {/* Card Body - Content & Details */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center -mt-10">
            
            {/* Logo/Image Section */}
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <img 
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-lg"
                src={shopLogo}
                alt={`${myShopData.name} Logo`}
                onError={(e) => e.target.src = defaultLogoUrl} // Fallback in case of broken link
              />
            </div>

            {/* Restaurant Info & Status */}
            <div className="flex-grow">
              <div className="text-lg font-semibold text-gray-800 flex items-center mb-1">
                <FaCheckCircle className="w-4 h-4 text-green-500 mr-2"/>
                <span className="text-green-600">{operationalStatus}</span>
              </div>

              {/* Address */}
              <p className="text-sm text-gray-500 flex items-start mb-3">
                <FaMapMarkerAlt className="w-4 h-4 text-red-400 mr-2 mt-1 flex-shrink-0"/>
                {shopAddress}
              </p>

              {/* Action Button - Placed next to info for better flow on desktop */}
              <button
                onClick={() => navigate("/create-edit-shop")}
                className="flex items-center justify-center py-2 px-4 text-sm text-red-600 font-semibold border border-red-600 rounded-lg hover:bg-red-50 transition duration-150 ease-in-out"
              >
                <FaPencilAlt className="w-4 h-4 mr-2" />
                Edit Restaurant Profile
              </button>
            </div>
            
          </div>
          
          {/* Footer - Quick Actions & Description */}
          <div className="bg-gray-50 border-t border-gray-100 p-6 md:p-8 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Your dashboard is ready. Time to check today's orders!
            </p>
            {/* You can add a quick link to the menu or orders page here */}
            {/* Example: <a href="/menu" className="text-red-600 font-medium hover:text-red-700">Manage Menu &rarr;</a> */}
          </div>

        </div>
      </div>
    );
  }

  // --- Original "Setup Shop" Card (If no shop exists) ---
  return (
    // Flex container to center the card vertically and horizontally
    <div className="flex justify-center items-start pt-10 h-full md:items-center">
      
      {/* Main Card Container */}
      <div className="w-full max-w-sm p-8 bg-white border border-gray-200 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-3xl transform hover:-translate-y-1">
        
        {/* Icon - Centered */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-600 rounded-full shadow-lg shadow-red-300/50">
            <FaUtensils className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title - Centered */}
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-3">
          {"Add Your Restaurant"}
        </h2>
        
        {/* Description Paragraph */}
        <p className="text-center text-base text-gray-600 mb-4">
          {"Get started by registering your food business profile. You're just a few steps away from managing your menu and staff!"}
        </p>

        {/* Little Description (More detail) */}
        <p className="text-center text-xs text-gray-400 mb-8 italic">
          {"A complete profile is required to enable real-time order processing and analytics."}
        </p>

        {/* Action Button - Centered */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/create-edit-shop")}
            className="w-full py-3 px-4 text-white font-semibold bg-red-600 rounded-lg shadow-xl shadow-red-500/50 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {"Get Started"}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default SetupShopCard;