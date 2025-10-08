import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice.js";
import ownerSlice from "./ownerSlice.js";

export const store = configureStore({
    reducer: {
        user: userReducer,
        owner : ownerSlice
    }
})