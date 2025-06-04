const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class StatusService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async create({ kode_status, label, warna = null, urutan, is_active = true }) {
    const query = {
      text: `
        INSERT INTO status (
          kode_status, label, warna, urutan, is_active
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
      values: [kode_status, label, warna, urutan, is_active],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Gagal membuat status.");
    }

    return result.rows[0];
  }

  async getAll() {
    const query = {
      text: `SELECT * FROM status ORDER BY urutan ASC`,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getById(id) {
    const query = {
      text: `SELECT * FROM status WHERE id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Status tidak ditemukan.");
    }

    return result.rows[0];
  }

  async getByKodeStatus(kode_status) {
    const query = {
      text: `SELECT * FROM status WHERE kode_status = $1`,
      values: [kode_status],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Status dengan kode tersebut tidak ditemukan.");
    }
    
    return result.rows[0];
  }

  async update(id, { kode_status, label, warna, urutan, is_active }) {
    const existing = await this.getById(id);

    const updatedQuery = {
      text: `
        UPDATE status
        SET 
          kode_status = $1,
          label = $2,
          warna = $3,
          urutan = $4,
          is_active = $5
        WHERE id = $6
        RETURNING *`,
      values: [
        kode_status ?? existing.kode_status,
        label ?? existing.label,
        warna ?? existing.warna,
        urutan ?? existing.urutan,
        is_active ?? existing.is_active,
        id,
      ],
    };

    const result = await this._pool.query(updatedQuery);

    if (!result.rows.length) {
      throw new NotFoundError("Status tidak ditemukan untuk diperbarui.");
    }

    return result.rows[0];
  }

  async delete(id) {
    const query = {
      text: `DELETE FROM status WHERE id = $1 RETURNING *`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Status tidak ditemukan untuk dihapus.");
    }

    return result.rows[0];
  }
}

module.exports = StatusService;
