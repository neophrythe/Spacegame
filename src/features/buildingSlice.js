import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchBuildings = createAsyncThunk('buildings/fetchBuildings', async () => {
    const response = await axios.get('/api/buildings');
    return response.data;
});

export const upgradeBuilding = createAsyncThunk('buildings/upgradeBuilding', async (buildingType) => {
    const response = await axios.post('/api/buildings/upgrade', { buildingType });
    return response.data;
});

const buildingSlice = createSlice({
    name: 'buildings',
    initialState: {
        metalMine: 0,
        crystalMine: 0,
        deuteriumMine: 0,
        researchCenter: 0,
        shipyard: 0,
        ionCannon: 0,
        ionShield: 0,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBuildings.fulfilled, (state, action) => {
                return action.payload;
            })
            .addCase(upgradeBuilding.fulfilled, (state, action) => {
                const { buildingType, level } = action.payload;
                state[buildingType] = level;
            });
    },
});

export default buildingSlice.reducer;