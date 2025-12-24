import "./App.css";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import CreateEditShop from "./pages/CreateEditShop";
import AddFoodItem from "./components/OwnerComponents/AddFoodItem";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";
import ShopOrders from "./pages/ShopOrders";
import DeliveryBoy from "./components/DeliveryBoy";
import { FaArrowLeft } from "react-icons/fa";

function App() {
  useGetCurrentUser();
  useGetCity();
  useGetMyShop()
  const { userData, isLoadingUser } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const showBack = location.pathname !== "/";
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  if (isLoadingUser) {
    return null;
  }

  return (
    <div>
      {showBack && (
        <div className="sticky top-0 z-50 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center">
            <button onClick={handleBack} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800">
              <FaArrowLeft />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/signup" element={!userData ? <SignUp /> : <Home />} />
        <Route path="/signin" element={!userData ? <SignIn /> : <Home />} />
        <Route path="/forgot-password" element={!userData ? <ForgotPassword /> : <Home />} />
        <Route path="/" element={userData ? <Home /> : <Navigate to="/signin" />} />
        <Route path="/create-edit-shop" element={userData ? <CreateEditShop /> : <Navigate to="/signin" />} />
        <Route path="/add-food-item" element={userData ? <AddFoodItem /> : <Navigate to="/signin" />} />
        <Route path="/cart" element={userData ? <Cart /> : <Navigate to="/signin" />} />
        <Route path="/checkout" element={userData ? <Checkout /> : <Navigate to="/signin" />} />
        <Route path="/order-placed" element={userData ? <OrderPlaced /> : <Navigate to="/signin" />} />
        <Route path="/my-orders" element={userData ? <MyOrders /> : <Navigate to="/signin" />} />
        <Route path="/orders/:id" element={userData ? <OrderDetail /> : <Navigate to="/signin" />} />
        <Route path="/shop/orders" element={userData ? <ShopOrders /> : <Navigate to="/signin" />} />
        <Route path="/delivery" element={userData && userData.role === 'deliveryBoy' ? <DeliveryBoy /> : <Navigate to="/signin" />} />
        <Route path="/profile" element={userData ? <Profile /> : <Navigate to="/signin" />} />
      </Routes>
    </div>
  );
}

export default App;
