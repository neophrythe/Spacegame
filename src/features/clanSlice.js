import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const createClan = createAsyncThunk('clan/create', async (clanData) => {
    const response = await axios.post('/api/clans/create', clanData);
    return response.data;
});

export const joinClan = createAsyncThunk('clan/join', async (clanId) => {
    const response = await axios.post('/api/clans/join', { clanId });
    return response.data;
});

export const leaveClan = createAsyncThunk('clan/leave', async () => {
    const response = await axios.post('/api/clans/leave');
    return response.data;
});

export const getClanInfo = createAsyncThunk('clan/getInfo', async (clanId) => {
    const response = await axios.get(`/api/clans/${clanId}`);
    return response.data;
});

const clanSlice = createSlice({
    name: 'clan',
    initialState: {
        currentClan: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createClan.fulfilled, (state, action) => {
                state.currentClan = action.payload;
            })
            .addCase(joinClan.fulfilled, (state, action) => {
                state.currentClan = action.payload;
            })
            .addCase(leaveClan.fulfilled, (state) => {
                state.currentClan = null;
            })
            .addCase(getClanInfo.fulfilled, (state, action) => {
                state.currentClan = action.payload;
            });
    },
});

export default clanSlice.reducer;