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
        },
    },
    {
        method: 'POST',
        path: '/status',
        handler: handler.postStatusHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'PATCH',
        path: '/status/{id}',
        handler: handler.updateStatusHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'DELETE',
        path: '/status/{id}',
        handler: handler.deleteStatusHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
];

module.exports = routes;
