import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Thunk to fetch all battle reports
export const fetchBattleReports = createAsyncThunk(
    'battleReports/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/battle-reports');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Thunk to fetch a single battle report by ID
export const fetchBattleReport = createAsyncThunk(
    'battleReports/fetchById',
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
            // Fetch all battle reports
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
            // Fetch single battle report
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