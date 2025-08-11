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

  getDatabaseClient() {
    return this._pool.connect();
  }

  async addUser(client, { email, phoneNumber, password, isVerified = false, roleId, createdBy }) {
    await this.verifyNewEmail(client, email);
    await this.verifyUserPhoneNumber(phoneNumber);

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = {
      text: `INSERT INTO "user" (email, phone_number, password, is_verified, created_at)
           VALUES ($1, $2, $3, $4, NOW())
           RETURNING id`,
      values: [email, phoneNumber, hashedPassword, isVerified],
    };

    const result = await client.query(insertQuery);

    if (!result.rows.length) {
      throw new InvariantError("Failed to add user.");
    }

    const userId = result.rows[0].id;
    const creatorId = createdBy || userId;

    await client.query({
      text: `UPDATE "user" SET created_by = $1 WHERE id = $2`,
      values: [creatorId, userId],
    });

    await client.query({
      text: `INSERT INTO role_user (user_id, role_id, created_at, created_by)
           VALUES ($1, $2, NOW(), $3)`,
      values: [userId, roleId, creatorId],
    });

    return userId;
  }

  async getAdmins() {
    const query = {
      text: `SELECT u.id, u.email, u.phone_number, u.is_verified, u.created_at, u.updated_at, r.name as role_name
         FROM "user" u
         JOIN role_user ru ON u.id = ru.user_id
         JOIN role r ON ru.role_id = r.id
         WHERE r.name = 'admin' AND u.deleted_at IS NULL`,
      values: [],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError("No admins found.");
    }

    return result.rows;
  }

  async getAllUser() {
    const query = {
      text: `SELECT u.id, u.email, u.phone_number, u.is_verified, u.created_at, r.name as role_name
         FROM "user" u
         JOIN role_user ru ON u.id = ru.user_id
         JOIN role r ON ru.role_id = r.id
         WHERE u.deleted_at IS NULL
         ORDER BY u.created_at DESC`,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getUserById(userId) {
    const query = {
      text: `SELECT u.id, u.email, u.phone_number, u.is_verified, u.created_at, u.updated_at, r.name as role_name
         FROM "user" u
         JOIN role_user ru ON u.id = ru.user_id
         JOIN role r ON ru.role_id = r.id
         WHERE u.id = $1 AND u.deleted_at IS NULL`,
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("User not found.");
    }

    return result.rows[0];
  }

  async getCurrentUserById(userId) {
    const query = {
      text: `SELECT u.id, u.email, u.phone_number, u.is_verified, u.created_at, u.updated_at, r.name as role_name
           FROM "user" u
           JOIN role_user ru ON u.id = ru.user_id
           JOIN role r ON ru.role_id = r.id
           WHERE u.id = $1 AND u.deleted_at IS NULL`,
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
      text: `
      SELECT u.id, u.email, u.phone_number, u.is_verified, u.created_at, r.name AS role_name
      FROM "user" u
      JOIN role_user ru ON ru.user_id = u.id AND ru.deleted_at IS NULL
      JOIN role r ON r.id = ru.role_id
      WHERE LOWER(u.email) = LOWER($1)
      LIMIT 1
    `,
      values: [email.trim()],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async verifyNewEmail(client, email) {
    const query = {
      text: 'SELECT 1 FROM "user" WHERE email = $1 AND deleted_at IS NULL',
      values: [email],
    };

    const result = await client.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('Email telah digunakan atau terdaftar di sistem.');
    }
  }

  async updateUserEmail(id, newEmail, updated_by) {
    const query = {
      text: `
        UPDATE "user"
        SET email = $1, is_verified = FALSE, verified_at = NULL, updated_at = NOW(), updated_by = $2
        WHERE id = $3
        RETURNING *
      `,
      values: [newEmail, updated_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new ClientError('User not found');
    }
  }

  async verifyUserPhoneNumber(phoneNumber) {
    const query = {
      text: 'SELECT id FROM "user" WHERE phone_number = $1',
      values: [phoneNumber],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('Nomor Whatsapp telah digunakan atau terdaftar di sistem');
    }
  }

  async updateUserPhoneNumber(id, newPhoneNumber, updated_by) {
    const query = {
      text: `
        UPDATE "user"
        SET phone_number = $1, updated_at = NOW() , updated_by = $2
        WHERE id = $3
        RETURNING *
      `,
      values: [newPhoneNumber, updated_by, id],
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
      throw new ClientError('Old password is incorrect', 400);
    }
  }

  async updateUserPassword(id, newPassword, updated_by) {
    // Step 3: Hash the new password and update it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatePasswordQuery = {
      text: `
        UPDATE "user"
        SET password = $1, updated_at = NOW() , updated_by = $2
        WHERE id = $3
        RETURNING *
      `,
      values: [hashedPassword, updated_by, id],
    };

    const updateResult = await this._pool.query(updatePasswordQuery);

    if (!updateResult.rows.length) {
      throw new ClientError('User not found');
    }
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
        SET password = $1, updated_at = NOW(), updated_by = $2
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
      throw new AuthenticationError("Kredensial tidak valid.");
    }

    const { id, password: hashedPassword, is_verified } = result.rows[0];
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordMatch) {
      throw new AuthenticationError("Kredensial tidak valid.");
    }

    if (!is_verified) {
      throw new AuthorizationError("Verifikasi email anda terlebih dahulu untuk mengaktifkan akun.");
    }

    return id;
  }

  async updateUser(userId, { email, phoneNumber, password, updatedBy }, client) {
    const currentUserQuery = {
      text: `SELECT email FROM "user" WHERE id = $1 AND deleted_at IS NULL`,
      values: [userId],
    };
    const currentUserResult = await client.query(currentUserQuery);

    if (!currentUserResult.rows.length) {
      throw new NotFoundError("User tidak ditemukan.");
    }

    const currentUser = currentUserResult.rows[0];

    const values = [];
    const setClauses = [];
    let idx = 1;

    let isEmailUpdated = false;

    if (email !== undefined && email !== null) {
      values.push(email);
      setClauses.push(`email = $${idx}`);
      if (email !== currentUser.email) {
        isEmailUpdated = true;
        setClauses.push(`is_verified = false`);
        setClauses.push(`verified_at = NULL`);
      }
      idx++;
    }

    if (phoneNumber !== undefined) {
      values.push(phoneNumber);
      setClauses.push(`phone_number = $${idx}`);
      idx++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      values.push(hashedPassword);
      setClauses.push(`password = $${idx}`);
      idx++;
    }

    values.push(updatedBy);
    setClauses.push(`updated_by = $${idx}`);
    idx++;

    values.push(userId);
    const userIdIdx = idx;

    const query = {
      text: `
        UPDATE "user"
        SET ${setClauses.join(", ")},
            updated_at = NOW()
        WHERE id = $${userIdIdx}
        RETURNING id, email, phone_number, is_verified
      `,
      values,
    };

    const result = await client.query(query);
    return {
      ...result.rows[0],
      emailUpdated: isEmailUpdated,
    };
  }

  async deleteUser(client, userId, deletedBy) {
    // Soft delete user
    const queryUser = {
      text: `UPDATE "user"
               SET deleted_at = NOW(), deleted_by = $1
               WHERE id = $2 AND deleted_at IS NULL`,
      values: [deletedBy, userId],
    };

    const result = await client.query(queryUser);
    if (!result.rowCount) {
      throw new NotFoundError("User tidak ditemukan atau sudah dihapus");
    }

    // Soft delete role_user
    const queryRoleUser = {
      text: `UPDATE role_user
               SET deleted_at = NOW(), deleted_by = $1
               WHERE user_id = $2 AND deleted_at IS NULL`,
      values: [deletedBy, userId],
    };

    await client.query(queryRoleUser);
  }

  async restoreUser(client, id, restored_by) {
    const checkQuery = {
      text: `SELECT id FROM "user" WHERE id = $1 AND deleted_at IS NOT NULL`,
      values: [id],
    };

    const checkResult = await this._pool.query(checkQuery);

    if (!checkResult.rows.length) {
      throw new NotFoundError("User not found or not deleted.");
    }

    // Restore user
    const restoreUserQuery = {
      text: `UPDATE "user"
         SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW(), restored_at = NOW(), restored_by = $2
         WHERE id = $1 AND deleted_at IS NOT NULL
         RETURNING *`,
      values: [id, restored_by],
    };

    await client.query(restoreUserQuery);

    // Restore associated role_user entries
    const restoreRoleUserQuery = {
      text: `UPDATE role_user
           SET deleted_at = NULL, deleted_by = NULL, restored_at = NOW(), restored_by = $2
           WHERE user_id = $1 AND deleted_at IS NOT NULL`,
      values: [id, restored_by],
    };

    await client.query(restoreRoleUserQuery);

    return { message: "User and associated roles successfully restored." };
  }

}

module.exports = UserService;