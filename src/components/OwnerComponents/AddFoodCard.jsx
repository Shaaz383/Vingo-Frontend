// OwnerComponents/AddFoodCard.jsx
import React from "react";
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AddFoodCard = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-200">
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-red-600 rounded-full shadow-md shadow-red-400/50">
          <FaUtensils className="text-white w-8 h-8" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Add Food Item</h2>

      {/* Description */}
      <p className="text-gray-600 mb-6">
        Add new dishes, update your menu, and manage your restaurant offerings easily.
      </p>

      {/* Button */}
      <button
        onClick={() => navigate("/add-food-item")}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition cursor-pointer"
      >
        Add Food Item
      </button>
    </div>
  );
};

export default AddFoodCard;
