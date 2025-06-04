const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class RolePermissionService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async verifyPermissionAssignment(roleId, permissionId) {
    const roleQuery = {
      text: 'SELECT 1 FROM role WHERE id = $1',
      values: [roleId],
    };
    const roleResult = await this._pool.query(roleQuery);
    if (!roleResult.rows.length) {
      throw new NotFoundError('Role not found');
    }

    const permQuery = {
      text: 'SELECT 1 FROM permission WHERE id = $1 AND deleted_at IS NULL',
      values: [permissionId],
    };
    const permResult = await this._pool.query(permQuery);
    if (!permResult.rows.length) {
      throw new NotFoundError('Permission not found');
    }
  }

  async assignPermission({ roleId, permissionId, created_by }) {
    await this.verifyPermissionAssignment(roleId, permissionId);

    const checkQuery = {
      text: `SELECT 1 FROM role_permission 
             WHERE role_id = $1 AND permission_id = $2 AND deleted_at IS NULL`,
      values: [roleId, permissionId],
    };
    const checkResult = await this._pool.query(checkQuery);
    if (checkResult.rows.length > 0) {
      throw new InvariantError('Permission already assigned to this role');
    }

    const insertQuery = {
      text: `INSERT INTO role_permission (role_id, permission_id, created_by)
             VALUES ($1, $2, $3)
             RETURNING *`,
      values: [roleId, permissionId, created_by],
    };

    const result = await this._pool.query(insertQuery);
    return result.rows[0];
  }

  async getAll() {
    const query = {
      text: `SELECT rp.id, r.name AS role_name, p.name AS permission_name, 
                rp.created_at, rp.created_by,
                rp.deleted_at, rp.deleted_by
         FROM role_permission rp
         JOIN role r ON rp.role_id = r.id
         JOIN permission p ON rp.permission_id = p.id
         WHERE rp.deleted_at IS NULL`,
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getById(id) {
    const query = {
      text: `SELECT rp.id, rp.role_id, rp.permission_id, 
                    r.name AS role_name, p.name AS permission_name,
                    rp.created_at, rp.created_by
             FROM role_permission rp
             JOIN role r ON rp.role_id = r.id
             JOIN permission p ON rp.permission_id = p.id
             WHERE rp.id = $1 AND rp.deleted_at IS NULL`,
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Role permission assignment not found');
    }
    return result.rows[0];
  }

  async getPermissionsByRoleId(roleId) {
    const query = {
      text: `
        SELECT p.id, p.name
        FROM role_permission rp
        JOIN permission p ON rp.permission_id = p.id
        WHERE rp.role_id = $1
          AND rp.deleted_at IS NULL
          AND p.deleted_at IS NULL
      `,
      values: [roleId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError(`Permissions for role ID ${roleId} not found`);
    }
    return result.rows; // array of permissions with {id, name}
  }

  async getRolePermissionsByRoleName(roleName) {
    const query = {
      text: `
        SELECT p.id, p.name
        FROM role_permission rp
        JOIN role r ON rp.role_id = r.id
        JOIN permission p ON rp.permission_id = p.id
        WHERE r.name = $1
          AND rp.deleted_at IS NULL
          AND p.deleted_at IS NULL
      `,
      values: [roleName],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError(`Permissions for role "${roleName}" not found`);
    }
    return result.rows; // array of permissions with {id, name}
  }

  async getPermissionsByNames(names) {
    const query = {
      text: `SELECT id, name FROM permission WHERE name = ANY($1::text[])`,
      values: [names],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getAllRoleWithPermissions() {
    const query = {
      text: `
      SELECT 
        r.id AS role_id,
        r.name AS role_name,
        json_agg(json_build_object(
          'id', rp.id,
          'permission_id', p.id,
          'permission_name', p.name
        ) ORDER BY p.name) AS permissions
      FROM role r
      LEFT JOIN role_permission rp ON r.id = rp.role_id AND rp.deleted_at IS NULL
      LEFT JOIN permission p ON rp.permission_id = p.id AND p.deleted_at IS NULL
      GROUP BY r.id, r.name
      ORDER BY r.name
    `
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async revokePermission({ roleId, permissionId, userId }) {
    await this.verifyPermissionAssignment(roleId, permissionId);

    const query = {
      text: `UPDATE role_permission
             SET deleted_at = NOW(),
                 deleted_by = $3
             WHERE role_id = $1 AND permission_id = $2 AND deleted_at IS NULL
             RETURNING *`,
      values: [roleId, permissionId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Permission assignment not found');
    }
    return result.rows[0];
  }

  async verifyUserPermission(userId, permissionName) {
    const query = {
      text: `SELECT 1 FROM "user" u
             JOIN user_role ur ON u.id = ur.user_id
             JOIN role_permission rp ON ur.role_id = rp.role_id
             JOIN permission p ON rp.permission_id = p.id
             WHERE u.id = $1 AND p.name = $2 
             AND ur.deleted_at IS NULL AND rp.deleted_at IS NULL`,
      values: [userId, permissionName],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthorizationError('You don\'t have permission to perform this action');
    }
  }
}

module.exports = RolePermissionService;
