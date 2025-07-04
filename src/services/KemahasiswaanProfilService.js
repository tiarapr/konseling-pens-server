const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");
const ClientError = require('../exceptions/ClientError'); 

class KemahasiswaanProfilService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  getDatabaseClient() {
    return this._pool.connect();
  }

  // Cek apakah user_id sudah ada di profil lain (Admin/Konselor/Kemahasiswaan)
  async checkUserIdExists(userId) {
    const query = {
      text: `
        SELECT 1 
        FROM admin_profil 
        WHERE user_id = $1 AND deleted_at IS NULL
        UNION 
        SELECT 1 
        FROM kemahasiswaan_profil 
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

  // Validasi apakah user sudah memiliki profil kemahasiswaan
  async validateUniqueUserProfile(user_id) {
    const query = {
      text: `SELECT * FROM kemahasiswaan_profil WHERE user_id = $1 AND deleted_at IS NULL`,
      values: [user_id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new ClientError('Each user can only have one kemahasiswaan profile.', 400);
    }
  }

  // Membuat profil kemahasiswaan baru
  async create(client, { nip, nama_lengkap, jabatan, user_id, created_by }) {
    const query = {
      text: `
      INSERT INTO kemahasiswaan_profil (
        nip, nama_lengkap, jabatan, user_id, created_by
      )
      VALUES (
        $1, $2, $3, $4, $5
      )
      RETURNING *`,
      values: [nip, nama_lengkap, jabatan, user_id, created_by],
    };

    const result = await client.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to create kemahasiswaan profile.");
    }

    return result.rows[0];
  }

  // Mendapatkan semua profil kemahasiswaan
  async getAll() {
    const query = {
      text: `SELECT * FROM kemahasiswaan_profil WHERE deleted_at IS NULL`,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  // Mendapatkan profil kemahasiswaan berdasarkan ID
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

  // Mendapatkan profil kemahasiswaan berdasarkan user_id
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

  async getAllKemahasiswaanWithAccount() {
    const query = {
      text: `
      SELECT ap.*, u.email, u.phone_number, u.is_verified, r.name AS role_name
      FROM kemahasiswaan_profil ap
      JOIN "user" u ON ap.user_id = u.id
      JOIN role_user ru ON u.id = ru.user_id
      JOIN role r ON ru.role_id = r.id
      WHERE ap.deleted_at IS NULL AND u.deleted_at IS NULL
      AND r.name = 'kemahasiswaan'
      ORDER BY ap.created_at DESC
    `,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getKemahasiswaanAccountByUserId(userId) {
    const query = {
      text: `
      SELECT ap.*, u.email, u.phone_number, u.is_verified, r.name AS role_name
      FROM kemahasiswaan_profil ap
      JOIN "user" u ON ap.user_id = u.id
      JOIN role_user ru ON u.id = ru.user_id
      JOIN role r ON ru.role_id = r.id
      WHERE ap.user_id = $1
        AND ap.deleted_at IS NULL
        AND u.deleted_at IS NULL
        AND r.name = 'kemahasiswaan'
      LIMIT 1
    `,
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("Kemahasiswaan account not found for the given user ID.");
    }

    return result.rows[0];
  }

  // Mengupdate profil kemahasiswaan berdasarkan ID
  async update(id, payload, client) {
    const { nip, nama_lengkap, jabatan, photo_url, updated_by } = payload;

    // Ambil data lama dulu
    const existing = await this.getById(id);

    const updatedNip = nip ?? existing.nip;
    const updatedNamaLengkap = nama_lengkap ?? existing.nama_lengkap;
    const updatedJabatan = jabatan ?? existing.jabatan;
    const updatedPhotoUrl = photo_url ?? existing.photo_url;

    const query = {
      text: `
        UPDATE kemahasiswaan_profil
        SET nip = $1,
            nama_lengkap = $2,
            jabatan = $3,
            photo_url = $4,
            updated_by = $5,
            updated_at = current_timestamp
        WHERE id = $6 AND deleted_at IS NULL
        RETURNING *`,
      values: [updatedNip, updatedNamaLengkap, updatedJabatan, updatedPhotoUrl, updated_by, id],
    };

    const result = await client.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Kemahasiswaan profile not found or already deleted.");
    }

    return result.rows[0];
  }

  // Soft delete profil kemahasiswaan
  async softDelete(client, id, deleted_by) {
    const query = {
      text: `
        UPDATE kemahasiswaan_profil
        SET deleted_by = $1,
            deleted_at = current_timestamp
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *`,
      values: [deleted_by, id],
    };

    const result = await client.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Kemahasiswaan profile not found or already deleted.");
    }

    return result.rows[0];
  }

  async restore(id, restored_by) {
    const query = {
      text: `
        UPDATE kemahasiswaan_profil
        SET deleted_by = NULL,
            deleted_at = NULL,
            restored_by = $1,
            restored_at = current_timestamp
        WHERE id = $2 AND deleted_at IS NOT NULL
        RETURNING *`,
      values: [restored_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Kemahasiswaan profile not found or not deleted.");
    }

    return result.rows[0];
  }
}

module.exports = KemahasiswaanProfilService;
