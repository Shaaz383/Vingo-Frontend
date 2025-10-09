import { createSlice } from "@reduxjs/toolkit";

const ownerSlice = createSlice({
    name: "owner",
    initialState: {
        myShopData: null,
        ordersCount: 0,
        
        
    },
    reducers: {
        setMyShopData: (state, action) => {
            state.myShopData = action.payload;
        
        },
        setOrdersCount: (state, action) => {
            state.ordersCount = action.payload;
        },
      
    },
})
export const { setMyShopData, setOrdersCount } = ownerSlice.actions;
export default ownerSlice.reducer; 