const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const InvariantError = require("../exceptions/InvariantError");
const ClientError = require("../exceptions/ClientError");
const NotFoundError = require("../exceptions/NotFoundError");
const AuthenticationError = require("../exceptions/AuthenticationError");
const AuthorizationError = require("../exceptions/AuthorizationError");

class UserService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this._tokenExpirationHours = 24;
  }

  async getAllUser() {
    const query = {
      text: `SELECT u.id, u.email, u.is_verified, u.created_at, r.name as role_name
             FROM "user" u
             JOIN role_user ru ON u.id = ru.user_id
             JOIN role r ON ru.role_id = r.id`,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getUserById(userId) {
    const query = {
      text: `SELECT u.id, u.email, u.is_verified, u.created_at, u.updated_at, r.name as role_name
             FROM "user" u
             JOIN role_user ru ON u.id = ru.user_id
             JOIN role r ON ru.role_id = r.id
             WHERE u.id = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("User not found.");
    }

    return result.rows[0];
  }

  async addUser({ email, password, isVerified = false, roleId }) {
    await this.verifyNewEmail(email);

    // const userId = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: `INSERT INTO "user" (email, password, is_verified, created_at) 
             VALUES ($1, $2, $3, NOW()) 
             RETURNING id`,
      values: [email, hashedPassword, isVerified],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to add user.");
    }

    const userId = result.rows[0].id;

    await this._pool.query({
      text: `INSERT INTO role_user (user_id, role_id) VALUES ($1, $2)`,
      values: [userId, roleId],
    });

    return userId;
  }

  async generateVerificationToken(userId) {
    // Verify user exists and is not already verified
    const user = await this.getUserById(userId);
    if (user.is_verified) {
      throw new InvariantError("User is already verified");
    }

    // Generate token and expiration date
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this._tokenExpirationHours);

    // Store verification token
    const query = {
      text: `INSERT INTO email_verification_token (user_id, token, expires_at) 
             VALUES ($1, $2, $3) 
             RETURNING token`,
      values: [userId, token, expiresAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to generate verification token");
    }

    return result.rows[0].token;
  }

  async verifyEmail(token) {
    // Get token and check expiration
    const query = {
      text: `SELECT user_id, expires_at 
             FROM email_verification_token 
             WHERE token = $1 AND used_at IS NULL`,
      values: [token],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Invalid or expired verification token");
    }

    const { user_id, expires_at } = result.rows[0];

    if (new Date(expires_at) < new Date()) {
      throw new InvariantError("Verification token has expired");
    }

    // Mark user as verified
    await this._pool.query({
      text: 'UPDATE "user" SET is_verified = true, verified_at = NOW() WHERE id = $1',
      values: [user_id],
    });

    // Mark token as used
    await this._pool.query({
      text: "UPDATE email_verification_token SET used_at = NOW() WHERE token = $1",
      values: [token],
    });

    return user_id;
  }

  async getCurrentUserById(userId) {
    const query = {
      text: `SELECT u.id, u.email, u.is_verified, u.created_at, u.updated_at, r.name as role_name
           FROM "user" u
           JOIN role_user ru ON u.id = ru.user_id
           JOIN role r ON ru.role_id = r.id
           WHERE u.id = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("User not found.");
    }

    return result.rows[0];
  }
  
  async getUserByEmail(email) {
    const query = {
      text: `SELECT id, email, is_verified, created_at 
             FROM "user"
             WHERE LOWER(email) = LOWER($1)`,
      values: [email.trim()],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async invalidateOldVerificationTokens(userId) {
    await this._pool.query({
      text: `UPDATE email_verification_token 
             SET used_at = NOW() 
             WHERE user_id = $1 AND used_at IS NULL`,
      values: [userId],
    });
  }

  async resendVerificationEmail(userId) {
    const user = await this.getUserById(userId);

    if (user.is_verified) {
      throw new InvariantError("User is already verified");
    }

    // Invalidate any existing tokens
    await this._pool.query({
      text: "UPDATE email_verification_token SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL",
      values: [userId],
    });

    // Generate new token
    return this.generateVerificationToken(userId);
  }

  async verifyNewEmail(email) {
    const query = {
      text: 'SELECT 1 FROM "user" WHERE email = $1',
      values: [email],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('Email is already in use.');
    }
  }

  async updateUserEmail(id, newEmail) {
    const query = {
      text: `
        UPDATE "user"
        SET email = $1, is_verified = FALSE, verified_at = NULL, updated_at = NOW() 
        WHERE id = $2
        RETURNING id
      `,
      values: [newEmail, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new ClientError('User not found');
    }
  }

  async verifyUserPassword(userId, oldPassword) {
    const query = {
      text: 'SELECT password FROM "user" WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError('User not found');
    }

    const { password: hashedPassword } = result.rows[0];
    const isPasswordMatch = await bcrypt.compare(oldPassword, hashedPassword);

    if (!isPasswordMatch) {
      throw new AuthenticationError('Old password is incorrect');
    }
  }

  async updateUserPassword(id, newPassword) {
    // Step 3: Hash the new password and update it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatePasswordQuery = {
      text: `
        UPDATE "user"
        SET password = $1, updated_at = NOW() 
        WHERE id = $2
        RETURNING id
      `,
      values: [hashedPassword, id],
    };

    const updateResult = await this._pool.query(updatePasswordQuery);

    if (!updateResult.rows.length) {
      throw new ClientError('User not found');
    }
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

  async updateResetPassword(id, newPassword) {
    // Step 1: Retrieve the current password from the database
    const getCurrentPasswordQuery = {
      text: `SELECT password FROM "user" WHERE id = $1`,
      values: [id],
    };

    const result = await this._pool.query(getCurrentPasswordQuery);

    if (!result.rows.length) {
      throw new ClientError('User not found');
    }

    const currentPassword = result.rows[0].password;

    // Step 2: Check if the new password is the same as the current password
    const isSamePassword = await bcrypt.compare(newPassword, currentPassword);
    if (isSamePassword) {
      throw new ClientError('New password cannot be the same as the old password');
    }

    // Step 3: Hash the new password and update it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatePasswordQuery = {
      text: `
        UPDATE "user" 
        SET password = $1, updated_at = NOW() 
        WHERE id = $2
        RETURNING id
      `,
      values: [hashedPassword, id],
    };

    const updateResult = await this._pool.query(updatePasswordQuery);

    if (!updateResult.rows.length) {
      throw new ClientError('User not found');
    }
  }

  async verifyUserCredential(email, password) {
    const query = {
      text: 'SELECT id, password, is_verified FROM "user" WHERE email = $1',
      values: [email],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError("Invalid credentials.");
    }

    const { id, password: hashedPassword, is_verified } = result.rows[0];
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordMatch) {
      throw new AuthenticationError("Invalid credentials.");
    }

    if (!is_verified) {
      throw new AuthorizationError("Please verify your email address first");
    }

    return id;
  }
}

module.exports = UserService;