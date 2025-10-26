import React from 'react';
import { FaUtensils, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AddFoodItemCard = () => {
  const navigate = useNavigate();

  const handleAddItem = () => {
    navigate('/add-food-item');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="p-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/30">
          <FaUtensils className="text-white w-12 h-12" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Add Your First Food Item
      </h2>

      {/* Description */}
      <p className="text-gray-600 mb-8 leading-relaxed">
        Start building your menu! Add delicious food items to attract customers and grow your business.
      </p>

      {/* Add Button */}
      <button
        onClick={handleAddItem}
        className="inline-flex items-center space-x-3 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-red-500/30 transition-all duration-200 transform hover:scale-105"
      >
        <FaPlus className="w-5 h-5" />
        <span>Add Food Item</span>
      </button>

      {/* Decorative Elements */}
      <div className="mt-8 flex justify-center space-x-2">
        <div className="w-2 h-2 bg-red-200 rounded-full"></div>
        <div className="w-2 h-2 bg-red-300 rounded-full"></div>
        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
      </div>
    </div>
  );
};

export default AddFoodItemCard;