import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaEnvelope, FaPhone, FaSignOutAlt, FaShieldAlt, FaKey, FaImage, FaCheckCircle } from "react-icons/fa";
import { setUserData } from "../redux/userSlice";
 

const Profile = () => {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [otpEmail, setOtpEmail] = useState(userData?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [editName, setEditName] = useState(userData?.fullName || "");
  const [editMobile, setEditMobile] = useState(userData?.mobile || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [mobileOtp, setMobileOtp] = useState("");
  const [isSendingMobileOtp, setIsSendingMobileOtp] = useState(false);
  const [isVerifyingMobileOtp, setIsVerifyingMobileOtp] = useState(false);

  const isOwner = userData?.role === "owner";
  const isDelivery = userData?.role === "deliveryBoy";

  const avatar = useMemo(() => {
    if (userData?.profilePicture) return userData.profilePicture;
    const initials = (userData?.fullName || "").trim().slice(0, 1).toUpperCase() || "U";
    const bg = "ef4444"; 
    const fg = "ffffff";
    return `https://via.placeholder.com/120/${bg}/${fg}?text=${initials}`;
  }, [userData]);

  const handleLogout = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_BASE || "http://localhost:3000"}/api/auth/signout`, { withCredentials: true });
      toast.success("Signed out");
    } catch (err) {
      toast.error("Failed to sign out");
    } finally {
      dispatch(setUserData(null));
      navigate("/signin");
    }
  };

  const sendOtp = async () => {
    try {
      setIsSendingOtp(true);
      await axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:3000"}/api/user/send-email-otp`, {}, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      toast.success("OTP sent to your email");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setIsVerifyingOtp(true);
      await axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:3000"}/api/user/verify-email-otp`, { otp }, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      const refreshed = await axios.get(`${import.meta.env.VITE_API_BASE || "http://localhost:3000"}/api/user/current-user`, { withCredentials: true });
      dispatch(setUserData(refreshed.data.user));
      toast.success("Email verified");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const saveProfile = async () => {
    try {
      setIsSavingProfile(true);
      const res = await axios.patch(`${import.meta.env.VITE_API_BASE || "http://localhost:3000"}/api/user/me`, { fullName: editName, mobile: editMobile }, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      dispatch(setUserData(res.data.user));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return;
    try {
      setImageUploading(true);
      const form = new FormData();
      form.append("image", file);
      const res = await axios.patch(`${import.meta.env.VITE_API_BASE || "http://localhost:3000"}/api/user/profile-picture`, form, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } });
      dispatch(setUserData(res.data.user));
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const sendMobileOtp = async () => {
    try {
      setIsSendingMobileOtp(true);
      await axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:3000"}/api/user/send-mobile-otp`, { mobile: editMobile }, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      toast.success("OTP sent");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingMobileOtp(false);
    }
  };

  const verifyMobile = async () => {
    try {
      setIsVerifyingMobileOtp(true);
      await axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:3000"}/api/user/verify-mobile-otp`, { otp: mobileOtp }, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      toast.success("Mobile verified");
      const refreshed = await axios.get(`${import.meta.env.VITE_API_BASE || "http://localhost:3000"}/api/user/current-user`, { withCredentials: true });
      dispatch(setUserData(refreshed.data.user));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setIsVerifyingMobileOtp(false);
    }
  };

  

  const resetPassword = async () => {
    try {
      setIsResetting(true);
      await axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:3000"}/api/auth/reset-password`, { email: otpEmail, newPassword }, { withCredentials: true, headers: { "Content-Type": "application/json" } });
      toast.success("Password updated");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl bg-white shadow-xl">
          <div className="px-6 sm:px-8 py-6 flex items-center">
            <div className="relative lg:h-24 lg:w-24 h-16 w-16 rounded-full object-cover overflow-hidden ring-2 ring-white bg-gray-100">
              <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
              <label className="absolute bottom-2 right-2 bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full cursor-pointer shadow z-9">
                <FaImage />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0])} />
              </label>
            </div>
            <div className="ml-4 sm:ml-6">
              <div className="text-2xl font-extrabold text-gray-900">{userData?.fullName || "User"}</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">{isOwner ? "Owner" : isDelivery ? "Delivery" : "User"}</span>
                {userData?.isGoogleUser && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Google</span>
                )}
                {userData?.isEmailVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><FaCheckCircle /> Email verified</span>
                )}
                {userData?.isMobileVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><FaCheckCircle /> Mobile verified</span>
                )}

          
              </div>

            </div>
           
          </div>

          <div className="px-6 sm:px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="rounded-xl border border-gray-100 p-5 bg-white shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Full Name</div>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Mobile</div>
                    <input value={editMobile} onChange={(e) => setEditMobile(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button disabled={isSavingProfile} onClick={saveProfile} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition disabled:opacity-60">Save</button>
                </div>
              </div>

              
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-gray-100 p-5 bg-white shadow-sm">
                <div className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
                  <FaShieldAlt className="text-orange-600" />
                  Security
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <input value={otpEmail} readOnly type="email" placeholder="Email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                    <button disabled={isSendingOtp} onClick={sendOtp} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition disabled:opacity-60">
                      <FaKey />
                      Send OTP
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <input value={otp} onChange={(e) => setOtp(e.target.value)} type="text" placeholder="Enter OTP" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                    <button disabled={isVerifyingOtp || !otp} onClick={verifyOtp} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-60">
                      Verify OTP
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="New Password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                    <button disabled={isResetting || !newPassword} onClick={resetPassword} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 p-5 bg-white shadow-sm">
                <div className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
                  <FaPhone className="text-orange-600" />
                  Mobile Verification
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <input value={editMobile} onChange={(e) => setEditMobile(e.target.value)} type="tel" placeholder="Mobile" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                    <button disabled={isSendingMobileOtp || !editMobile} onClick={sendMobileOtp} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition disabled:opacity-60">Send OTP</button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <input value={mobileOtp} onChange={(e) => setMobileOtp(e.target.value)} type="text" placeholder="Enter OTP" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                    <button disabled={isVerifyingMobileOtp || !mobileOtp} onClick={verifyMobile} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-60">Verify</button>
                  </div>
                       <div className="ml-auto mt-4">
              <button onClick={handleLogout} className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition"><FaSignOutAlt /> Logout</button>
            </div>
                </div>

              </div>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;