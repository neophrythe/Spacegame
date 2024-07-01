import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchResources = createAsyncThunk(
    'resources/fetch',
    async () => {
        const response = await api.get('/resources');
        return response.data;
    }
);

const resourcesSlice = createSlice({
    name: 'resources',
    initialState: {
        metal: 0,
        crystal: 0,
        deuterium: 0,
        energy: 0,
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
                state.error = action.error.message;
            });
    },
});

export const { updateResources } = resourcesSlice.actions;

export default resourcesSlice.reducer;