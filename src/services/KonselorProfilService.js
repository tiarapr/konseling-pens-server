const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");
const ClientError = require('../exceptions/ClientError');  // Adding ClientError for handling client-specific issues

class KonselorProfilService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  // Get konselor profile by user ID
  async getByUserId(user_id) {
    const query = {
      text: `SELECT * FROM konselor_profil WHERE user_id = $1 AND deleted_at IS NULL`,
      values: [user_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Konselor profile for user not found.");
    }

    return result.rows[0];
  }
  
  // Cek apakah user_id sudah terdaftar di profil lain
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

  // Validasi jika no_telepon unik
  async validateUniquePhoneNumber(no_telepon) {
    const query = {
      text: `SELECT * FROM konselor_profil WHERE no_telepon = $1 AND deleted_at IS NULL`,
      values: [no_telepon],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new ClientError('Phone number already in use by another konselor profile.', 400);
    }
  }

  // Validasi jika user sudah memiliki profil
  async validateUniqueUserProfile(user_id) {
    const query = {
      text: `SELECT * FROM konselor_profil WHERE user_id = $1 AND deleted_at IS NULL`,
      values: [user_id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new ClientError('Each user can only have one konselor profile.', 400);
    }
  }

  // Membuat profil konselor baru
  async create({ nip, nama_lengkap, spesialisasi, no_telepon, user_id, created_by }) {
    // Check if phone number is unique
    await this.validateUniquePhoneNumber(no_telepon);

    const query = {
      text: `
        INSERT INTO konselor_profil (
          nip, nama_lengkap, spesialisasi, no_telepon, user_id, created_by
        )
        VALUES (
          $1, $2, $3, $4, $5, $6
        )
        RETURNING *`,
      values: [nip, nama_lengkap, spesialisasi, no_telepon, user_id, created_by],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to create konselor profile.");
    }

    return result.rows[0];
  }

  // Get all konselor profiles
  async getAll() {
    const query = {
      text: `SELECT * FROM konselor_profil WHERE deleted_at IS NULL`,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  // Get konselor profile by ID
  async getById(id) {
    const query = {
      text: `SELECT * FROM konselor_profil WHERE id = $1 AND deleted_at IS NULL`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Konselor profile not found.");
    }

    return result.rows[0];
  }

  // Update konselor profile by ID
  async update(id, payload) {
    const { nip, nama_lengkap, spesialisasi, no_telepon, updated_by } = payload;

    const existing = await this.getById(id);

    const updatedNip = nip ?? existing.nip;
    const updatedNamaLengkap = nama_lengkap ?? existing.nama_lengkap;
    const updatedSpesialisasi = spesialisasi ?? existing.spesialisasi;
    const updatedNoTelepon = no_telepon ?? existing.no_telepon;

    // Check if phone number is updated and validate its uniqueness
    if (updatedNoTelepon !== existing.no_telepon) {
      await this.validateUniquePhoneNumber(updatedNoTelepon);
    }

    const query = {
      text: `
        UPDATE konselor_profil
        SET nip = $1,
            nama_lengkap = $2,
            spesialisasi = $3,
            no_telepon = $4,
            updated_by = $5,
            updated_at = current_timestamp
        WHERE id = $6 AND deleted_at IS NULL
        RETURNING *`,
      values: [updatedNip, updatedNamaLengkap, updatedSpesialisasi, updatedNoTelepon, updated_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Konselor profile not found or already deleted.");
    }

    return result.rows[0];
  }

  // Soft delete konselor profile
  async softDelete(id, deleted_by) {
    const query = {
      text: `
        UPDATE konselor_profil
        SET deleted_by = $1,
            deleted_at = current_timestamp
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *`,
      values: [deleted_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Konselor profile not found or already deleted.");
    }

    return result.rows[0];
  }
}

module.exports = KonselorProfilService;
