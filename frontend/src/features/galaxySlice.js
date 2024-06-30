import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';
import { handleError } from '../utils/errorHandler';

export const fetchPlayerLocation = createAsyncThunk('galaxies/fetchPlayerLocation', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/player/location');
        return response.data;
    } catch (error) {
        handleError(error);
        return rejectWithValue(error.response.data);
    }
});

export const colonizePlanet = createAsyncThunk('galaxies/colonizePlanet', async (planetId, { rejectWithValue }) => {
    try {
        const response = await api.post(`/planets/${planetId}/colonize`);
        return response.data;
    } catch (error) {
        handleError(error);
        return rejectWithValue(error.response.data);
    }
});

const galaxySlice = createSlice({
    name: 'galaxies',
    initialState: {
        playerLocation: null,
        nearbySystems: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearGalaxyError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPlayerLocation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPlayerLocation.fulfilled, (state, action) => {
                state.loading = false;
                state.playerLocation = action.payload.playerLocation;
                state.nearbySystems = action.payload.nearbySystems.map(planet => ({
                    ...planet,
                    size: Math.floor(Math.random() * 100) + 50,
                    temperature: Math.floor(Math.random() * 100) - 50,
                    resources: {
                        metal: Math.floor(Math.random() * 1000),
                        crystal: Math.floor(Math.random() * 1000),
                        deuterium: Math.floor(Math.random() * 1000)
                    }
                }));
            })
            .addCase(fetchPlayerLocation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Failed to fetch player location';
            })
            .addCase(colonizePlanet.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(colonizePlanet.fulfilled, (state, action) => {
                state.loading = false;
                state.playerLocation = action.payload.playerLocation;
                state.nearbySystems = action.payload.nearbySystems.map(planet => ({
                    ...planet,
                    size: Math.floor(Math.random() * 100) + 50,
                    temperature: Math.floor(Math.random() * 100) - 50,
                    resources: {
                        metal: Math.floor(Math.random() * 1000),
                        crystal: Math.floor(Math.random() * 1000),
                        deuterium: Math.floor(Math.random() * 1000)
                    }
                }));
            })
            .addCase(colonizePlanet.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Failed to colonize planet';
            });
    },
});

export const { clearGalaxyError } = galaxySlice.actions;

export default galaxySlice.reducer;