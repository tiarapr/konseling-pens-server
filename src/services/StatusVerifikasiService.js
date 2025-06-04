const { Pool } = require('pg');
const NotFoundError = require('../exceptions/NotFoundError');

class StatusVerifikasiService {
    constructor() {
        this._pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }

    // Get all status_verifikasi (ordered by urutan)
    async getAll() {
        const result = await this._pool.query(`
      SELECT * FROM status_verifikasi
      WHERE is_active = true
      ORDER BY urutan ASC
    `);
        return result.rows;
    }

    // Get status by kode_status (e.g., 'menunggu_verifikasi')
    async getByKode(kode_status) {
        const result = await this._pool.query({
            text: `SELECT * FROM status_verifikasi WHERE kode_status = $1 AND is_active = true`,
            values: [kode_status],
        });

        if (!result.rows.length) {
            throw new NotFoundError(`Status verifikasi dengan kode '${kode_status}' tidak ditemukan.`);
        }

        return result.rows[0];
    }

    // Get status by ID
    async getById(id) {
        const result = await this._pool.query({
            text: `SELECT * FROM status_verifikasi WHERE id = $1`,
            values: [id],
        });

        if (!result.rows.length) {
            throw new NotFoundError('Status verifikasi tidak ditemukan.');
        }

        return result.rows[0];
    }

    // Optional: Create new status_verifikasi (admin only, usually during setup)
    async create({ kode_status, label, warna, urutan }) {
        const result = await this._pool.query({
            text: `
        INSERT INTO status_verifikasi (kode_status, label, warna, urutan)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
            values: [kode_status, label, warna, urutan],
        });

        return result.rows[0];
    }

    // Optional: Soft delete / deactivate
    async deactivate(id) {
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

        return result.rows[0];
    }
}

module.exports = StatusVerifikasiService;
