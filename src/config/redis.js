const IORedis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
    throw new Error('REDIS_URL not found in environment variables.');
}

// Parse the URL to extract components if needed later
const redisUrlObj = new URL(REDIS_URL);

const redisClient = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    connectTimeout: 10000, // 10 seconds
    family: 0, // Dual stack (IPv4/IPv6)
    host: redisUrlObj.hostname,
    port: redisUrlObj.port,
    username: redisUrlObj.username,
    password: redisUrlObj.password,
});

redisClient.on('connect', () => {
    console.log('Connecting to Redis...');
});

redisClient.on('ready', () => {
    console.log('Connected to Redis and ready to use');
});

redisClient.on('error', (error) => {
    console.error('Redis connection error:', error);
});

redisClient.on('close', () => {
    console.log('Redis connection closed');
});

redisClient.on('reconnecting', () => {
    console.log('Reconnecting to Redis...');
});

// Graceful shutdown handler
process.on('SIGINT', () => {
    redisClient.quit().then(() => {
        console.log('Redis connection closed through app termination');
        process.exit(0);
    });
});

module.exports = redisClient;