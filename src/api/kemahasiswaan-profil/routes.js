const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
    // KEMAHASISWAAN ACCOUNT
    {
        method: 'POST',
        path: '/kemahasiswaan/account',
        handler: handler.createKemahasiswaanAccountHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['create_kemahasiswaan_account', 'manage_kemahasiswaans']) }
            ]
        },
    },
    {
        method: 'GET',
        path: '/kemahasiswaan/account/{userId}',
        handler: handler.getKemahasiswaanAccountByUserIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['view_kemahasiswaan_account_by_user', 'manage_kemahasiswaans']) }
            ]
        },
    },
    {
        method: 'PATCH',
        path: '/kemahasiswaan/account/{id}',
        handler: handler.updateKemahasiswaanAccountHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['update_kemahasiswaan_account', 'manage_kemahasiswaans']) }
            ]
        },
    },
    {
        method: 'DELETE',
        path: '/kemahasiswaan/account/{id}',
        handler: handler.deleteKemahasiswaanAccountHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['delete_kemahasiswaan_account', 'manage_kemahasiswaans']) }
            ]
        },
    },
    {
        method: 'PUT',
        path: '/kemahasiswaan/account/{id}/restore',
        handler: handler.restoreKemahasiswaanAccountHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['restore_kemahasiswaan_account', 'manage_kemahasiswaans']) }
            ]
        },
    },
    // KEMAHASISWAAN PROFIL
    {
        method: "GET",
        path: "/kemahasiswaan",
        handler: handler.getKemahasiswaanProfilWithAccountHandler,
        options: {
            auth: "basicAndJwtStrategy",
            pre: [
                { method: checkPermission(['view_all_kemahasiswaan', 'manage_kemahasiswaans']) }
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
        },
    },
    {
        method: "GET",
        path: '/kemahasiswaan-profil/me',
        handler: handler.getOwnKemahasiswaanProfilHandler,
        options: {
            auth: "basicAndJwtStrategy",
        }
    },
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
        method: 'PATCH',
        path: '/kemahasiswaan-profil/me/{id}',
        handler: handler.updateMyProfilHandler,
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
            pre: [
                { method: checkPermission(['update_kemahasiswaan_profil', 'manage_kemahasiswaans']) }
            ]
        },
    },
];

module.exports = routes;
