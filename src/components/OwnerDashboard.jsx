// OwnerDashboard.jsx

import React from 'react';
// import { useState } from 'react'; // Not needed anymore since you're not using it
// import { useNavigate } from "react-router-dom"; // No longer needed here, moved to SetupShopCard

// ✅ Import the new component
import SetupShopCard  from './OwnerComponents/SetupShopCard';

// --- Mocking External Hooks for Runnable Example ---
// NOTE: In your actual app, this should come from 'react-redux'.
// This mock assumes 'myShopData' is null, which triggers the display of the setup card.
const useSelector = (selector) => {
  // Keeping the mock simple for demonstration
  return selector({ owner: { myShopData: null } });   
};
// ----------------------------------------------------

const OwnerDashboard = () => {
  // Destructure myShopData from the mocked state
  const { myShopData } = useSelector(state => state.owner);
  // const navigate = useNavigate(); // Not needed here anymore

  // Determine if a shop has been set up
  const hasShop = myShopData && Object.keys(myShopData).length > 0;

  return (
    <div className="p-4 min-h-screen bg-gray-50 md:p-8">
      
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Owner Dashboard</h1>
        {/* Placeholder for other header elements */}
      </div>

      {/* 🚀 Conditional Rendering for the Setup Card (now a single component) */}
      {!hasShop && (
        <SetupShopCard />
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