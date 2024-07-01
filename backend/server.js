const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const runScheduledTasks = require('./utils/scheduledTasks');
const jwt = require('jsonwebtoken');
const { swaggerUi, specs } = require('./swaggerConfig');

const authRoutes = require('./routes/authRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const fleetRoutes = require('./routes/fleetRoutes');
const researchRoutes = require('./routes/researchRoutes');
const galaxyRoutes = require('./routes/galaxyRoutes');
const planetRoutes = require('./routes/planetRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const clanRoutes = require('./routes/clanRoutes');
const espionageRoutes = require('./routes/espionageRoutes');
const battleReportRoutes = require('./routes/battleReports');
const coordinatedAttackRoutes = require('./routes/coordinatedAttackRoutes');

const errorHandler = require('./middleware/errorHandler');
const antiCheatMiddleware = require('./middleware/antiCheat');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(helmet());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use(apiLimiter);

const combatLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10
});

app.use(cors());
app.use(express.json());
app.use(antiCheatMiddleware);

mongoose.connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => logger.info('MongoDB connected'))
    .catch(err => logger.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
    logger.info('New client connected');

    socket.on('authenticate', (token) => {
        try {
            const decoded = jwt.verify(token, config.secret);
            socket.join(decoded.id);
            logger.info(`User ${decoded.id} authenticated`);
        } catch (error) {
            logger.error('Authentication failed:', error.message);
        }
    });

    socket.on('disconnect', () => {
        logger.info('Client disconnected');
    });
});

// Add this new root route
app.get('/', (req, res) => {
    res.send('Welcome to the Space Game API');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/galaxies', galaxyRoutes);
app.use('/api/planets', planetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/clans', clanRoutes);
app.use('/api/espionage', espionageRoutes);
app.use('/api/battle-reports', battleReportRoutes);
app.use('/api/coordinated-attacks', coordinatedAttackRoutes);

app.use('/api/fleet/attack', combatLimiter);

app.use(errorHandler);

runScheduledTasks();

const PORT = config.port || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

module.exports = { app, io };