const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const CacheService = require('./CacheService');

class PermissionService {
  constructor() {
    this._pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this._cache = new CacheService();
    this._baseCacheKey = 'permissions';
  }

  // Private cache helpers
  async _getFromCache(key) {
    try {
      return await this._cache.get(key);
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  async _setToCache(key, data) {
    try {
      await this._cache.set(key, data);
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  async _invalidateCache(keys = []) {
    try {
      const keysToDelete = Array.isArray(keys) ? keys : [keys];
      await Promise.all(keysToDelete.map(key => this._cache.delete(key)));
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  async _invalidatePermissionCache(id = null) {
    const keys = [`${this._baseCacheKey}:list`];

    if (id) {
      keys.push(`${this._baseCacheKey}:${id}`);
    }
    
    await this._invalidateCache(keys);
  }

  // Public methods
  async getAll() {
    const cacheKey = `${this._baseCacheKey}:list`;
    const cachedData = await this._getFromCache(cacheKey);

    if (cachedData) return cachedData;

    const query = {
      text: 'SELECT * FROM permission WHERE deleted_at IS NULL'
    };

    const result = await this._pool.query(query);
    await this._setToCache(cacheKey, result.rows);
    return result.rows;
  }

  async getById(id) {
    const cacheKey = `${this._baseCacheKey}:${id}`;
    const cachedData = await this._getFromCache(cacheKey);

    if (cachedData) return cachedData;

    const query = {
      text: 'SELECT * FROM permission WHERE id = $1 AND deleted_at IS NULL',
      values: [id]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Permission not found');
    }

    await this._setToCache(cacheKey, result.rows[0]);
    return result.rows[0];
  }

  async create({ name, created_by }) {
    const query = {
      text: `
        INSERT INTO permission (name, created_by)
        VALUES ($1, $2)
        RETURNING *
      `,
      values: [name, created_by]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Failed to create permission');
    }

    await this._invalidatePermissionCache();
    return result.rows[0];
  }

  async update(id, { name, updated_by }) {
    const query = {
      text: `
        UPDATE permission
        SET name = $1,
            updated_by = $2,
            updated_at = NOW()
        WHERE id = $3 AND deleted_at IS NULL
        RETURNING *
      `,
      values: [name, updated_by, id]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Permission not found or already deleted');
    }

    await this._invalidatePermissionCache(id);
    return result.rows[0];
  }

  async softDelete(id, deleted_by) {
    const query = {
      text: `
        UPDATE permission
        SET deleted_by = $1,
            deleted_at = NOW()
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *
      `,
      values: [deleted_by, id]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Permission not found or already deleted');
    }

    await this._invalidatePermissionCache(id);
    return result.rows[0];
  }
}

module.exports = PermissionService;