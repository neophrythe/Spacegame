import { combineReducers } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';
import buildingReducer from '../features/buildingSlice';
import fleetReducer from '../features/fleetSlice';
import researchReducer from '../features/researchSlice';
import galaxyReducer from '../features/galaxySlice';
import resourceReducer from '../features/resourceSlice';
import clanReducer from '../features/clanSlice';

const rootReducer = combineReducers({
    user: userReducer,
    buildings: buildingReducer,
    fleet: fleetReducer,
    research: researchReducer,
    galaxies: galaxyReducer,
    resources: resourceReducer,
    clan: clanReducer,
});

export default rootReducer;