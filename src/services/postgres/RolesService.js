const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class RolesService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async addRole({ role_name }) {
    const roleId = `role-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO roles (role_id, role_name) 
             VALUES ($1, $2) 
             RETURNING role_id`,
      values: [roleId, role_name],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to add role.");
    }
    return result.rows[0].role_id;
  }

  async getRoles() {
    const query = {
      text: "SELECT role_id, role_name FROM roles",
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getRoleById(roleId) {
    const query = {
      text: "SELECT role_id, role_name FROM roles WHERE role_id = $1",
      values: [roleId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Role not found.");
    }

    return result.rows[0];
  }

  async deleteRole(roleId) {
    const query = {
      text: "DELETE FROM roles WHERE role_id = $1 RETURNING role_id",
      values: [roleId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Role not found.");
    }
  }
}

module.exports = RolesService;
