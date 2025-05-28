const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class AdminProfilService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async checkUserIdExists(userId) {
    const query = {
      text: `
        SELECT 1 
        FROM admin_profil 
        WHERE user_id = $1 AND deleted_at IS NULL
        UNION 
        SELECT 1 
        FROM konselor_profil 
        WHERE user_id = $1 AND deleted_at IS NULL
        UNION 
        SELECT 1 
        FROM kemahasiswaan_profil 
        WHERE user_id = $1 AND deleted_at IS NULL
      `,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async validateUniqueUserProfile(user_id) {
    const query = {
      text: `SELECT 1 FROM admin_profil WHERE user_id = $1 AND deleted_at IS NULL`,
      values: [user_id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError("Each user can only have one admin profile.");
    }
  }

  async create({ nama_lengkap, user_id, created_by, photo_url = null }) {
    const query = {
      text: `
        INSERT INTO admin_profil (
          nama_lengkap, user_id, created_by, photo_url
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
      values: [nama_lengkap, user_id, created_by, photo_url],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new InvariantError("Failed to create the admin profile.");
    }

    return result.rows[0];
  }

  async getAll() {
    const query = {
      text: `SELECT * FROM admin_profil WHERE deleted_at IS NULL ORDER BY created_at DESC`,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getById(id) {
    const query = {
      text: `SELECT * FROM admin_profil WHERE id = $1 AND deleted_at IS NULL`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("Admin profile not found.");
    }

    return result.rows[0];
  }

  async getByUserId(userId) {
    const query = {
      text: `SELECT * FROM admin_profil WHERE user_id = $1 AND deleted_at IS NULL`,
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      return null; // Return null if no profile found
    }

    return result.rows[0];
  }

  async update(id, { nama_lengkap, photo_url, updated_by }) {
    const existing = await this.getById(id);

    const query = {
      text: `
        UPDATE admin_profil
        SET 
          nama_lengkap = $1,
          photo_url = $2,
          updated_by = $3,
          updated_at = current_timestamp
        WHERE id = $4 AND deleted_at IS NULL
        RETURNING *`,
      values: [
        nama_lengkap ?? existing.nama_lengkap,
        photo_url ?? existing.photo_url,
        updated_by,
        id,
      ],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("Admin profile not found or has already been deleted.");
    }

    return result.rows[0];
  }

  async softDelete(id, deleted_by) {
    const query = {
      text: `
        UPDATE admin_profil
        SET 
          deleted_by = $1,
          deleted_at = current_timestamp
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *`,
      values: [deleted_by, id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("Admin profile not found or has already been deleted.");
    }

    return result.rows[0];
  }

  async restore(id, restored_by) {
    const query = {
      text: `
        UPDATE admin_profil
        SET 
          restored_by = $1,
          restored_at = current_timestamp,
          deleted_by = NULL,
          deleted_at = NULL
        WHERE id = $2 AND deleted_at IS NOT NULL
        RETURNING *`,
      values: [restored_by, id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("Admin profile not found or has not been deleted.");
    }

    return result.rows[0];
  }
}

module.exports = AdminProfilService;
