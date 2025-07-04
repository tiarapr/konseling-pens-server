const redisClient = require('../config/redis');

class CacheService {
    constructor() {
        this._client = redisClient;
    }

    async set(key, value, ttl = 3600) {
        await this._client.set(key, JSON.stringify(value), 'EX', ttl);
    }

    async get(key) {
        const result = await this._client.get(key);
        return result ? JSON.parse(result) : null;
    }

    async delete(key) {
        await this._client.del(key);
    }
}

module.exports = CacheService;
