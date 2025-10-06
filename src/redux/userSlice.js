import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        city: null,
        isLoadingUser: true,
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
            state.isLoadingUser = false;
        },
        setCity: (state, action) => {
            state.city = action.payload;
        },
        setUserLoading: (state, action) => {
            state.isLoadingUser = action.payload;
        },
    },
})
export const { setUserData, setCity, setUserLoading } = userSlice.actions;
export default userSlice.reducer; 