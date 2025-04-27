const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class TopikService {
  constructor() {
    this._pool = new Pool();
  }

  async create(payload) {
    const { name, created_by } = payload;

    const query = {
      text: `INSERT INTO topik (name, created_by) 
             VALUES ($1, $2) 
             RETURNING id`,
      values: [name, created_by],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Gagal menambahkan topik");
    }

    return result.rows[0].id;
  }

  // Fungsi untuk mendapatkan semua topik
  async getAll() {
    const result = await this._pool.query(`
      SELECT * FROM topik
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);

    return result.rows;
  }

  // Fungsi untuk mendapatkan topik berdasarkan ID
  async getById(id) {
    const query = {
      text: `SELECT * FROM topik WHERE id = $1 AND deleted_at IS NULL`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Topik tidak ditemukan");
    }

    return result.rows[0];
  }

  // Fungsi untuk memperbarui topik berdasarkan ID
  async update(id, payload) {
    const { name, updated_by } = payload;

    const query = {
      text: `
        UPDATE topik
        SET name = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND deleted_at IS NULL
        RETURNING id`,
      values: [name, updated_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Topik tidak ditemukan atau gagal diperbarui");
    }

    return result.rows[0].id;
  }

  // Fungsi untuk melakukan soft delete topik
  async softDelete(id, deleted_by) {
    const query = {
      text: `
        UPDATE topik
        SET deleted_at = CURRENT_TIMESTAMP, deleted_by = $1
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING id`,
      values: [deleted_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Topik tidak ditemukan atau sudah dihapus");
    }

    return result.rows[0].id;
  }
}

module.exports = TopikService;
