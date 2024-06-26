import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchGalaxies = createAsyncThunk('galaxies/fetchGalaxies', async () => {
    const response = await axios.get('/api/galaxies');
    return response.data;
});

export const fetchGalaxy = createAsyncThunk('galaxies/fetchGalaxy', async (galaxyId) => {
    const response = await axios.get(`/api/galaxies/${galaxyId}`);
    return response.data;
});

const galaxySlice = createSlice({
    name: 'galaxies',
    initialState: [],
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGalaxies.fulfilled, (state, action) => {
                return action.payload;
            })
            .addCase(fetchGalaxy.fulfilled, (state, action) => {
                const index = state.findIndex(g => g._id === action.payload._id);
                if (index !== -1) {
                    state[index] = action.payload;
                } else {
                    state.push(action.payload);
                }
            });
    },
});

export default galaxySlice.reducer;