const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class StatusService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async create({ name, tipe_status_id, created_by }) {
    const query = {
      text: `
        INSERT INTO status (
          name, tipe_status_id, created_by
        )
        VALUES (
          $1, $2, $3
        )
        RETURNING *`,
      values: [name, tipe_status_id, created_by],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to create status.");
    }

    return result.rows[0];
  }

  async getAll() {
    const query = {
      text: `SELECT * FROM status WHERE deleted_at IS NULL`,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getById(id) {
    const query = {
      text: `SELECT * FROM status WHERE id = $1 AND deleted_at IS NULL`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Status not found.");
    }

    return result.rows[0];
  }

  async update(id, payload) {
    const { name, tipe_status_id, updated_by } = payload;

    const existing = await this.getById(id);

    const updatedName = name ?? existing.name;
    const updatedTipeStatusId = tipe_status_id ?? existing.tipe_status_id;

    const query = {
      text: `
        UPDATE status
        SET name = $1,
            tipe_status_id = $2,
            updated_by = $3,
            updated_at = current_timestamp
        WHERE id = $4 AND deleted_at IS NULL
        RETURNING *`,
      values: [updatedName, updatedTipeStatusId, updated_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Status not found or already deleted.");
    }

    return result.rows[0];
  }

  async softDelete(id, deleted_by) {
    const query = {
      text: `
        UPDATE status
        SET deleted_by = $1,
            deleted_at = current_timestamp
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *`,
      values: [deleted_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Status not found or already deleted.");
    }

    return result.rows[0];
  }
}

module.exports = StatusService;
