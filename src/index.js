const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const config = require('./config');
const runScheduledTasks = require('./scheduledTasks');

const server = http.createServer(app);
const io = socketIo(server);

// WebSocket connection
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Run scheduled tasks
runScheduledTasks();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, io };