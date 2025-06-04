const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
    {
        method: 'GET',
        path: '/status-verifikasi',
        handler: handler.getAllStatusVerifikasiHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            // pre: [
            //     { method: checkPermission(['view_all_status_verifikasi', 'manage_status_verifikasi']) }
            // ]
        },
    },
    {
        method: 'GET',
        path: '/status-verifikasi/{id}',
        handler: handler.getStatusVerifikasiByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['view_status_verifikasi_by_id', 'manage_status_verifikasi']) }
            ]
        },
    },
    {
        method: 'POST',
        path: '/status-verifikasi',
        handler: handler.postStatusVerifikasiHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['create_status_verifikasi', 'manage_status_verifikasi']) }
            ]
        },
    },
    {
        method: 'PATCH',
        path: '/status-verifikasi/{id}',
        handler: handler.updateStatusVerifikasiHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['update_status_verifikasi', 'manage_status_verifikasi']) }
            ]
        },
    },
    {
        method: 'DELETE',
        path: '/status-verifikasi/{id}',
        handler: handler.deleteStatusVerifikasiHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['delete_status_verifikasi', 'manage_status_verifikasi']) }
            ]
        },
    },
];

module.exports = routes;
