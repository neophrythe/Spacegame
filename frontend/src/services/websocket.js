import io from 'socket.io-client';
import { store } from '../store';
import { updateResources } from '../features/resourcesSlice';
import { addNotification } from '../features/notificationSlice';
import config from '../config';

const socket = io(config.SOCKET_URL);

socket.on('connect', () => {
    console.log('Connected to websocket');
});

socket.on('resourceUpdate', (data) => {
    store.dispatch(updateResources(data));
});

socket.on('notification', (data) => {
    store.dispatch(addNotification(data));
});

export const initializeWebSocket = (token) => {
    socket.emit('authenticate', token);
};

export default socket;