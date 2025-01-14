const Redis = require('redis');
require('dotenv').config();

// Create Redis client with more specific configuration
const redisClient = Redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },
    legacyMode: false
});

// Initialize Redis connection
const initRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Redis Client Connected');
    } catch (err) {
        console.error('Redis Connection Error:', err);
        process.exit(1);
    }
};

// Handle Redis errors
redisClient.on('error', (err) => {
    console.error('Redis Error:', err);
});

// Export initialized client and methods
module.exports = {
    redisClient,
    initRedis,
    getAsync: async (key) => {
        try {
            return await redisClient.get(key);
        } catch (err) {
            console.error('Redis Get Error:', err);
            return null;
        }
    },
    setexAsync: async (key, seconds, value) => {
        try {
            return await redisClient.setEx(key, seconds, value);
        } catch (err) {
            console.error('Redis Set Error:', err);
            return null;
        }
    }
}; 