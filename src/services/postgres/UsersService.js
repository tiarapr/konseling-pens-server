const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class UsersService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async addUser({ email, password, roleId }) {
    await this.verifyNewEmail(email);
    await this.verifyRoleId(roleId); 

    const userId = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: `INSERT INTO users (user_id, user_email, user_password, user_role_id, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, NOW(), NOW()) 
             RETURNING user_id`,
      values: [userId, email, hashedPassword, roleId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to add user.");
    }
    return result.rows[0].user_id;
  }

  async verifyNewEmail(email) {
    const query = {
      text: "SELECT 1 FROM users WHERE user_email = $1",
      values: [email],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError("Email is already in use.");
    }
  }

  async verifyRoleId(roleId) {
    const query = {
      text: "SELECT 1 FROM roles WHERE role_id = $1",
      values: [roleId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new InvariantError("Invalid role ID.");
    }
  }

  async getUserById(userId) {
    const query = {
      text: `SELECT user_id, user_email, user_role_id, created_at, updated_at 
             FROM users 
             WHERE user_id = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("User not found.");
    }

    return result.rows[0];
  }

  async verifyUserCredential(email, password) {
    const query = {
      text: "SELECT user_id, user_password FROM users WHERE user_email = $1",
      values: [email],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError("Invalid credentials.");
    }

    const { user_id, user_password: hashedPassword } = result.rows[0];
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordMatch) {
      throw new AuthenticationError("Invalid credentials.");
    }

    return user_id;
  }

  async getUsersByEmail(email) {
    const query = {
      text: `SELECT user_id, user_email, user_role_id, created_at 
             FROM users 
             WHERE user_email ILIKE $1`,
      values: [`%${email}%`],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = UsersService;
