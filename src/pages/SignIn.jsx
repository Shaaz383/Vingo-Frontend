import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice"; // ✅ adjust path based on your folder
import { toast } from "react-hot-toast";

import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaGoogle,
} from "react-icons/fa";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../Firebase";

function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // ✅ Validate form before submitting
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Google sign-in handler
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await axios.post(
        "http://localhost:3000/api/auth/google",
        {
          googleId: user.uid,
          email: user.email,
          fullName: user.displayName,
          profilePicture: user.photoURL,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ Dispatch user data after receiving response
      dispatch(setUserData(response.data.user));

      console.log("Google signin success:", response.data);
      toast.success("Welcome! You have been signed in successfully with Google.");

      navigate("/");
    } catch (error) {
      console.error("Google signin error:", error);

      if (error.code === "auth/popup-blocked") {
        setErrors({ api: "Popup was blocked. Please allow popups and try again." });
      } else if (error.code === "auth/popup-closed-by-user") {
        setErrors({ api: "Sign-in was cancelled. Please try again." });
      } else if (error.response) {
        setErrors({ api: error.response.data.message || "Google signin failed" });
      } else {
        setErrors({ api: error.message || "An unexpected error occurred" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Normal sign-in handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/signin",
        {
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Signin success:", response.data);
      toast.success("Welcome back! You have been signed in successfully.");

      // ✅ Dispatch user data
      dispatch(setUserData(response.data.user));

      // Reset form
      setFormData({ email: "", password: "" });

      navigate("/");
    } catch (error) {
      console.error("Signin error:", error);

      if (error.response) {
        setErrors({ api: error.response.data.message || "Signin failed" });
      } else if (error.request) {
        setErrors({ api: "Network error. Please check your connection." });
      } else {
        setErrors({ api: error.message || "An unexpected error occurred" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center p-2">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 md:px-0">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-3 sm:mb-4">
            <span className="text-white text-xl sm:text-2xl font-bold">V</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Welcome Back
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Signin Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5 md:space-y-6"
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`outline-none w-full pl-10 pr-4 py-3 border rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`outline-none w-full pl-10 pr-12 py-3 border rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Sign In button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:scale-[0.99] hover:shadow-xl"
              } text-white`}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className={`w-full mt-2 border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-50 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FaGoogle className="h-5 w-5 text-red-500" />
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </button>

            {errors.api && (
              <p className="text-center mt-2 text-sm text-red-600">
                {errors.api}
              </p>
            )}

            {/* Signup link */}
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-orange-500 hover:text-orange-600 font-semibold transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-gray-500 text-sm">
            By signing in, you agree to our{" "}
            <a href="#" className="text-orange-500 hover:text-orange-600">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-orange-500 hover:text-orange-600">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
