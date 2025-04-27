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
    // Verify role exists
    const roleQuery = {
      text: 'SELECT 1 FROM roles WHERE id = $1 AND deleted_at IS NULL',
      values: [roleId],
    };
    const roleResult = await this._pool.query(roleQuery);
    if (!roleResult.rows.length) {
      throw new NotFoundError('Role not found');
    }

    // Verify permission exists
    const permQuery = {
      text: 'SELECT 1 FROM permissions WHERE id = $1 AND deleted_at IS NULL',
      values: [permissionId],
    };
    const permResult = await this._pool.query(permQuery);
    if (!permResult.rows.length) {
      throw new NotFoundError('Permission not found');
    }
  }

  async assignPermission({ roleId, permissionId, userId }) {
    await this.verifyPermissionAssignment(roleId, permissionId);

    // Check if assignment already exists
    const checkQuery = {
      text: `SELECT 1 FROM role_permission 
             WHERE role_id = $1 AND permission_id = $2 AND deleted_at IS NULL`,
      values: [roleId, permissionId],
    };
    const checkResult = await this._pool.query(checkQuery);
    if (checkResult.rows.length > 0) {
      throw new InvariantError('Permission already assigned to this role');
    }

    // Create new assignment
    const insertQuery = {
      text: `INSERT INTO role_permission (role_id, permission_id, created_by)
             VALUES ($1, $2, $3)
             RETURNING id, role_id, permission_id, created_at`,
      values: [roleId, permissionId, userId],
    };

    const result = await this._pool.query(insertQuery);
    return result.rows[0];
  }

  async revokePermission({ roleId, permissionId, userId }) {
    await this.verifyPermissionAssignment(roleId, permissionId);

    const query = {
      text: `UPDATE role_permission
             SET deleted_at = NOW(),
                 deleted_by = $3
             WHERE role_id = $1 AND permission_id = $2 AND deleted_at IS NULL
             RETURNING id`,
      values: [roleId, permissionId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Permission assignment not found');
    }
  }

  async getRolePermissions(roleId) {
    const query = {
      text: `SELECT p.id, p.name, p.description, rp.created_at as assigned_at
             FROM permissions p
             JOIN role_permission rp ON p.id = rp.permission_id
             WHERE rp.role_id = $1 AND rp.deleted_at IS NULL
             ORDER BY p.name`,
      values: [roleId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPermissionRoles(permissionId) {
    const query = {
      text: `SELECT r.id, r.name, r.description, rp.created_at as assigned_at
             FROM roles r
             JOIN role_permission rp ON r.id = rp.role_id
             WHERE rp.permission_id = $1 AND rp.deleted_at IS NULL
             ORDER BY r.name`,
      values: [permissionId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyUserPermission(userId, permissionName) {
    const query = {
      text: `SELECT 1 FROM users u
             JOIN user_role ur ON u.id = ur.user_id
             JOIN role_permission rp ON ur.role_id = rp.role_id
             JOIN permissions p ON rp.permission_id = p.id
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