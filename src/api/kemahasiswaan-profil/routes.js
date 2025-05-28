const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
    {
        method: 'GET',
        path: '/kemahasiswaan-profil',
        handler: handler.getKemahasiswaanProfilHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['view_all_kemahasiswaan_profil', 'manage_kemahasiswaans']) }
            ]
        },
    },
    {
        method: 'GET',
        path: '/kemahasiswaan-profil/{id}',
        handler: handler.getKemahasiswaanProfilByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['view_kemahasiswaan_profil_by_id', 'manage_kemahasiswaans']) }
            ]
        },
    },
    {
        method: 'GET',
        path: '/kemahasiswaan-profil/user/{userId}',
        handler: handler.getKemahasiswaanProfilByUserIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['view_kemahasiswaan_profil_by_user_id', 'manage_kemahasiswaans']) }
            ]
        },
    },
    {
        method: 'POST',
        path: '/kemahasiswaan',
        handler: handler.createKemahasiswaanAccountHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['create_kemahasiswaan_account', 'manage_kemahasiswaans']) }
            ]
        },
    },
    {
        method: 'POST',
        path: '/kemahasiswaan-profil',
        handler: handler.postKemahasiswaanProfilHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['create_kemahasiswaan_profil', 'manage_kemahasiswaans']) }
            ]
        },
    },
    {
        method: 'POST',
        path: '/kemahasiswaan-profil/{id}/photo',
        handler: handler.uploadKemahasiswaanPhotoHandler,
        options: {
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 2 * 1024 * 1024, // 2 MB max
            },
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['update_kemahasiswaan_profil', 'manage_kemahasiswaans']) }
            ]
        },
    },
    {
        method: 'PATCH',
        path: '/kemahasiswaan-profil/{id}',
        handler: handler.updateKemahasiswaanProfilHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['update_kemahasiswaan_profil', 'manage_kemahasiswaans']) }
            ]
        },
    },
    {
        method: 'DELETE',
        path: '/kemahasiswaan-profil/{id}',
        handler: handler.deleteKemahasiswaanProfilHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['delete_kemahasiswaan_profil', 'manage_kemahasiswaans']) }
            ]
        },
    },
    //restore
    {
        method: 'PUT',
        path: '/kemahasiswaan-profil/{id}/restore',
        handler: handler.restoreKemahasiswaanProfilHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['restore_kemahasiswaan_profil', 'manage_kemahasiswaans']) }
            ]
        },
    },
];

module.exports = routes;
