import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import buildingReducer from './features/buildingSlice';
import fleetReducer from './features/fleetSlice';
import researchReducer from './features/researchSlice';
import galaxyReducer from './features/galaxySlice';

export default configureStore({
    reducer: {
        user: userReducer,
        buildings: buildingReducer,
        fleet: fleetReducer,
        research: researchReducer,
        galaxies: galaxyReducer,
    },
});