const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
    {
        method: 'POST',
        path: '/janji-temu',
        handler: handler.createJanjiTemuHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('create_janji_temu', 'manage_janji_temus') }
            ]
        },
    },
    {
        method: 'GET',
        path: '/janji-temu',
        handler: handler.getAllJanjiTemuHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('view_all_janji_temu', 'manage_janji_temus') }
            ]
        },
    },
    {
        method: 'GET',
        path: '/janji-temu/{id}',
        handler: handler.getJanjiTemuByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('view_janji_temu_by_id', 'manage_janji_temus') }
            ]
        },
    },
    {
        method: 'GET',
        path: '/janji-temu/me',
        handler: handler.getMyJanjiTemuHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            // pre: [
            //     { method: checkPermission('view_own_janji_temu') }
            // ]
        },
    },
    {
        method: 'PUT',
        path: '/janji-temu/{id}/status',
        handler: handler.updateStatusJanjiTemuHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('update_status_janji_temu', 'manage_janji_temus') }
            ]
        },
    },
    {
        method: 'DELETE',
        path: '/janji-temu/{id}',
        handler: handler.deleteJanjiTemuHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('delete_janji_temu', 'manage_janji_temus') }
            ]
        },
    },
];

module.exports = routes;
