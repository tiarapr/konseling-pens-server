const routes = (handler) => [
    {
        method: 'GET',
        path: '/kemahasiswaan-profil',
        handler: handler.getKemahasiswaanProfilHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/kemahasiswaan-profil/{id}',
        handler: handler.getKemahasiswaanProfilByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/kemahasiswaan-profil/user/{userId}',
        handler: handler.getKemahasiswaanProfilByUserIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'POST',
        path: '/kemahasiswaan-profil',
        handler: handler.postKemahasiswaanProfilHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'PATCH',
        path: '/kemahasiswaan-profil/{id}',
        handler: handler.updateKemahasiswaanProfilHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'DELETE',
        path: '/kemahasiswaan-profil/{id}',
        handler: handler.deleteKemahasiswaanProfilHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
];

module.exports = routes;
