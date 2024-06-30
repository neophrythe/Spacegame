import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchBattleReports = createAsyncThunk(
    'battleReports/fetchBattleReports',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/battle-reports');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchBattleReport = createAsyncThunk(
    'battleReports/fetchBattleReport',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/battle-reports/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const battleReportsSlice = createSlice({
    name: 'battleReports',
    initialState: {
        reports: [],
        currentReport: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBattleReports.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBattleReports.fulfilled, (state, action) => {
                state.loading = false;
                state.reports = action.payload;
            })
            .addCase(fetchBattleReports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchBattleReport.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBattleReport.fulfilled, (state, action) => {
                state.loading = false;
                state.currentReport = action.payload;
            })
            .addCase(fetchBattleReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default battleReportsSlice.reducer;