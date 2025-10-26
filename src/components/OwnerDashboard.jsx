// OwnerDashboard.jsx
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SetupShopCard from "./OwnerComponents/SetupShopCard";
import AddFoodCard from "./OwnerComponents/AddFoodCard"; // ✅ new import

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();
  const hasShop = myShopData && Object.keys(myShopData).length > 0;

  return (
    <div className="p-4 min-h-screen bg-gray-50 md:p-8">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Owner Dashboard</h1>
      </div>

      {/* Setup Shop Card */}
      <SetupShopCard myShopData={myShopData} />

      {/* If shop exists, show Add Food Card */}
      {hasShop && (
        <div className="mt-8 flex justify-center">
          <AddFoodCard /> {/* ✅ Clean reusable component */}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
