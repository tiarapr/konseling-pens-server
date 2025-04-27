const routes = (handler) => [
    {
        method: 'POST',
        path: '/role-permissions',
        handler: handler.postRolePermissionHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/role-permissions',
        handler: handler.getRolePermissionsHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/role-permissions/{id}',
        handler: handler.getRolePermissionByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/roles/{roleId}/permissions',
        handler: handler.getPermissionsByRoleHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/permissions/{permissionId}/roles',
        handler: handler.getRolesByPermissionHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'DELETE',
        path: '/role-permissions/{id}',
        handler: handler.deleteRolePermissionHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
];

module.exports = routes;
