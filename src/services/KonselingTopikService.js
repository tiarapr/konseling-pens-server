const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class KonselingTopikService {
  constructor() {
    this._pool = new Pool();
  }

  // Fungsi untuk menambahkan hubungan konseling dengan topik
  async create(payload) {
    const { konseling_id, topik_id, created_by } = payload;

    const query = {
      text: `
        INSERT INTO konseling_topik (
          konseling_id, topik_id, created_by
        ) VALUES (
          $1, $2, $3
        )
        RETURNING id
      `,
      values: [konseling_id, topik_id, created_by],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Gagal menambahkan hubungan konseling-topik");
    }

    return result.rows[0].id;
  }

  // Fungsi untuk mendapatkan semua topik untuk konseling tertentu
  async getAllByKonselingId(konseling_id) {
    const query = {
      text: `
        SELECT * FROM konseling_topik
        WHERE konseling_id = $1 AND deleted_at IS NULL
      `,
      values: [konseling_id],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  // Fungsi untuk mendapatkan semua konseling yang terkait dengan topik tertentu
  async getAllByTopikId(topik_id) {
    const query = {
      text: `
        SELECT * FROM konseling_topik
        WHERE topik_id = $1 AND deleted_at IS NULL
      `,
      values: [topik_id],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  // Fungsi untuk menghapus hubungan konseling-topik
  async delete(id, deleted_by) {
    const query = {
      text: `
        UPDATE konseling_topik
        SET deleted_at = CURRENT_TIMESTAMP,
            deleted_by = $1
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING id
      `,
      values: [deleted_by, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Hubungan konseling-topik tidak ditemukan atau sudah dihapus");
    }

    return result.rows[0].id;
  }

  // Fungsi untuk memperbarui informasi hubungan konseling-topik
  async update(id, payload) {
    const { updated_by } = payload;

    const existing = await this.getById(id);

    const updatedUpdatedBy = updated_by ?? existing.updated_by;

    const query = {
      text: `
        UPDATE konseling_topik
        SET
          updated_by = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING id
      `,
      values: [updatedUpdatedBy, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui hubungan konseling-topik. ID tidak ditemukan");
    }

    return result.rows[0].id;
  }

  // Fungsi untuk mendapatkan hubungan konseling-topik berdasarkan ID
  async getById(id) {
    const query = {
      text: `
        SELECT * FROM konseling_topik
        WHERE id = $1 AND deleted_at IS NULL
      `,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Hubungan konseling-topik tidak ditemukan");
    }

    return result.rows[0];
  }
}

module.exports = KonselingTopikService;
