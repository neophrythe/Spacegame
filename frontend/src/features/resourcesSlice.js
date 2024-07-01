import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchResources = createAsyncThunk(
    'resources/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/resources');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const upgradeBuilding = createAsyncThunk(
    'resources/upgradeBuilding',
    async (buildingType, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const currentLevel = state.resources[buildingType];
            const response = await api.post(`/buildings/upgrade`, {
                buildingType,
                newLevel: currentLevel + 1
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const resourcesSlice = createSlice({
    name: 'resources',
    initialState: {
        metal: 0,
        crystal: 0,
        deuterium: 0,
        energy: 0,
        metalMine: 1,
        crystalMine: 1,
        deuteriumMine: 1,
        shipyard: 1,
        researchCenter: 1,
        planetShield: 1,
        ionCannon: 1,
        loading: false,
        error: null,
    },
    reducers: {
        updateResources: (state, action) => {
            return { ...state, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchResources.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResources.fulfilled, (state, action) => {
                state.loading = false;
                return { ...state, ...action.payload };
            })
            .addCase(fetchResources.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Failed to fetch resources';
            })
            .addCase(upgradeBuilding.pending, (state) => {
                state.loading = true;
            })
            .addCase(upgradeBuilding.fulfilled, (state, action) => {
                state.loading = false;
                return { ...state, ...action.payload };
            })
            .addCase(upgradeBuilding.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Failed to upgrade building';
            });
    },
});

export const { updateResources } = resourcesSlice.actions;

export default resourcesSlice.reducer;