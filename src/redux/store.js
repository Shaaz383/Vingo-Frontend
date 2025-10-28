import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice.js";
import ownerSlice from "./ownerSlice.js";
import cartReducer from "./cartSlice.js";

export const store = configureStore({
    reducer: {
        user: userReducer,
        owner: ownerSlice,
        cart: cartReducer
    }
})