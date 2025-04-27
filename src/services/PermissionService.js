const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class PermissionService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async getAll() {
    const query = {
      text: "SELECT * FROM permission WHERE deleted_at IS NULL",
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getById(id) {
    const query = {
      text: "SELECT * FROM permission WHERE id = $1 AND deleted_at IS NULL",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Permission not found.");
    }

    return result.rows[0];
  }

  async create({ name, created_by }) {
    const query = {
      text: `INSERT INTO permission (name, created_by)
             VALUES ($1, $2)
             RETURNING *`,
      values: [name, created_by],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to create permission.");
    }

    return result.rows[0];
  }

  async update(id, { name, updated_by }) {
    const query = {
      text: `UPDATE permission
             SET name = $1, updated_by = $2, updated_at = current_timestamp
             WHERE id = $3 AND deleted_at IS NULL
             RETURNING *`,
      values: [name, updated_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Permission not found or already deleted.");
    }

    return result.rows[0];
  }

  async softDelete(id, deleted_by) {
    const query = {
      text: `UPDATE permission
             SET deleted_by = $1, deleted_at = current_timestamp
             WHERE id = $2 AND deleted_at IS NULL
             RETURNING *`,
      values: [deleted_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Permission not found or already deleted.");
    }

    return result.rows[0];
  }
}

module.exports = PermissionService;
