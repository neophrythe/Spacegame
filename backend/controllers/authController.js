const User = require('../models/User');
const { generateToken, hashPassword, comparePassword } = require('../utils/userUtils');
const logger = require('../utils/logger');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            logger.warn(`Registration failed: User already exists - ${email}`);
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        const token = generateToken(user);
        logger.info(`User registered successfully: ${email}`);
        res.status(201).json({ token });
    } catch (err) {
        logger.error(`Registration failed for ${email}: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn(`Login attempt failed: User not found - ${email}`);
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            logger.warn(`Login attempt failed: Incorrect password - ${email}`);
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = generateToken(user);
        logger.info(`User logged in successfully: ${email}`);
        res.status(200).json({ token });
    } catch (err) {
        logger.error(`Login error for ${email}: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};