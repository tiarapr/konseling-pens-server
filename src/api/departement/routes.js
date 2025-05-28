const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
    {
        method: 'GET',
        path: '/departement',
        handler: handler.getDepartementsHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('view_all_departement', 'manage_departements') }
            ]
        },
    },
    {
        method: 'GET',
        path: '/departement/{id}',
        handler: handler.getDepartementByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('view_departement_by_id', 'manage_departements') }
            ]
        },
    },
    {
        method: 'POST',
        path: '/departement',
        handler: handler.postDepartementHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('create_departement', 'manage_departements') }
            ]
        },
    },
    {
        method: 'PATCH',
        path: '/departement/{id}',
        handler: handler.updateDepartementHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('update_departement', 'manage_departements') }
            ]
        },
    },
    {
        method: 'DELETE',
        path: '/departement/{id}',
        handler: handler.deleteDepartementHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('delete_departement', 'manage_departements') }
            ]
        },
    },
];

module.exports = routes;
