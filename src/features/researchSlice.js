import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchResearch = createAsyncThunk('research/fetchResearch', async () => {
    const response = await axios.get('/api/research');
    return response.data;
});

export const upgradeResearch = createAsyncThunk('research/upgradeResearch', async (researchType) => {
    const response = await axios.post('/api/research/upgrade', { researchType });
    return response.data;
});

const researchSlice = createSlice({
    name: 'research',
    initialState: {
        metalResearch: 0,
        crystalResearch: 0,
        deuteriumResearch: 0,
        shipBuilding: 0,
        weaponTypes: [0, 0, 0],
        shieldTypes: [0, 0, 0],
        planetaryShield: 0,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchResearch.fulfilled, (state, action) => {
                return action.payload;
            })
            .addCase(upgradeResearch.fulfilled, (state, action) => {
                const { researchType, level } = action.payload;
                if (Array.isArray(state[researchType])) {
                    state[researchType] = level;
                } else {
                    state[researchType] = level;
                }
            });
    },
});

export default researchSlice.reducer;