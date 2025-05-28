const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
    {
        method: "POST",
        path: "/rating",
        handler: handler.addRatingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('create_rating') }
            ]
        },
    },
    {
        method: "GET",
        path: "/rating",
        handler: handler.getAllRatingsHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['view_all_rating', 'manage_ratings']) }
            ]
        },
    },
    {
        method: "GET",
        path: "/rating/{id}",
        handler: handler.getRatingByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['view_rating_by_id', 'manage_ratings']) }
            ]
        },
    },
    {
        method: "GET",
        path: "/rating/konseling/{konselingId}",
        handler: handler.getRatingByKonselingIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['view_rating_by_konseling_id', 'manage_ratings']) }
            ]
        },
    },
    {
        method: "PATCH",
        path: "/rating/{id}",
        handler: handler.updateRatingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('update_rating') }
            ]
        },
    },
];

module.exports = routes;
