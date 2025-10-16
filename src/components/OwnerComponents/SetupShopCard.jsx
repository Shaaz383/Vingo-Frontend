// OwnerComponent/SetupShopCard.jsx

import React from 'react';
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; 

/**
 * Renders the setup card prompting the owner to register their restaurant.
 * @component
 * @param {Object} myShopData - The shop data if it exists
 */
const SetupShopCard = ({ myShopData }) => {
  const navigate = useNavigate();
  const shopExists = myShopData && myShopData.name;

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
          {shopExists ? `Welcome to my ${myShopData.name}` : "Add Your Restaurant"}
        </h2>
        
        {/* Description Paragraph */}
        <p className="text-center text-base text-gray-600 mb-4">
          {shopExists 
            ? "Your restaurant is set up and ready to manage. You can edit your restaurant details or manage your menu."
            : "Get started by registering your food business profile. You're just a few steps away from managing your menu and staff!"}
        </p>

        {/* Little Description (More detail) */}
        <p className="text-center text-xs text-gray-400 mb-8 italic">
          {shopExists
            ? "Access your restaurant dashboard to view orders, analytics, and more."
            : "A complete profile is required to enable real-time order processing and analytics."}
        </p>

        {/* Action Button - Centered */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/create-edit-shop")}
            className="w-full py-3 px-4 text-white font-semibold bg-red-600 rounded-lg shadow-xl shadow-red-500/50 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {shopExists ? "Edit Restaurant" : "Get Started"}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default SetupShopCard;