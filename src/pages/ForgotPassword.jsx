import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaArrowLeft, FaLock } from "react-icons/fa";
import { toast } from "react-hot-toast";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!otpSent) return;
    if (resendCooldown === 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpSent, resendCooldown]);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/auth/send-otp`,
        { email },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setSuccessMessage("OTP has been sent to your email.");
      toast.success("OTP has been sent to your email.");
      setOtpSent(true);
      setOtp("");
      setResendCooldown(60);
      // For dev: if backend returns otp (when emails are disabled), prefill a hint in console
      if (data && data.otp) {
        // eslint-disable-next-line no-console
        console.log("[DEV ONLY] OTP:", data.otp);
      }
    } catch (error) {
      if (error.response) {
        setErrors((prev) => ({
          ...prev,
          api: error.response.data.message || "Failed to send OTP",
        }));
        toast.error(error.response.data.message || "Failed to send OTP");
      } else if (error.request) {
        setErrors((prev) => ({
          ...prev,
          api: "Network error. Please check your connection.",
        }));
        toast.error("Network error. Please check your connection.");
      } else {
        setErrors((prev) => ({
          ...prev,
          api: error.message || "An unexpected error occurred",
        }));
        toast.error(error.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!otp.trim()) newErrors.otp = "OTP is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setSuccessMessage("");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/auth/verify-otp`,
        { email, otp },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setStep(2);
      setSuccessMessage("");
      setErrors({});
    } catch (error) {
      if (error.response) {
        setErrors((prev) => ({
          ...prev,
          api: error.response.data.message || "Invalid OTP",
        }));
        toast.error(error.response.data.message || "Invalid OTP");
      } else if (error.request) {
        setErrors((prev) => ({
          ...prev,
          api: "Network error. Please check your connection.",
        }));
        toast.error("Network error. Please check your connection.");
      } else {
        setErrors((prev) => ({
          ...prev,
          api: error.message || "An unexpected error occurred",
        }));
        toast.error(error.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!newPassword) newErrors.newPassword = "New password is required";
    if (newPassword && newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm password";
    if (newPassword && confirmPassword && newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setSuccessMessage("");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/auth/reset-password`,
        { email, otp, newPassword },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setSuccessMessage("Password has been reset successfully. You can sign in now.");
      toast.success("Password has been reset successfully. You can sign in now.");
    } catch (error) {
      if (error.response) {
        setErrors((prev) => ({
          ...prev,
          api: error.response.data.message || "Failed to reset password",
        }));
        toast.error(error.response.data.message || "Failed to reset password");
      } else if (error.request) {
        setErrors((prev) => ({
          ...prev,
          api: "Network error. Please check your connection.",
        }));
        toast.error("Network error. Please check your connection.");
      } else {
        setErrors((prev) => ({
          ...prev,
          api: error.message || "An unexpected error occurred",
        }));
        toast.error(error.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center p-2">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 md:px-0">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-3 sm:mb-4">
            <span className="text-white text-xl sm:text-2xl font-bold">V</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Forgot Password
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Enter your email to receive a reset link
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          {step === 1 && (
            <form className="space-y-4 sm:space-y-5 md:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
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

              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading || !!errors.email || !email}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:scale-[0.99] hover:shadow-xl"
                  } text-white`}
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </button>
              </div>

              {otpSent && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      name="otp"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        if (errors.otp) setErrors((prev) => ({ ...prev, otp: "" }));
                      }}
                      className={`outline-none w-full px-4 py-3 border rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                        errors.otp ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter the 6-digit OTP"
                    />
                    {errors.otp && (
                      <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isLoading || !otp}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg ${
                        isLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:scale-[0.99] hover:shadow-xl"
                      } text-white`}
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading || resendCooldown > 0}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow ${
                        isLoading || resendCooldown > 0
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-white text-orange-600 border border-orange-200 hover:border-orange-400"
                      }`}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                  </div>
                </>
              )}

              {successMessage && (
                <p className="text-center text-sm text-green-600">{successMessage}</p>
              )}
              {errors.api && (
                <p className="text-center text-sm text-red-600">{errors.api}</p>
              )}

              <div className="flex items-center justify-center pt-2">
                <FaArrowLeft className="h-4 w-4 text-gray-500 mr-2" />
                <Link
                  to="/signin"
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-4 sm:space-y-5 md:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword)
                        setErrors((prev) => ({ ...prev, newPassword: "" }));
                    }}
                    className={`outline-none w-full pl-10 pr-4 py-3 border rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                      errors.newPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter new password"
                  />
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword)
                        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    className={`outline-none w-full pl-10 pr-4 py-3 border rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Re-enter new password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:scale-[0.99] hover:shadow-xl"
                } text-white`}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>

              {successMessage && (
                <p className="text-center text-sm text-green-600">{successMessage}</p>
              )}
              {errors.api && (
                <p className="text-center text-sm text-red-600">{errors.api}</p>
              )}

              <div className="flex items-center justify-center pt-2">
                <FaArrowLeft className="h-4 w-4 text-gray-500 mr-2" />
                <Link
                  to="/signin"
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;