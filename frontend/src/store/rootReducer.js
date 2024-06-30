import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchGalaxies = createAsyncThunk('galaxies/fetchGalaxies', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/galaxies');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const fetchGalaxy = createAsyncThunk('galaxies/fetchGalaxy', async (galaxyId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/galaxies/${galaxyId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const galaxySlice = createSlice({
    name: 'galaxies',
    initialState: {
        galaxies: [],
        currentGalaxy: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGalaxies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGalaxies.fulfilled, (state, action) => {
                state.loading = false;
                state.galaxies = action.payload;
            })
            .addCase(fetchGalaxies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Failed to fetch galaxies';
            })
            .addCase(fetchGalaxy.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGalaxy.fulfilled, (state, action) => {
                state.loading = false;
                state.currentGalaxy = action.payload;
            })
            .addCase(fetchGalaxy.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.message : 'Failed to fetch galaxy';
            });
    },
});

export default galaxySlice.reducer;