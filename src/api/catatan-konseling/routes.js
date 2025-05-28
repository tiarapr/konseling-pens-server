const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
    {
        method: 'POST',
        path: '/catatan-konseling',
        handler: handler.createCatatanKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('manage_catatan_konselings') }
            ]
        },
    },
    {
        method: 'GET',
        path: '/catatan-konseling',
        handler: handler.getAllCatatanKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('view_all_catatan_konseling', 'manage_catatan_konselings') }
            ]
        },
    },
    {
        method: 'GET',
        path: '/catatan-konseling/konseling/{konseling_id}',
        handler: handler.getByKonselingIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('view_catatan_konseling_by_konseling_id', 'manage_catatan_konselings') }
            ]
        },
    },
    {
        method: 'GET',
        path: '/catatan-konseling/{id}',
        handler: handler.getCatatanKonselingByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('view_catatan_konseling_by_id', 'manage_catatan_konselings') }
            ]
        },
    },
    {
        method: 'PUT',
        path: '/catatan-konseling/{id}',
        handler: handler.updateCatatanKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('update_catatan_konseling', 'manage_catatan_konselings') }
            ]
        },
    },
    {
        method: 'DELETE',
        path: '/catatan-konseling/{id}',
        handler: handler.deleteCatatanKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('delete_catatan_konseling', 'manage_catatan_konselings') }
            ]
        },
    },
];

module.exports = routes;
