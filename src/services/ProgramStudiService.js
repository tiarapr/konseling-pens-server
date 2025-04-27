const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class ProgramStudiService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async create({ jenjang, nama_program_studi, departement_id, created_by }) {
    const query = {
      text: `
        INSERT INTO program_studi (
          departement_id, jenjang, nama_program_studi, created_by
        )
        VALUES (
          $1, $2, $3, $4
        )
        RETURNING *`,
      values: [departement_id, jenjang, nama_program_studi, created_by],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to create program studi.");
    }

    return result.rows[0];
  }

  async getAll() {
    const query = {
      text: `SELECT * FROM program_studi WHERE deleted_at IS NULL`,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getById(id) {
    const query = {
      text: `SELECT * FROM program_studi WHERE id = $1 AND deleted_at IS NULL`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Program studi not found.");
    }

    return result.rows[0];
  }

  async getByDepartement(departement_id) {
    const query = {
      text: `SELECT * FROM program_studi WHERE departement_id = $1 AND deleted_at IS NULL`,
      values: [departement_id],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async update(id, payload) {
    const { jenjang, nama_program_studi, departement_id, updated_by } = payload;

    const existing = await this.getById(id);

    const updatedJenjang = jenjang ?? existing.jenjang;
    const updatedNamaProdi = nama_program_studi ?? existing.nama_program_studi;
    const updatedDepartementId = departement_id ?? existing.departement_id;

    const query = {
      text: `
        UPDATE program_studi
        SET jenjang = $1,
            nama_program_studi = $2,
            departement_id = $3,
            updated_by = $4,
            updated_at = current_timestamp
        WHERE id = $5 AND deleted_at IS NULL
        RETURNING *`,
      values: [updatedJenjang, updatedNamaProdi, updatedDepartementId, updated_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Program studi not found or already deleted.");
    }

    return result.rows[0];
  }

  async softDelete(id, deleted_by) {
    const query = {
      text: `
        UPDATE program_studi
        SET deleted_by = $1,
            deleted_at = current_timestamp
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *`,
      values: [deleted_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Program studi not found or already deleted.");
    }

    return result.rows[0];
  }
}

module.exports = ProgramStudiService;
