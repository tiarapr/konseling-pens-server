const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
    {
        method: 'POST',
        path: '/catatan-konseling',
        handler: handler.createCatatanKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('manage_catatan_konselings') },
            ],
        },
    },
    {
        method: 'GET',
        path: '/catatan-konseling',
        handler: handler.getAllCatatanKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('manage_catatan_konselings') },
            ],
        },
    },
    {
        method: 'GET',
        path: '/catatan-konseling/konseling/{konseling_id}',
        handler: handler.getByKonselingIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('manage_catatan_konselings') },
            ],
        },
    },
    {
        method: 'GET',
        path: '/catatan-konseling/own/konseling/{konseling_id}',
        handler: handler.getOwnCatatanKonselingByKonselingIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/catatan-konseling/own/{id}',
        handler: handler.getOwnCatatanKonselingByIdHandler,
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
            pre: [
                { method: checkPermission('manage_catatan_konselings') },
            ],
        },
    },
    {
        method: 'PUT',
        path: '/catatan-konseling/{id}',
        handler: handler.updateCatatanKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('manage_catatan_konselings') },
            ],
        },
    },
    {
        method: 'DELETE',
        path: '/catatan-konseling/{id}',
        handler: handler.deleteCatatanKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('manage_catatan_konselings') },
            ],
        },
    },
];

module.exports = routes;
