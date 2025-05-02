const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class AdminProfilService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  // Cek apakah user_id sudah terdaftar di profil lain
  async checkUserIdExists(userId) {
    const query = {
      text: `SELECT 1 FROM admin_profil WHERE user_id = $1 
             UNION 
             SELECT 1 FROM konselor_profil WHERE user_id = $1 
             UNION 
             SELECT 1 FROM kemahasiswaan_profil WHERE user_id = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  // Cek apakah no_telepon sudah terdaftar di profil lain
  async checkPhoneNumberExists(phoneNumber) {
    const query = {
      text: `SELECT 1 FROM admin_profil WHERE no_telepon = $1 
             UNION 
             SELECT 1 FROM konselor_profil WHERE no_telepon = $1 
             UNION 
             SELECT 1 FROM kemahasiswaan_profil WHERE no_telepon = $1`,
      values: [phoneNumber],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  // Validasi bahwa no_telepon unik (tidak digunakan oleh profil admin lain)
  async validateUniquePhoneNumber(no_telepon) {
    const query = {
      text: `SELECT * FROM admin_profil WHERE no_telepon = $1 AND deleted_at IS NULL`,
      values: [no_telepon],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError("The phone number is already in use by another admin.");
    }
  }

  // Validasi bahwa user hanya memiliki satu profil admin
  async validateUniqueUserProfile(user_id) {
    const query = {
      text: `SELECT * FROM admin_profil WHERE user_id = $1 AND deleted_at IS NULL`,
      values: [user_id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError("Each user can only have one admin profile.");
    }
  }

  // Membuat profil admin baru
  async create({ nama_lengkap, no_telepon, user_id, created_by }) {
    // Validasi no_telepon unik dan profil user sebelum membuat profil admin
    await this.validateUniquePhoneNumber(no_telepon);

    const query = {
      text: `
        INSERT INTO admin_profil (
          nama_lengkap, no_telepon, user_id, created_by
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
      values: [nama_lengkap, no_telepon, user_id, created_by],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to create the admin profile.");
    }

    return result.rows[0];
  }

  // Get all admin profiles
  async getAll() {
    const query = {
      text: `SELECT * FROM admin_profil WHERE deleted_at IS NULL`,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  // Get an admin profile by ID
  async getById(id) {
    const query = {
      text: `SELECT * FROM admin_profil WHERE id = $1 AND deleted_at IS NULL`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Admin profile not found.");
    }

    return result.rows[0];
  }

  // Update an existing admin profile
  async update(id, { nama_lengkap, no_telepon, updated_by }) {
    const existing = await this.getById(id);

    const updatedNama = nama_lengkap ?? existing.nama_lengkap;
    const updatedTelp = no_telepon ?? existing.no_telepon;

    // Jika no_telepon diperbarui, validasi keunikannya
    if (updatedTelp !== existing.no_telepon) {
      await this.validateUniquePhoneNumber(updatedTelp);
    }

    const query = {
      text: `
        UPDATE admin_profil
        SET nama_lengkap = $1,
            no_telepon = $2,
            updated_by = $3,
            updated_at = current_timestamp
        WHERE id = $4 AND deleted_at IS NULL
        RETURNING *`,
      values: [updatedNama, updatedTelp, updated_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Admin profile not found or has already been deleted.");
    }

    return result.rows[0];
  }

  // Soft delete an admin profile
  async softDelete(id, deleted_by) {
    const query = {
      text: `
        UPDATE admin_profil
        SET deleted_by = $1,
            deleted_at = current_timestamp
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *`,
      values: [deleted_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Admin profile not found or has already been deleted.");
    }

    return result.rows[0];
  }
}

module.exports = AdminProfilService;
