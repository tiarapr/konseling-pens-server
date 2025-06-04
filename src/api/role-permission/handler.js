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
        this.getAllRoleWithPermissionsHandler = this.getAllRoleWithPermissionsHandler.bind(this);
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
            console.log('Received payload:', request.payload);

            this._validator.validateRolePermissionPayload(request.payload);

            const createdBy = request.auth.credentials.jwt.user.id;
            const { role_id, permission_names } = request.payload;

            console.log('permission_names:', permission_names, 'type:', typeof permission_names);

            if (!Array.isArray(permission_names)) {
                throw new ClientError('permission_names harus berupa array string');
            }

            // pastikan semua elemen permission_names adalah string
            const allStrings = permission_names.every(p => typeof p === 'string');
            if (!allStrings) {
                throw new ClientError('Semua elemen permission_names harus string');
            }

            const permissions = await this._service.getPermissionsByNames(permission_names);

            const foundNames = permissions.map(p => p.name);
            const notFound = permission_names.filter(name => !foundNames.includes(name));
            if (notFound.length > 0) {
                throw new ClientError(`Permission tidak ditemukan: ${notFound.join(', ')}`);
            }

            const results = [];

            for (const permission of permissions) {
                const result = await this._service.assignPermission({
                    roleId: role_id,
                    permissionId: permission.id,
                    created_by: createdBy
                });
                results.push(result);
            }

            const response = h.response({
                status: 'success',
                message: 'Permissions berhasil ditambahkan',
                data: {
                    rolePermissions: results,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getPermissionsByRoleHandler(request, h) {
        try {
            const { roleId } = request.params;
            const permissions = await this._service.getPermissionsByRoleId(roleId);

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

    async getAllRoleWithPermissionsHandler(request, h) {
        try {
            const rolesWithPermissions = await this._service.getAllRoleWithPermissions();
            return {
                status: 'success',
                data: {
                    rolesWithPermissions,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async deleteRolePermissionHandler(request, h) {
        try {
            const { id } = request.params;

            const deletedBy = request.auth.credentials.jwt.user.id;

            // First get the role permission to get role_id and permission_id
            const rolePermission = await this._service.getById(id);

            const result = await this._service.revokePermission({
                roleId: rolePermission.role_id,
                permissionId: rolePermission.permission_id,
                userId: deletedBy
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