const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');

const authRoutes = require('./routes/authRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const fleetRoutes = require('./routes/fleetRoutes');
const researchRoutes = require('./routes/researchRoutes');
const galaxyRoutes = require('./routes/galaxyRoutes');
const planetRoutes = require('./routes/planetRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const clanRoutes = require('./routes/clanRoutes');
const espionageRoutes = require('./routes/espionageRoutes');
const { checkFleetMovements } = require('./controllers/fleetController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/galaxies', galaxyRoutes);
app.use('/api/planets', planetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/clans', clanRoutes);
app.use('/api/espionage', espionageRoutes);

// MongoDB connection
mongoose.connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// WebSocket connection
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('authenticate', (token) => {
        try {
            const decoded = jwt.verify(token, config.secret);
            socket.join(decoded.id);
            console.log(`User ${decoded.id} authenticated`);
        } catch (error) {
            console.log('Authentication failed:', error.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Function to emit updates to the client
function emitResourceUpdate(userId, planetId, resources) {
    io.to(userId.toString()).emit('resourceUpdate', { planetId, resources });
}

// Check fleet movements every minute
cron.schedule('* * * * *', async () => {
    console.log('Checking fleet movements...');
    try {
        await checkFleetMovements();
    } catch (error) {
        console.error('Error checking fleet movements:', error);
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, io, emitResourceUpdate };