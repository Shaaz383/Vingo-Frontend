import React, { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData, setUserLoading } from "../redux/userSlice"; // adjust path as needed
import { toast } from "react-hot-toast";

const useGetCurrentUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      dispatch(setUserLoading(true));
      try {
        const result = await axios.get(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/user/current-user`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Current user fetched:", result.data);
        dispatch(setUserData(result.data.user)); // ✅ dispatch after getting response
      } catch (error) {
        if (error.response) {
          console.error("Server error:", error.response.data);
          toast.error("Failed to load user data");
        } else if (error.request) {
          console.error("Network error: No response received");
          toast.error("Network error. Please check your connection.");
        } else {
          console.error("Unexpected error:", error.message);
          toast.error("An unexpected error occurred");
        }
        // mark as not loading even on error so routes can render
        dispatch(setUserLoading(false));
      }
    };

    fetchUser();
  }, [dispatch]);
};

export default useGetCurrentUser;
