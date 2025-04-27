const routes = (handler) => [
    {
        method: "POST",
        path: "/konselor-profil",
        handler: handler.postKonselorProfilHandler,
        options: {
            auth: "basicAndJwtStrategy",
        },
    },
    {
        method: "GET",
        path: "/konselor-profil",
        handler: handler.getKonselorProfilHandler,
        options: {
            auth: "basicAndJwtStrategy",
        },
    },
    {
        method: "GET",
        path: "/konselor-profil/{id}",
        handler: handler.getKonselorProfilByIdHandler,
        options: {
            auth: "basicAndJwtStrategy",
        },
    },
    {
        method: "GET",
        path: "/konselor-profil/user/{userId}",
        handler: handler.getKonselorProfilByUserIdHandler,
        options: {
            auth: "basicAndJwtStrategy",
        },
    },
    {
        method: "PATCH",
        path: "/konselor-profil/{id}",
        handler: handler.updateKonselorProfilHandler,
        options: {
            auth: "basicAndJwtStrategy",
        },
    },
    {
        method: "DELETE",
        path: "/konselor-profil/{id}",
        handler: handler.deleteKonselorProfilHandler,
        options: {
            auth: "basicAndJwtStrategy",
        },
    },
];

module.exports = routes;
