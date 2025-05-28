const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
    {
        method: 'POST',
        path: '/konseling',
        handler: handler.postKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('create_konseling', 'manage_konselings') }
            ]
        },
    },
    {
        method: 'GET',
        path: '/konseling',
        handler: handler.getAllKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('view_all_konseling', 'manage_konselings') }
            ]
        },
    },
    {
        method: 'GET',
        path: '/konseling/{id}',
        handler: handler.getKonselingByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('view_konseling_by_id', 'manage_konselings') }
            ]
        },
    },
    {
        method: 'GET',
        path: '/konseling/me',
        handler: handler.getMyKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('view_own_konseling') }
            ]
        },
    },
    {
        method: 'PUT',
        path: '/konseling/{id}',
        handler: handler.updateKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('update_konseling', 'manage_konselings') }
            ]
        },
    },
    {
        method: 'PATCH',
        path: '/konseling/{id}/status',
        handler: handler.updateStatusKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('update_status_konseling', 'manage_konselings') }
            ]
        },
    },
    {
        method: 'PATCH',
        path: '/konseling/{id}/konfirmasi-kehadiran',
        handler: handler.konfirmasiKehadiranHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('confirm_kehadiran_konseling', 'manage_konselings') }
            ]
        },
    },
    {
        method: 'DELETE',
        path: '/konseling/{id}',
        handler: handler.deleteKonselingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('delete_konseling', 'manage_konselings') }
            ]
        },
    },
];

module.exports = routes;
