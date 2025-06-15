const IORedis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
    throw new Error('REDIS_URL not found in environment variables.');
}

const redisClient = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (error) => {
    console.error('Redis connection error:', error);
});

module.exports = redisClient;
