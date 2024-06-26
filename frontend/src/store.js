import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
// Import other reducers as needed

export const store = configureStore({
    reducer: {
        user: userReducer,
        // Add other reducers here
    },
});

export default store;