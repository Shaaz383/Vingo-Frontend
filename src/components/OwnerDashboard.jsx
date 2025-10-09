import React, { useState } from 'react';
import { FaUtensils } from "react-icons/fa";

// --- Mocking External Hooks for Runnable Example ---
// NOTE: In your actual app, these should come from 'react-redux' and 'react-router-dom'.
// This mock assumes 'myShopData' is null, which triggers the display of the setup card.
const useSelector = (selector) => {
  return selector({ owner: { myShopData: null } }); 
};

const useNavigate = () => {
  return (path) => {
    console.log(`Navigation triggered to: ${path}`);
    // In a real app, this would perform the route change.
  };
};
// ----------------------------------------------------

const OwnerDashboard = () => {
  // Destructure myShopData from the mocked state
  const { myShopData } = useSelector(state => state.owner);
  const navigate = useNavigate();

  // Determine if a shop has been set up
  const hasShop = myShopData && Object.keys(myShopData).length > 0;

  const handleGetStarted = () => {
    // Navigate to the restaurant setup page
    navigate('/owner/add-restaurant'); 
  };

  return (
    <div className="p-4 min-h-screen  bg-gray-50 md:p-8">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Owner Dashboard</h1>
        {/* Placeholder for other header elements */}
      </div>

      {/* Conditional Rendering for the Setup Card */}
      {!hasShop && (
        // Flex container to center the card vertically and horizontally, 
        // with margin on top for aesthetics (pt-10)
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
              Add Your Restaurant
            </h2>
            
            {/* Description Paragraph */}
            <p className="text-center text-base text-gray-600 mb-4">
              Get started by registering your food business profile. You're just a few steps away from managing your menu and staff!
            </p>

            {/* Little Description (More detail) */}
            <p className="text-center text-xs text-gray-400 mb-8 italic">
              A complete profile is required to enable real-time order processing and analytics.
            </p>

            {/* Action Button - Centered */}
            <div className="flex justify-center">
              <button
                onClick={handleGetStarted}
                className="w-full py-3 px-4 text-white font-semibold bg-red-600 rounded-lg shadow-xl shadow-red-500/50 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Placeholder for when the shop IS present */}
      {hasShop && (
        <div className="text-center p-10 bg-white rounded-xl shadow-lg">
          <p className="text-lg font-medium text-gray-700">Your restaurant profile is active and ready to go!</p>
          {/* Regular dashboard content goes here */}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
