const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");

class EmailVerificationService {
    constructor() {
        this._pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
        this._tokenExpirationHours = 24;
    }

    // getDatabaseClient() {
    //     return this._pool.connect();
    // }

    async generateToken(client, userId) {
        const token = nanoid(32);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + this._tokenExpirationHours);

        const query = {
            text: `INSERT INTO email_verification_token (user_id, token, expires_at) 
               VALUES ($1, $2, $3) RETURNING token`,
            values: [userId, token, expiresAt],
        };

        const result = await client.query(query);

        if (!result.rows.length) {
            throw new InvariantError("Failed to generate verification token");
        }

        return result.rows[0].token;
    }

    async verifyEmail(client, token) {
        const query = {
            text: `SELECT user_id, expires_at 
             FROM email_verification_token 
             WHERE token = $1 AND used_at IS NULL`,
            values: [token],
        };

        const result = await client.query(query);

        if (!result.rows.length) {
            throw new InvariantError("Invalid or expired verification token");
        }

        const { user_id, expires_at } = result.rows[0];

        if (new Date(expires_at) < new Date()) {
            throw new InvariantError("Verification token has expired");
        }

        await client.query({
            text: 'UPDATE "user" SET is_verified = true, verified_at = NOW() WHERE id = $1',
            values: [user_id],
        });

        await client.query({
            text: "UPDATE email_verification_token SET used_at = NOW() WHERE token = $1",
            values: [token],
        });

        return user_id;
    }

    async invalidateOldTokens(userId) {
        await this._pool.query({
            text: `UPDATE email_verification_token 
             SET used_at = NOW() 
             WHERE user_id = $1 AND used_at IS NULL`,
            values: [userId],
        });
    }

    async resendToken(userId) {
        await this.invalidateOldTokens(userId);

        return this.generateToken(userId);
    }
}

module.exports = EmailVerificationService;
