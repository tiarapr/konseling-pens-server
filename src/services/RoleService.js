const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const CacheService = require('./CacheService');

class RoleService {
  constructor() {
    this._pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this._cache = new CacheService();
    this._baseCacheKey = 'roles';
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

  async _invalidateRoleCache(roleId = null, roleName = null) {
    const keys = [`${this._baseCacheKey}:list`];

    if (roleId) {
      keys.push(`${this._baseCacheKey}:id:${roleId}`);
    }

    if (roleName) {
      keys.push(`${this._baseCacheKey}:name:${roleName.toLowerCase()}`);
    }

    await this._invalidateCache(keys);
  }

  // Public methods

  async addRole({ role_name }) {
    const query = {
      text: 'INSERT INTO role (name) VALUES ($1) RETURNING id, name',
      values: [role_name]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Failed to add role');
    }

    await this._invalidateRoleCache();
    return result.rows[0];
  }

  async getRole() {
    const cacheKey = `${this._baseCacheKey}:list`;
    const cachedData = await this._getFromCache(cacheKey);

    if (cachedData) return cachedData;

    const query = {
      text: 'SELECT id, name FROM role'
    };

    const result = await this._pool.query(query);
    await this._setToCache(cacheKey, result.rows);
    return result.rows;
  }

  async getRoleById(roleId) {
    const cacheKey = `${this._baseCacheKey}:id:${roleId}`;
    const cachedData = await this._getFromCache(cacheKey);

    if (cachedData) return cachedData;

    const query = {
      text: 'SELECT id, name FROM role WHERE id = $1',
      values: [roleId]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Role not found');
    }

    await this._setToCache(cacheKey, result.rows[0]);
    return result.rows[0];
  }

  async getRoleByName(roleName) {
    const normalizedRoleName = roleName.toLowerCase();
    const cacheKey = `${this._baseCacheKey}:name:${normalizedRoleName}`;
    const cachedData = await this._getFromCache(cacheKey);

    if (cachedData) return cachedData;

    const query = {
      text: 'SELECT id, name FROM role WHERE LOWER(name) = LOWER($1)',
      values: [roleName]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Role not found');
    }

    await this._setToCache(cacheKey, result.rows[0]);
    return result.rows[0];
  }

  async updateRole(roleId, { role_name }) {
    if (!role_name || typeof role_name !== 'string') {
      throw new InvariantError('Invalid role name');
    }

    const query = {
      text: 'UPDATE role SET name = $1 WHERE id = $2 RETURNING id, name',
      values: [role_name, roleId]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Role not found');
    }

    await this._invalidateRoleCache(roleId, role_name);
    return result.rows[0];
  }

  async deleteRole(roleId) {
    // Get the role first to invalidate name cache
    const role = await this.getRoleById(roleId);

    const query = {
      text: 'DELETE FROM role WHERE id = $1 RETURNING *',
      values: [roleId]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Role not found');
    }

    await this._invalidateRoleCache(roleId, role.name);
    return result.rows[0];
  }
}

module.exports = RoleService;
