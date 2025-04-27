const routes = (handler) => [
    {
        method: 'POST',
        path: '/janji-temu',
        handler: handler.createJanjiTemuHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'PUT',
        path: '/janji-temu/{id}/status',
        handler: handler.updateStatusJanjiTemuHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'DELETE',
        path: '/janji-temu/{id}',
        handler: handler.deleteJanjiTemuHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
];

module.exports = routes;
