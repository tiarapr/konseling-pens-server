const checkPermission = require('../../middleware/checkPermission');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/role-permissions',
        handler: handler.postRolePermissionHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('manage_role_permissions') }
            ]
        }
    },
    {
        method: 'GET',
        path: '/role-permissions',
        handler: handler.getRolePermissionsHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('manage_role_permissions') }
            ]
        },
    },
    {
        method: 'GET',
        path: '/role-permissions/{id}',
        handler: handler.getRolePermissionByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('manage_role_permissions') }
            ]
        },
    },
    {
        method: 'GET',
        path: '/roles/{roleId}/permissions',
        handler: handler.getPermissionsByRoleHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('manage_role_permissions') }
            ]
        },
    },
    {
        method: 'GET',
        path: '/roles-with-permissions',
        handler: handler.getAllRoleWithPermissionsHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('manage_role_permissions') }
            ]
        }
    },
    {
        method: 'DELETE',
        path: '/role-permissions/{id}',
        handler: handler.deleteRolePermissionHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('manage_role_permissions') }
            ]
        },
    },
];

module.exports = routes;
