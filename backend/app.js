const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const fleetRoutes = require('./routes/fleetRoutes');
const researchRoutes = require('./routes/researchRoutes');
const galaxyRoutes = require('./routes/galaxyRoutes');
const planetRoutes = require('./routes/planetRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const clanRoutes = require('./routes/clanRoutes');
const espionageRoutes = require('./routes/espionageRoutes');
const chatRoutes = require('./routes/chatRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const errorHandler = require('./middleware/errorHandler');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/galaxies', galaxyRoutes);
app.use('/api/planets', planetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/clans', clanRoutes);
app.use('/api/espionage', espionageRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/achievements', achievementRoutes);
app.use(errorHandler);
app.use(helmet);

module.exports = app;