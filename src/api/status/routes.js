const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
    {
        method: 'GET',
        path: '/status',
        handler: handler.getAllStatusHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/status/{id}',
        handler: handler.getStatusByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['view_status_by_id', 'manage_status']) }
            ]
        },
    },
    {
        method: 'POST',
        path: '/status',
        handler: handler.postStatusHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['create_status', 'manage_status']) }
            ]
        },
    },
    {
        method: 'PATCH',
        path: '/status/{id}',
        handler: handler.updateStatusHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['update_status', 'manage_status']) }
            ]
        },
    },
    {
        method: 'DELETE',
        path: '/status/{id}',
        handler: handler.deleteStatusHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['delete_status', 'manage_status']) }
            ]
        },
    },
];

module.exports = routes;
