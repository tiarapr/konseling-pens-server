const ClientError = require('../../exceptions/ClientError');

class RolePermissionHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.getRolePermissionsHandler = this.getRolePermissionsHandler.bind(this);
        this.getRolePermissionByIdHandler = this.getRolePermissionByIdHandler.bind(this);
        this.postRolePermissionHandler = this.postRolePermissionHandler.bind(this);
        this.deleteRolePermissionHandler = this.deleteRolePermissionHandler.bind(this);
        this.getPermissionsByRoleHandler = this.getPermissionsByRoleHandler.bind(this);
        this.getRolesByPermissionHandler = this.getRolesByPermissionHandler.bind(this);
    }

    async getRolePermissionsHandler(request, h) {
        try {
            const rolePermissions = await this._service.getAll();
            return {
                status: 'success',
                data: {
                    rolePermissions,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getRolePermissionByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const rolePermission = await this._service.getById(id);
            return {
                status: 'success',
                data: {
                    rolePermission,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async postRolePermissionHandler(request, h) {
        try {
            this._validator.validateRolePermissionPayload(request.payload);
            const { role_id, permission_id, created_by } = request.payload;

            // Verify permission assignment first
            await this._service.verifyPermissionAssignment(role_id, permission_id);

            const rolePermission = await this._service.assignPermission({
                roleId: role_id,
                permissionId: permission_id,
                userId: created_by
            });

            const response = h.response({
                status: 'success',
                message: 'Role permission berhasil ditambahkan',
                data: {
                    rolePermission,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async deleteRolePermissionHandler(request, h) {
        try {
            const { id } = request.params;
            const { deleted_by } = request.payload;

            // First get the role permission to get role_id and permission_id
            const rolePermission = await this._service.getById(id);

            const result = await this._service.revokePermission({
                roleId: rolePermission.role_id,
                permissionId: rolePermission.permission_id,
                userId: deleted_by
            });

            return {
                status: 'success',
                message: 'Role permission berhasil dihapus',
                data: {
                    rolePermission: result,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getPermissionsByRoleHandler(request, h) {
        try {
            const { roleId } = request.params;
            const permissions = await this._service.getRolePermissions(roleId);

            return {
                status: 'success',
                data: {
                    permissions,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getRolesByPermissionHandler(request, h) {
        try {
            const { permissionId } = request.params;
            const roles = await this._service.getPermissionRoles(permissionId);

            return {
                status: 'success',
                data: {
                    roles,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    _handleError(h, error) {
        if (error instanceof ClientError) {
            const response = h.response({
                status: 'fail',
                message: error.message,
            });
            response.code(error.statusCode);
            return response;
        }

        // Handle specific service errors
        if (error.message.includes('already assigned')) {
            const response = h.response({
                status: 'fail',
                message: error.message,
            });
            response.code(409); // Conflict
            return response;
        }

        if (error.message.includes('not found')) {
            const response = h.response({
                status: 'fail',
                message: error.message,
            });
            response.code(404);
            return response;
        }

        return this._handleServerError(h, error);
    }

    _handleServerError(h, error) {
        console.error(error);
        const response = h.response({
            status: 'error',
            message: 'Sorry, there was an error on the server.',
        });
        response.code(500);
        return response;
    }
}

module.exports = RolePermissionHandler;