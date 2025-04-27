const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");

class AuthenticationService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async addRefreshToken(userId, token, ipAddress, userAgent, expiresAt) {
    const query = {
      text: `INSERT INTO authentication(user_id, token, ip_address, user_agent, created_at, expires_at, is_revoked) 
             VALUES($1, $2, $3, $4, NOW(), $5, false) RETURNING id`,
      values: [userId, token, ipAddress, userAgent, expiresAt],
    };

    const result = await this._pool.query(query);
    
    if (!result.rows[0].id) {
      throw new InvariantError("Failed to add refresh token");
    }
  }

  async getLoginHistory(userId) {
    const query = {
      text: `SELECT ip_address, user_agent, created_at, expires_at 
             FROM authentication 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows.map(row => ({
      ip: row.ip_address,
      device: row.user_agent,
      loginTime: row.created_at,
      expiredAt: row.expires_at
    }));
  }

  async verifyRefreshToken(token) {
    const query = {
      text: `SELECT token FROM authentication 
             WHERE token = $1 AND is_revoked = false AND expires_at > NOW()`,
      values: [token],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Refresh token tidak valid atau telah kadaluarsa");
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: "UPDATE authentication SET is_revoked = true, revoked_at = NOW() WHERE token = $1",
      values: [token],
    };

    await this._pool.query(query);
  }

  async revokeAllUserTokens(userId) {
    const query = {
      text: "SELECT * FROM authentication WHERE user_id = $1 AND is_revoked = false",
      values: [userId],
    };
  
    const result = await this._pool.query(query);
  
    if (result.rows.length === 0) {
      console.log(`No active tokens found for user ID: ${userId}`);
      return; // Tidak ada token yang bisa di-revoke
    }
  
    // Jika ada token yang aktif, lakukan revoke
    const revokeQuery = {
      text: "UPDATE authentication SET is_revoked = true, revoked_at = NOW() WHERE user_id = $1 AND is_revoked = false",
      values: [userId],
    };
  
    await this._pool.query(revokeQuery);
    console.log(`Tokens for user ID ${userId} have been revoked.`);
  }  
}

module.exports = AuthenticationService;