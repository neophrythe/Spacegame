import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import galaxyReducer from './features/galaxySlice';
import resourcesReducer from './features/resourcesSlice';
import notificationReducer from './features/notificationSlice';
import battleReportsReducer from './features/battleReportSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        galaxy: galaxyReducer,
        resources: resourcesReducer,
        notifications: notificationReducer,
        battleReports: battleReportsReducer,
    },
});

export default store;
