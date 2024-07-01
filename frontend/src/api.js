import axios from 'axios';
import { refreshToken } from './features/userSlice';
import store from './store';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            const { token } = await store.dispatch(refreshToken()).unwrap();
            localStorage.setItem('token', token);
            originalRequest.headers['x-auth-token'] = token;
            return api(originalRequest);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
});

export const fleetAPI = {
    getFleet: () => api.get('/fleets'),
    buildShip: (data) => api.post('/fleets/build', data),
    sendFleet: (data) => api.post('/fleets/send', data),
    attack: (data) => api.post('/fleets/attack', data),
    colonize: (data) => api.post('/fleets/colonize', data),
};

export const battleReportAPI = {
    getBattleReports: () => api.get('/battle-reports'),
    getBattleReport: (id) => api.get(`/battle-reports/${id}`),
};

export const coordinatedAttackAPI = {
    createCoordinatedAttack: (data) => api.post('/coordinated-attacks/create', data),
    joinCoordinatedAttack: (data) => api.post('/coordinated-attacks/join', data),
    getCoordinatedAttack: (attackCode) => api.get(`/coordinated-attacks/${attackCode}`),
    listCoordinatedAttacks: () => api.get('/coordinated-attacks'),
    cancelCoordinatedAttack: (attackCode) => api.delete(`/coordinated-attacks/${attackCode}`),
};

export const galaxyAPI = {
    getPlayerLocation: () => api.get('/player/location'),
    colonizePlanet: (planetId) => api.post(`/planets/${planetId}/colonize`),
};

export default api;