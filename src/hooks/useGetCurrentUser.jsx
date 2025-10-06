import React, { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData, setUserLoading } from "../redux/userSlice"; // adjust path as needed

const useGetCurrentUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      dispatch(setUserLoading(true));
      try {
        const result = await axios.get("http://localhost:3000/api/user/current-user", {
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
        } else if (error.request) {
          console.error("Network error: No response received");
        } else {
          console.error("Unexpected error:", error.message);
        }
        // mark as not loading even on error so routes can render
        dispatch(setUserLoading(false));
      }
    };

    fetchUser();
  }, [dispatch]);
};

export default useGetCurrentUser;
