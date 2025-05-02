const routes = (handler) => [
    {
        method: 'POST',
        path: '/catatan-konseling',
        handler: handler.createCatatanKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/catatan-konseling',
        handler: handler.getAllCatatanKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/catatan-konseling/konseling/{konseling_id}',
        handler: handler.getByKonselingIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/catatan-konseling/{id}',
        handler: handler.getCatatanKonselingByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'PUT',
        path: '/catatan-konseling/{id}',
        handler: handler.updateCatatanKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'DELETE',
        path: '/catatan-konseling/{id}',
        handler: handler.deleteCatatanKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
];

module.exports = routes;
