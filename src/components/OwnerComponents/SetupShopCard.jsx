// OwnerComponents/SetupShopCard.jsx

import React from 'react';
import { FaUtensils, FaMapMarkerAlt, FaPencilAlt, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SetupShopCard = ({ myShopData }) => {
  const navigate = useNavigate();
  const shopExists = myShopData && myShopData.name;

  // ✅ If shop exists - show professional summary card
  if (shopExists) {
    const defaultLogoUrl = "https://via.placeholder.com/100/ef4444/ffffff?text=LOGO";
    const shopLogo = myShopData.image || defaultLogoUrl;
    const shopAddress = myShopData.address || "123 Dashboard Avenue, Metropolis";
    const operationalStatus = "Active — Receiving Orders";

    return (
      <div className="flex justify-center mt-10">
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-transform duration-300 hover:scale-[1.01]">
          
          {/* Banner Header */}
          <div className="h-32 bg-gradient-to-r from-red-600 to-rose-500 relative">
            <div className="absolute bottom-0 left-6 transform translate-y-1/2">
              <img
                src={shopLogo}
                alt={`${myShopData.name} Logo`}
                onError={(e) => (e.target.src = defaultLogoUrl)}
                className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
              />
            </div>
            <h2 className="absolute bottom-6 left-36 text-white font-extrabold text-2xl md:text-3xl drop-shadow-md">
              {myShopData.name}
            </h2>
          </div>

          {/* Content Section */}
          <div className="p-8 mt-6 md:flex md:items-center md:justify-between">
            
            {/* Info Section */}
            <div>
              {/* Status */}
              <div className="flex items-center text-green-600 font-semibold mb-3">
                <FaCheckCircle className="w-5 h-5 mr-2" />
                <span>{operationalStatus}</span>
              </div>

              {/* Address */}
              <div className="flex items-start text-gray-600 text-sm mb-5">
                <FaMapMarkerAlt className="w-4 h-4 mt-1 mr-2 text-red-400" />
                <span>{shopAddress}</span>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => navigate("/create-edit-shop")}
                className="flex items-center bg-gradient-to-r from-red-600 to-rose-500 text-white px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <FaPencilAlt className="w-4 h-4 mr-2" />
                Edit Shop Details
              </button>
            </div>

            {/* Right Section - Preview Info */}
            <div className="mt-6 md:mt-0 bg-gray-50 border border-gray-100 p-5 rounded-xl text-center shadow-sm">
              <h3 className="text-sm text-gray-500 font-medium mb-2">Shop ID</h3>
              <p className="text-lg font-semibold text-gray-800 mb-3">#{myShopData._id || "SHP-00123"}</p>
              {/* <p className="text-xs text-gray-500 italic">All systems running smoothly 🚀</p> */}
            </div>

          </div>

          {/* Footer Bar */}
          <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 flex justify-between items-center text-sm text-gray-500">
            <span>Keep your shop info updated for better visibility.</span>
            <button
              onClick={() => navigate("/shop/orders")}
              className="text-red-600 font-semibold hover:text-red-700 transition-colors"
            >
              View Orders →
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ❌ If no shop exists - show setup prompt card
  return (
    <div className="flex justify-center mt-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 text-center transition-transform hover:scale-[1.01] hover:shadow-3xl">
        
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-r from-red-600 to-rose-500 rounded-full shadow-lg">
            <FaUtensils className="text-white w-10 h-10" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Add Your Restaurant</h2>

        {/* Description */}
        <p className="text-gray-600 text-base mb-4">
          Start by setting up your restaurant profile and showcase your dishes to customers!
        </p>

        <p className="text-sm text-gray-400 italic mb-8">
          A verified profile helps customers find and trust your restaurant easily.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/create-edit-shop")}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform duration-200"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default SetupShopCard;
