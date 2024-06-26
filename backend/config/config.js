module.exports = {
    db: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spacegame',
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    port: process.env.PORT || 5000
};