import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const login = createAsyncThunk(
    'user/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const register = createAsyncThunk(
    'user/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register', userData);
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const refreshToken = createAsyncThunk(
    'user/refreshToken',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/refresh-token');
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/user/profile');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'user/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await api.put('/user/profile', profileData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        token: localStorage.getItem('token'),
        loading: false,
        error: null,
        profile: null,
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            state.user = null;
            state.token = null;
            state.error = null;
            state.profile = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.error : 'Login failed';
            })
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? action.payload.error : 'Registration failed';
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.token = action.payload.token;
            })
            .addCase(refreshToken.rejected, (state) => {
                state.user = null;
                state.token = null;
                state.profile = null;
                localStorage.removeItem('token');
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
            });
    },
});

export const { logout, clearError } = userSlice.actions;

export default userSlice.reducer;