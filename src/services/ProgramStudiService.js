const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const CacheService = require('./CacheService');

class ProgramStudiService {
  constructor() {
    this._pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this._cache = new CacheService();
    this._baseCacheKey = 'program_studi';
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

  async _invalidateProgramStudiCache(id = null) {
    const keys = [
      `${this._baseCacheKey}:list`,
      `${this._baseCacheKey}:departement_list`
    ];

    if (id) {
      keys.push(`${this._baseCacheKey}:${id}`);
    }

    await this._invalidateCache(keys);
  }

  // Public methods
  async create({ jenjang, nama_program_studi, departement_id, created_by }) {
    const query = {
      text: `
        INSERT INTO program_studi (
          departement_id, jenjang, nama_program_studi, created_by
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      values: [departement_id, jenjang, nama_program_studi, created_by]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Failed to create program studi');
    }

    await this._invalidateProgramStudiCache();
    return result.rows[0];
  }

  async getAll() {
    const cacheKey = `${this._baseCacheKey}:list`;
    const cachedData = await this._getFromCache(cacheKey);

    if (cachedData) return cachedData;

    const query = {
      text: `
        SELECT ps.*, d.name AS nama_departemen
        FROM program_studi ps
        LEFT JOIN departement d ON ps.departement_id = d.id
        WHERE ps.deleted_at IS NULL
      `
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
      text: 'SELECT * FROM program_studi WHERE id = $1 AND deleted_at IS NULL',
      values: [id]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Program studi not found');
    }

    await this._setToCache(cacheKey, result.rows[0]);
    return result.rows[0];
  }

  async getByDepartement(departement_id) {
    const cacheKey = `${this._baseCacheKey}:departement:${departement_id}`;
    const cachedData = await this._getFromCache(cacheKey);

    if (cachedData) return cachedData;

    const query = {
      text: 'SELECT * FROM program_studi WHERE departement_id = $1 AND deleted_at IS NULL',
      values: [departement_id]
    };

    const result = await this._pool.query(query);
    await this._setToCache(cacheKey, result.rows);
    return result.rows;
  }

  async update(id, payload) {
    const { jenjang, nama_program_studi, departement_id, updated_by } = payload;

    const existing = await this.getById(id);

    const query = {
      text: `
        UPDATE program_studi
        SET jenjang = $1,
            nama_program_studi = $2,
            departement_id = $3,
            updated_by = $4,
            updated_at = NOW()
        WHERE id = $5 AND deleted_at IS NULL
        RETURNING *
      `,
      values: [
        jenjang ?? existing.jenjang,
        nama_program_studi ?? existing.nama_program_studi,
        departement_id ?? existing.departement_id,
        updated_by,
        id
      ]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Program studi not found or already deleted');
    }

    await this._invalidateProgramStudiCache(id);
    return result.rows[0];
  }

  async softDelete(id, deleted_by) {
    const query = {
      text: `
        UPDATE program_studi
        SET deleted_by = $1,
            deleted_at = NOW()
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *
      `,
      values: [deleted_by, id]
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Program studi not found or already deleted');
    }

    await this._invalidateProgramStudiCache(id);
    return result.rows[0];
  }
}

module.exports = ProgramStudiService;