const Redis = require('ioredis');

class CacheService {
    constructor() {
        this._client = new Redis(process.env.REDIS_URL);
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
