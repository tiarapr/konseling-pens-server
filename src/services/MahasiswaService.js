const fs = require('fs');
const path = require('path');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { Pool } = require('pg');

class MahasiswaService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.storagePath = path.join(__dirname, '..', 'storage');
  }

  async create({
    nrp, nama_lengkap, program_studi_id, tanggal_lahir,
    jenis_kelamin, ktm_url, user_id,
    status_verifikasi_id, created_by
  }) {
    const existing = await this.getByNrp(nrp);

    if (existing) {
      throw new InvariantError('Mahasiswa already exists.');
    }

    const query = {
      text: `
      INSERT INTO mahasiswa (
        nrp, nama_lengkap, program_studi_id, tanggal_lahir,
        jenis_kelamin, ktm_url, user_id, status_verifikasi_id
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8
      ) RETURNING *`,
      values: [
        nrp, nama_lengkap, program_studi_id, tanggal_lahir,
        jenis_kelamin, ktm_url, user_id, status_verifikasi_id
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to create mahasiswa.");
    }

    return result.rows[0];
  }

  async getAll() {
    const result = await this._pool.query(`
      SELECT * FROM mahasiswa WHERE deleted_at IS NULL
    `);
    return result.rows;
  }

  async getById(id) {
    const result = await this._pool.query({
      text: `SELECT * FROM mahasiswa WHERE id = $1 AND deleted_at IS NULL`,
      values: [id],
    });

    if (!result.rows.length) {
      throw new NotFoundError('Mahasiswa not found.');
    }

    return result.rows[0];
  }

  async getByNrp(nrp) {
    const result = await this._pool.query({
      text: `SELECT * FROM mahasiswa WHERE nrp = $1 AND deleted_at IS NULL`,
      values: [nrp],
    });

    return result.rows[0] || null;
  }

  async getByUserId(userId) {
    const result = await this._pool.query({
      text: `SELECT * FROM mahasiswa WHERE user_id = $1 AND deleted_at IS NULL`,
      values: [userId],
    });

    return result.rows[0] || null;
  }

  async verifyMahasiswa(id, {
    status_verifikasi_id,
    catatan_verifikasi = null,
    verified_by,
  }) {
    const mahasiswa = await this.getById(id);

    const result = await this._pool.query({
      text: `
      UPDATE mahasiswa SET
        status_verifikasi_id = $1,
        catatan_verifikasi = $2,
        verified_at = NOW(),
        verified_by = $3,
        updated_at = NOW()
      WHERE id = $4 AND deleted_at IS NULL
      RETURNING *`,
      values: [
        status_verifikasi_id,
        catatan_verifikasi,
        verified_by,
        id,
      ],
    });

    if (!result.rows.length) {
      throw new NotFoundError('Failed to verify mahasiswa.');
    }

    return result.rows[0];
  }

  async requestReVerification(id, payload) {
    const existing = await this.getById(id);

    const {
      nrp = existing.nrp,
      nama_lengkap = existing.nama_lengkap,
      program_studi_id = existing.program_studi_id,
      tanggal_lahir = existing.tanggal_lahir,
      jenis_kelamin = existing.jenis_kelamin,
      ktm_url = existing.ktm_url,
      user_id = existing.user_id,
      status_verifikasi_id,
      updated_by
    } = payload;

    const result = await this._pool.query({
      text: `
      UPDATE mahasiswa SET
        nrp = $1,
        nama_lengkap = $2,
        program_studi_id = $3,
        tanggal_lahir = $4,
        jenis_kelamin = $5,
        ktm_url = $6,
        user_id = $7,
        status_verifikasi_id = $8,
        updated_at = NOW(),
        updated_by = $9
      WHERE id = $10 AND deleted_at IS NULL
      RETURNING *`,
      values: [
        nrp,
        nama_lengkap,
        program_studi_id,
        tanggal_lahir,
        jenis_kelamin,
        ktm_url,
        user_id,
        status_verifikasi_id,
        updated_by,
        id
      ],
    });

    if (!result.rows.length) {
      throw new NotFoundError("Mahasiswa not found or already deleted.");
    }

    return result.rows[0];
  }

  async update(id, payload) {
    const existing = await this.getById(id);

    const {
      nrp = existing.nrp,
      nama_lengkap = existing.nama_lengkap,
      program_studi_id = existing.program_studi_id,
      tanggal_lahir = existing.tanggal_lahir,
      jenis_kelamin = existing.jenis_kelamin,
      ktm_url = existing.ktm_url,
      is_active = existing.is_active,
      updated_by
    } = payload;

    const result = await this._pool.query({
      text: `
        UPDATE mahasiswa SET
          nrp = $1,
          nama_lengkap = $2,
          program_studi_id = $3,
          tanggal_lahir = $4,
          jenis_kelamin = $5,
          ktm_url = $6,
          is_active = $7,
          updated_at = NOW(),
          updated_by = $8
        WHERE id = $9 AND deleted_at IS NULL
        RETURNING *`,
      values: [
        nrp,
        nama_lengkap,
        program_studi_id,
        tanggal_lahir,
        jenis_kelamin,
        ktm_url,
        is_active,
        updated_by,
        id
      ],
    });

    if (!result.rows.length) {
      throw new NotFoundError("Mahasiswa not found or already deleted.");
    }

    return result.rows[0];
  }

  async softDelete(id, deleted_by) {
    const result = await this._pool.query({
      text: `
        UPDATE mahasiswa
        SET deleted_at = NOW(),
            deleted_by = $1
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *`,
      values: [deleted_by, id],
    });

    if (!result.rows.length) {
      throw new NotFoundError("Mahasiswa not found or already deleted.");
    }

    return result.rows[0];
  }
}

module.exports = MahasiswaService;
