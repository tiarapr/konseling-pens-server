const routes = (handler) => [
    {
        method: 'GET',
        path: '/konseling',
        handler: handler.getAllKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/konseling/{id}',
        handler: handler.getKonselingByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'POST',
        path: '/konseling',
        handler: handler.postKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'PUT',
        path: '/konseling/{id}',
        handler: handler.updateKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'PATCH',
        path: '/konseling/{id}/status',
        handler: handler.updateStatusKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'PATCH',
        path: '/konseling/{id}/konfirmasi-kehadiran',
        handler: handler.konfirmasiKehadiranHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'DELETE',
        path: '/konseling/{id}',
        handler: handler.deleteKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
];

module.exports = routes;
