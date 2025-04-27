const routes = (handler) => [
    {
        method: 'GET',
        path: '/tipe-status',
        handler: handler.getAllTipeStatusHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/tipe-status/{id}',
        handler: handler.getTipeStatusByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'POST',
        path: '/tipe-status',
        handler: handler.postTipeStatusHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'PATCH',
        path: '/tipe-status/{id}',
        handler: handler.updateTipeStatusHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'DELETE',
        path: '/tipe-status/{id}',
        handler: handler.deleteTipeStatusHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
];

module.exports = routes;
