const routes = (handler) => [
    {
        method: 'GET',
        path: '/program-studi',
        handler: handler.getAllProgramStudiHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/program-studi/{id}',
        handler: handler.getProgramStudiByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/program-studi/departement/{departementId}',
        handler: handler.getProgramStudiByDepartementHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'POST',
        path: '/program-studi',
        handler: handler.postProgramStudiHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'PATCH',
        path: '/program-studi/{id}',
        handler: handler.updateProgramStudiHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'DELETE',
        path: '/program-studi/{id}',
        handler: handler.deleteProgramStudiHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
];

module.exports = routes;
