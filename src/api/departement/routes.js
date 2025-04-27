const routes = (handler) => [
    {
        method: 'GET',
        path: '/departement',
        handler: handler.getDepartementsHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/departement/{id}',
        handler: handler.getDepartementByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'POST',
        path: '/departement',
        handler: handler.postDepartementHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'PATCH',
        path: '/departement/{id}',
        handler: handler.updateDepartementHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'DELETE',
        path: '/departement/{id}',
        handler: handler.deleteDepartementHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
];

module.exports = routes;
