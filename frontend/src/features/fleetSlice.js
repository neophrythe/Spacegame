import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchFleet = createAsyncThunk('fleet/fetchFleet', async () => {
    const response = await axios.get('/api/fleet');
    return response.data;
});

export const buildShip = createAsyncThunk('fleet/buildShip', async ({ shipType, amount }) => {
    const response = await axios.post('/api/fleet/build', { shipType, amount });
    return response.data;
});

const fleetSlice = createSlice({
    name: 'fleet',
    initialState: {
        raven: 0,
        marauder: 0,
        vandal: 0,
        stinger: 0,
        brawler: 0,
        devastator: 0,
        sentinel: 0,
        fortress: 0,
        transport: 0,
        colony: 0,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFleet.fulfilled, (state, action) => {
                return action.payload;
            })
            .addCase(buildShip.fulfilled, (state, action) => {
                const { shipType, quantity } = action.payload;
                state[shipType] += quantity;
            });
    },
});

export default fleetSlice.reducer;