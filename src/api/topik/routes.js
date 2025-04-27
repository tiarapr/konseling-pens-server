const routes = (handler) => [
    {
        method: 'POST',
        path: '/topik',
        handler: handler.createTopikHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/topik',
        handler: handler.getAllTopikHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/topik/{id}',
        handler: handler.getTopikByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'PUT',
        path: '/topik/{id}',
        handler: handler.updateTopikHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'DELETE',
        path: '/topik/{id}',
        handler: handler.deleteTopikHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
];

module.exports = routes;
