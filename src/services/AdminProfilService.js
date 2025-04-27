const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class AdminProfilService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async create({ nama_lengkap, no_telepon, user_id, created_by }) {
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
      throw new InvariantError("Gagal membuat profil admin.");
    }

    return result.rows[0];
  }

  async getAll() {
    const query = {
      text: `SELECT * FROM admin_profil WHERE deleted_at IS NULL`,
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

    if (!result.rows.length) {
      throw new NotFoundError("Profil admin tidak ditemukan.");
    }

    return result.rows[0];
  }

  async update(id, { nama_lengkap, no_telepon, updated_by }) {
    const existing = await this.getById(id);

    const updatedNama = nama_lengkap ?? existing.nama_lengkap;
    const updatedTelp = no_telepon ?? existing.no_telepon;

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
      throw new NotFoundError("Profil admin tidak ditemukan atau sudah dihapus.");
    }

    return result.rows[0];
  }

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
      throw new NotFoundError("Profil admin tidak ditemukan atau sudah dihapus.");
    }

    return result.rows[0];
  }
}

module.exports = AdminProfilService;
