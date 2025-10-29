import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
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

function App() {
  useGetCurrentUser();
  useGetCity();
  useGetMyShop()
  const { userData, isLoadingUser } = useSelector((state) => state.user);

  if (isLoadingUser) {
    return null;
  }

  return (
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
    </Routes>
  );
}

export default App;
