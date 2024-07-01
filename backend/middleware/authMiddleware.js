const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        logger.warn('Authentication failed: No token provided');
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, config.secret);
        req.user = decoded.user;
        logger.info(`User ${req.user.id} authenticated successfully`);
        next();
    } catch (err) {
        logger.error('Token verification failed:', err);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};