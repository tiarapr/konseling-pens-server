const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class DepartementService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async create({ name, created_by }) {
    const query = {
      text: `
        INSERT INTO departement (
          name, created_by
        )
        VALUES (
          $1, $2
        )
        RETURNING *`,
      values: [name, created_by],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to create departement.");
    }

    return result.rows[0];
  }

  async getAll() {
    const query = {
      text: `SELECT * FROM departement WHERE deleted_at IS NULL`,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getById(id) {
    const query = {
      text: `SELECT * FROM departement WHERE id = $1 AND deleted_at IS NULL`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Departement not found.");
    }

    return result.rows[0];
  }

  async update(id, { name, updated_by }) {
    const query = {
      text: `
        UPDATE departement
        SET name = $1,
            updated_by = $2,
            updated_at = current_timestamp
        WHERE id = $3 AND deleted_at IS NULL
        RETURNING *`,
      values: [name, updated_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Departement not found or already deleted.");
    }

    return result.rows[0];
  }

  async softDelete(id, deleted_by) {
    const query = {
      text: `
        UPDATE departement
        SET deleted_by = $1,
            deleted_at = current_timestamp
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *`,
      values: [deleted_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Departement not found or already deleted.");
    }

    return result.rows[0];
  }
}

module.exports = DepartementService;
