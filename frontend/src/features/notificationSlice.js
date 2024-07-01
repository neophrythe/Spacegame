import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: [],
    reducers: {
        addNotification: (state, action) => {
            state.push(action.payload);
        },
        clearNotifications: (state) => {
            return [];
        },
    },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;