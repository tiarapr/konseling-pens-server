const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class KemahasiswaanProfilService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async create({ nip, nama_lengkap, jabatan, no_telepon, user_id, created_by }) {
    const query = {
      text: `
        INSERT INTO kemahasiswaan_profil (
          nip, nama_lengkap, jabatan, no_telepon, user_id, created_by
        )
        VALUES (
          $1, $2, $3, $4, $5, $6
        )
        RETURNING *`,
      values: [nip, nama_lengkap, jabatan, no_telepon, user_id, created_by],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to create kemahasiswaan profile.");
    }

    return result.rows[0];
  }

  async getAll() {
    const query = {
      text: `SELECT * FROM kemahasiswaan_profil WHERE deleted_at IS NULL`,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getById(id) {
    const query = {
      text: `SELECT * FROM kemahasiswaan_profil WHERE id = $1 AND deleted_at IS NULL`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Kemahasiswaan profile not found.");
    }

    return result.rows[0];
  }

  async getByUserId(user_id) {
    const query = {
      text: `SELECT * FROM kemahasiswaan_profil WHERE user_id = $1 AND deleted_at IS NULL`,
      values: [user_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Kemahasiswaan profile for user not found.");
    }

    return result.rows[0];
  }

  async update(id, payload) {
    const { nip, nama_lengkap, jabatan, no_telepon, updated_by } = payload;

    // Ambil data lama dulu
    const existing = await this.getById(id);

    const updatedNip = nip ?? existing.nip;
    const updatedNamaLengkap = nama_lengkap ?? existing.nama_lengkap;
    const updatedJabatan = jabatan ?? existing.jabatan;
    const updatedNoTelepon = no_telepon ?? existing.no_telepon;

    const query = {
      text: `
        UPDATE kemahasiswaan_profil
        SET nip = $1,
            nama_lengkap = $2,
            jabatan = $3,
            no_telepon = $4,
            updated_by = $5,
            updated_at = current_timestamp
        WHERE id = $6 AND deleted_at IS NULL
        RETURNING *`,
      values: [updatedNip, updatedNamaLengkap, updatedJabatan, updatedNoTelepon, updated_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Kemahasiswaan profile not found or already deleted.");
    }

    return result.rows[0];
  }

  async softDelete(id, deleted_by) {
    const query = {
      text: `
        UPDATE kemahasiswaan_profil
        SET deleted_by = $1,
            deleted_at = current_timestamp
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *`,
      values: [deleted_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Kemahasiswaan profile not found or already deleted.");
    }

    return result.rows[0];
  }
}

module.exports = KemahasiswaanProfilService;
