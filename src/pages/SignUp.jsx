import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaGoogle,
} from "react-icons/fa";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../Firebase";
import { setUserData } from "../redux/userSlice";

function SignUp() {
  const dispatch = useDispatch(); // ✅ Correct placement

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Google Authentication
  const handleGoogleAuth = async () => {
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

      // ✅ Dispatch Redux action after receiving user data
      dispatch(setUserData(response.data.user));

      console.log("Google signup success:", response.data);
      alert("Welcome! Your account has been created successfully with Google.");

      navigate("/");
    } catch (error) {
      console.error("Google signup error:", error);

      if (error.code === "auth/popup-blocked") {
        setErrors({ api: "Popup was blocked. Please allow popups and try again." });
      } else if (error.code === "auth/popup-closed-by-user") {
        setErrors({ api: "Sign-up was cancelled. Please try again." });
      } else if (error.response) {
        setErrors({ api: error.response.data.message || "Google signup failed" });
      } else {
        setErrors({ api: error.message || "An unexpected error occurred" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile))
      newErrors.mobile = "Mobile number must be 10 digits";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!["owner", "user", "deliveryBoy"].includes(formData.role))
      newErrors.role = "Please select a valid role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/signup",
        {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          mobile: formData.mobile,
          role: formData.role,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      // ✅ Redux state update after success
      dispatch(setUserData(response.data.user));

      console.log("Signup success:", response.data);
      alert("Account created successfully! Please sign in.");

      setFormData({
        fullName: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        role: "user",
      });

      navigate("/signin");
    } catch (error) {
      console.error("Signup error:", error);
      if (error.response)
        setErrors({ api: error.response.data.message || "Signup failed" });
      else if (error.request)
        setErrors({ api: "Network error. Please check your connection." });
      else setErrors({ api: error.message || "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center p-2">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 md:px-0">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-3 sm:mb-4">
            <span className="text-white text-xl sm:text-2xl font-bold">V</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Join Vingo
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Create your account to get started
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`outline-none w-full pl-10 pr-4 py-3 border rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`outline-none w-full pl-10 pr-4 py-3 border rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                    errors.mobile ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`outline-none w-full pr-4 py-3 border rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                  errors.role ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="user">User</option>
                <option value="owner">Owner</option>
                <option value="deliveryBoy">Delivery Boy</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`outline-none w-full pl-10 pr-12 py-3 border rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`outline-none w-full pl-10 pr-12 py-3 border rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              } text-white`}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className={`w-full mt-2 border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FaGoogle className="h-5 w-5 text-red-500" />
              {isLoading ? "Creating account..." : "Sign up with Google"}
            </button>

            {errors.api && <p className="text-center mt-2 text-sm text-red-600">{errors.api}</p>}

            {/* Signin Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-orange-500 hover:text-orange-600 font-semibold"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-gray-500 text-sm">
            By creating an account, you agree to our{" "}
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

export default SignUp;
