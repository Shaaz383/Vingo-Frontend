import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";

function App() {
  useGetCurrentUser();
  const { userData } = useSelector((state) => state.user);

  return (
    <Routes>
      <Route path="/signup" element={!userData ? <SignUp /> : <Home />} />
      <Route path="/signin" element={!userData ? <SignIn /> : <Home />} />
      <Route path="/forgot-password" element={!userData ? <ForgotPassword /> : <Home />} />
      <Route path="/" element={userData ? <Home /> : <Navigate to="/signin" />} />
    </Routes>
  );
}

export default App;
