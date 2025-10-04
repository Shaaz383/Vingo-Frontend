import React, { useEffect } from "react";
import axios from "axios";

const useGetCurrentUser = () => {
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get("http://localhost:3000/api/user/current-user", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Current user fetched:", result.data);
      } catch (error) {
        if (error.response) {
          console.error("Server error:", error.response.data);
        } else if (error.request) {
          console.error("Network error: No response received");
        } else {
          console.error("Unexpected error:", error.message);
        }
      }
    };

    fetchUser(); 
  }, []);
};

export default useGetCurrentUser;
