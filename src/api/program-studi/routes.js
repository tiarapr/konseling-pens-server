const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
    {
        method: 'GET',
        path: '/program-studi',
        handler: handler.getAllProgramStudiHandler,
        options: {
            auth: 'basic'
        },
    },
    {
        method: 'GET',
        path: '/program-studi/{id}',
        handler: handler.getProgramStudiByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('view_program_studi_by_id', 'manage_program_studis') }
            ]
        },
    },
    {
        method: 'GET',
        path: '/program-studi/departement/{departementId}',
        handler: handler.getProgramStudiByDepartementHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('view_program_studi_by_departement_id', 'manage_program_studis') }
            ]
        },
    },
    {
        method: 'POST',
        path: '/program-studi',
        handler: handler.postProgramStudiHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('create_program_studi', 'manage_program_studis') }
            ]
        },
    },
    {
        method: 'PATCH',
        path: '/program-studi/{id}',
        handler: handler.updateProgramStudiHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('update_program_studi', 'manage_program_studis') }
            ]
        },
    },
    {
        method: 'DELETE',
        path: '/program-studi/{id}',
        handler: handler.deleteProgramStudiHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('delete_program_studi', 'manage_program_studis') }
            ]
        },
    },
];

module.exports = routes;
