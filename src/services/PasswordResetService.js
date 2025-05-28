const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");

class PasswordResetService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this._tokenExpirationHours = 24;
  }

  async generateResetPasswordToken(userId) {
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this._tokenExpirationHours);

    const query = {
      text: `INSERT INTO reset_password_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)
             RETURNING token`,
      values: [userId, token, expiresAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Failed to generate reset password token');
    }

    return result.rows[0].token;
  }

  async verifyResetPasswordToken(token) {
    const query = {
      text: `SELECT user_id, expires_at 
             FROM reset_password_tokens 
             WHERE token = $1 AND used_at IS NULL`,
      values: [token],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Invalid or expired reset password token');
    }

    const { user_id, expires_at } = result.rows[0];

    if (new Date(expires_at) < new Date()) {
      throw new InvariantError('Reset password token has expired');
    }

    // Mark token as used
    await this._pool.query({
      text: `UPDATE reset_password_tokens SET used_at = NOW() WHERE token = $1`,
      values: [token],
    });

    return user_id;
  }

}

module.exports = PasswordResetService;