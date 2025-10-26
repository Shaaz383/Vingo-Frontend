// OwnerDashboard.jsx
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SetupShopCard from "./OwnerComponents/SetupShopCard";
import AddFoodItemCard from "./OwnerComponents/AddFoodItemCard";
import OwnerItemCard from "./OwnerComponents/OwnerItemCard";
import useGetShopItems from "../hooks/useGetShopItems";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();
  const hasShop = myShopData && Object.keys(myShopData).length > 0;
  
  // Fetch shop items to determine if we should show AddFoodItemCard
  const { items, itemCount, loading, error, refetch } = useGetShopItems();

  return (
    <div className="p-4 min-h-screen bg-gray-50 md:p-8">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Owner Dashboard</h1>
      </div>

      {/* Setup Shop Card */}
      <SetupShopCard myShopData={myShopData} />

      {/* Show AddFoodItemCard only if shop exists and has no items */}
      {hasShop && !loading && itemCount === 0 && (
        <div className="mt-8 flex justify-center">
          <AddFoodItemCard />
        </div>
      )}

      {/* Show existing items if any */}
      {hasShop && !loading && itemCount > 0 && (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Your Food Items ({itemCount})
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <OwnerItemCard key={item._id || item.name} item={item} refetch={refetch} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {hasShop && loading && (
        <div className="mt-8 flex justify-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">Loading your food items...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasShop && error && (
        <div className="mt-8 flex justify-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-red-600">Error loading food items: {error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
