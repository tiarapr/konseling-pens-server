const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
    {
        method: 'POST',
        path: '/konselor',
        handler: handler.createKonselorAccountHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['create_konselor_account', 'manage_konselors']) }
            ]
        },
    },
    {
        method: "POST",
        path: "/konselor-profil",
        handler: handler.postKonselorProfilHandler,
        options: {
            auth: "basicAndJwtStrategy",
            pre: [
                { method: checkPermission(['create_konselor_profil', 'manage_konselors']) }
            ]
        },
    },
    {
        method: 'POST',
        path: '/konselor-profil/{id}/photo',
        handler: handler.uploadKonselorPhotoHandler,
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
                { method: checkPermission(['update_konselor_profil', 'manage_konselors']) }
            ]
        },
    },
    {
        method: "GET",
        path: "/konselor-profil",
        handler: handler.getKonselorProfilHandler,
        options: {
            auth: "basicAndJwtStrategy",
            pre: [
                { method: checkPermission(['view_all_konselor_profil', 'manage_konselors']) }
            ]
        },
    },
    {
        method: "GET",
        path: "/konselor-profil/{id}",
        handler: handler.getKonselorProfilByIdHandler,
        options: {
            auth: "basicAndJwtStrategy",
            pre: [
                { method: checkPermission(['view_konselor_profil_by_id', 'manage_konselors']) }
            ]
        },
    },
    {
        method: "GET",
        path: "/konselor-profil/user/{userId}",
        handler: handler.getKonselorProfilByUserIdHandler,
        options: {
            auth: "basicAndJwtStrategy",
            pre: [
                { method: checkPermission(['view_konselor_profil_by_user_id', 'manage_konselors']) }
            ]
        },
    },
    {
        method: "PATCH",
        path: "/konselor-profil/{id}",
        handler: handler.updateKonselorProfilHandler,
        options: {
            auth: "basicAndJwtStrategy",
            pre: [
                { method: checkPermission(['update_konselor_profil', 'manage_konselors']) }
            ]
        },
    },
    {
        method: "DELETE",
        path: "/konselor-profil/{id}",
        handler: handler.deleteKonselorProfilHandler,
        options: {
            auth: "basicAndJwtStrategy",
            pre: [
                { method: checkPermission(['delete_konselor_profil', 'manage_konselors']) }
            ]
        },
    },
    {
        method: "PUT",
        path: "/konselor-profil/{id}/restore",
        handler: handler.restoreKonselorProfilHandler,
        options: {
            auth: "basicAndJwtStrategy",
            pre: [
                { method: checkPermission(['restore_konselor_profil', 'manage_konselors']) }
            ]
        },
    },
];

module.exports = routes;
