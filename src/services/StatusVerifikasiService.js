const { Pool } = require('pg');
const NotFoundError = require('../exceptions/NotFoundError');
const CacheService = require('../services/CacheService'); // tambahkan jika belum ada

class StatusVerifikasiService {
    constructor() {
        this._pool = new Pool({ connectionString: process.env.DATABASE_URL });
        this._cache = new CacheService();
        this._baseCacheKey = 'status_verifikasi';
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

    async _invalidateStatusVerifikasiCache(id = null, kode_status = null) {
        const keys = [`${this._baseCacheKey}:list`];

        if (id) {
            keys.push(`${this._baseCacheKey}:id:${id}`);
        }

        if (kode_status) {
            keys.push(`${this._baseCacheKey}:kode:${kode_status.toLowerCase()}`);
        }

        await this._invalidateCache(keys);
    }

    // Get all status_verifikasi
    async getAll() {
        const cacheKey = `${this._baseCacheKey}:list`;
        const cachedData = await this._getFromCache(cacheKey);

        if (cachedData) return cachedData;

        const query = {
            text: `SELECT * FROM status_verifikasi WHERE is_active = true ORDER BY urutan ASC`
        };

        const result = await this._pool.query(query);
        await this._setToCache(cacheKey, result.rows);

        return result.rows;
    }

    // Get by kode_status
    async getByKode(kode_status) {
        const normalizedKode = kode_status.toLowerCase();
        const cacheKey = `${this._baseCacheKey}:kode:${normalizedKode}`;
        const cachedData = await this._getFromCache(cacheKey);

        if (cachedData) return cachedData;

        const query = {
            text: `SELECT * FROM status_verifikasi WHERE kode_status = $1 AND is_active = true`,
            values: [kode_status],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Status verifikasi dengan kode tersebut tidak ditemukan');
        }

        await this._setToCache(cacheKey, result.rows[0]);
        return result.rows[0];
    }

    // Get by ID
    async getById(id) {
        const cacheKey = `${this._baseCacheKey}:id:${id}`;
        const cachedData = await this._getFromCache(cacheKey);

        if (cachedData) return cachedData;

        const query = {
            text: `SELECT * FROM status_verifikasi WHERE id = $1`,
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Status Verifikasi tidak ditemukan');
        }

        await this._setToCache(cacheKey, result.rows[0]);
        return result.rows[0];
    }

    // Create
    async create({ kode_status, label, warna, urutan }) {
        const result = await this._pool.query({
            text: `
                INSERT INTO status_verifikasi (kode_status, label, warna, urutan)
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
            values: [kode_status, label, warna, urutan],
        });

        await this._invalidateStatusVerifikasiCache();
        return result.rows[0];
    }

    // Update
    async update(id, { kode_status, label, warna, urutan, is_active }) {
        const existing = await this.getById(id);

        const query = {
            text: `
                UPDATE status_verifikasi
                SET 
                    kode_status = $1,
                    label = $2,
                    warna = $3,
                    urutan = $4,
                    is_active = $5
                WHERE id = $6
                RETURNING *`,
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
            throw new NotFoundError('Status verifikasi tidak ditemukan untuk diperbarui');
        }

        await this._invalidateStatusVerifikasiCache(id, existing.kode_status);
        return result.rows[0];
    }

    // Soft delete
    async delete(id) {
        const existing = await this.getById(id); // Ambil data sebelum dihapus

        const result = await this._pool.query({
            text: `
                UPDATE status_verifikasi
                SET is_active = false
                WHERE id = $1
                RETURNING *`,
            values: [id],
        });

        if (!result.rows.length) {
            throw new NotFoundError('Status verifikasi tidak ditemukan untuk dinonaktifkan.');
        }

        await this._invalidateStatusVerifikasiCache(id, existing.kode_status);
        return result.rows[0];
    }
}

module.exports = StatusVerifikasiService;
