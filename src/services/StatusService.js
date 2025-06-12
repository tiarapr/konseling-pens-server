const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const CacheService = require('./CacheService');

class StatusService {
  constructor() {
    this._pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this._cache = new CacheService();
    this._baseCacheKey = 'status';
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

  async _invalidateStatusCache(id = null, kode_status = null) {
    const keys = [
      `${this._baseCacheKey}:list`,
    ];

    if (id) {
      keys.push(`${this._baseCacheKey}:id:${id}`);
    }

    if (kode_status) {
      keys.push(`${this._baseCacheKey}:kode:${kode_status.toLowerCase()}`);
    }

    await this._invalidateCache(keys);
  }

  // Public methods
  async create({ kode_status, label, warna = null, urutan, is_active = true }) {
    const query = {
      text: `
        INSERT INTO status (kode_status, label, warna, urutan, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      values: [kode_status, label, warna, urutan, is_active]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal membuat status');
    }

    await this._invalidateStatusCache();
    return result.rows[0];
  }

  async getAll() {
    const cacheKey = `${this._baseCacheKey}:list`;
    const cachedData = await this._getFromCache(cacheKey);

    if (cachedData) return cachedData;

    const query = {
      text: 'SELECT * FROM status ORDER BY urutan ASC'
    };

    const result = await this._pool.query(query);
    await this._setToCache(cacheKey, result.rows);
    return result.rows;
  }

  async getById(id) {
    const cacheKey = `${this._baseCacheKey}:id:${id}`;
    const cachedData = await this._getFromCache(cacheKey);

    if (cachedData) return cachedData;

    const query = {
      text: 'SELECT * FROM status WHERE id = $1',
      values: [id]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Status tidak ditemukan');
    }

    await this._setToCache(cacheKey, result.rows[0]);
    return result.rows[0];
  }

  async getByKodeStatus(kode_status) {
    const normalizedKode = kode_status.toLowerCase();
    const cacheKey = `${this._baseCacheKey}:kode:${normalizedKode}`;
    const cachedData = await this._getFromCache(cacheKey);

    if (cachedData) return cachedData;

    const query = {
      text: 'SELECT * FROM status WHERE kode_status = $1',
      values: [kode_status]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Status dengan kode tersebut tidak ditemukan');
    }

    await this._setToCache(cacheKey, result.rows[0]);
    return result.rows[0];
  }

  async update(id, { kode_status, label, warna, urutan, is_active }) {
    const existing = await this.getById(id);

    const query = {
      text: `
        UPDATE status
        SET 
          kode_status = $1,
          label = $2,
          warna = $3,
          urutan = $4,
          is_active = $5
        WHERE id = $6
        RETURNING *
      `,
      values: [
        kode_status ?? existing.kode_status,
        label ?? existing.label,
        warna ?? existing.warna,
        urutan ?? existing.urutan,
        is_active ?? existing.is_active,
        id
      ]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Status tidak ditemukan untuk diperbarui');
    }

    await this._invalidateStatusCache(id, existing.kode_status);
    return result.rows[0];
  }

  async delete(id) {
    const status = await this.getById(id);

    const query = {
      text: 'DELETE FROM status WHERE id = $1 RETURNING *',
      values: [id]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Status tidak ditemukan untuk dihapus');
    }

    await this._invalidateStatusCache(id, status.kode_status);
    return result.rows[0];
  }
}

module.exports = StatusService;