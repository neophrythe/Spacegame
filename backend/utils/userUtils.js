const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');

const generateToken = (user) => {
    const payload = {
        user: {
            id: user.id,
            username: user.username
        }
    };
    return jwt.sign(payload, config.secret, { expiresIn: '1h' });
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const comparePassword = async (enteredPassword, storedPassword) => {
    return bcrypt.compare(enteredPassword, storedPassword);
};

module.exports = {
    generateToken,
    hashPassword,
    comparePassword
};
