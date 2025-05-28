const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
    {
        method: 'POST',
        path: '/mahasiswa',
        handler: handler.postMahasiswaHandler,
        options: {
            auth: 'basic',
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream', // penting untuk file
                parse: true,
                maxBytes: 10 * 1024 * 1024, // max 10MB
            },
        },
    },
    {
        method: 'GET',
        path: '/mahasiswa',
        handler: handler.getAllMahasiswaHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['view_all_mahasiswa', 'manage_mahasiswas']) }
            ]
        },
    },
    {
        method: 'GET',
        path: '/mahasiswa/me',
        handler: handler.getOwnMahasiswaHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['view_own_mahasiswa']) }
            ]
        },
    },
    {
        method: 'GET',
        path: '/mahasiswa/{id}',
        handler: handler.getMahasiswaByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['view_mahasiswa_by_id', 'manage_mahasiswas']) }
            ]
        },
    },
    {
        method: 'GET',
        path: '/mahasiswa/nrp/{nrp}',
        handler: handler.getMahasiswaByNrpHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission(['view_mahasiswa_by_nrp', 'manage_mahasiswas']) }
            ]
        },
    },
    {
        method: 'PUT',
        path: '/mahasiswa/{id}/verifikasi',
        handler: handler.verifyMahasiswaHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('verify_mahasiswa', 'manage_mahasiswas') }
            ]
        },
    },
    {
        method: 'PUT',
        path: '/mahasiswa/{id}/verifikasi-ulang',
        handler: handler.requestReVerificationHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                parse: true,
                maxBytes: 10 * 1024 * 1024, // max 10MB
            },
            pre: [
                { method: checkPermission('reverify_mahasiswa') }
            ]
        },
    },
    {
        method: 'PUT',
        path: '/mahasiswa/{id}',
        handler: handler.updateMahasiswaHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                parse: true,
                maxBytes: 10 * 1024 * 1024, // max 10MB
            },
            pre: [
                { method: checkPermission('update_mahasiswa') }
            ]
        },
    },
    {
        method: 'DELETE',
        path: '/mahasiswa/{id}',
        handler: handler.deleteMahasiswaHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            pre: [
                { method: checkPermission('delete_mahasiswa', 'manage_mahasiswas') }
            ]
        },
    },
    // {
    //     method: 'POST',
    //     path: '/mahasiswa/upload-ktm',
    //     handler: handler.uploadKtmHandler,
    //     options: {
    //         auth: 'basicAndJwtStrategy',
    //         payload: {
    //             maxBytes: 10 * 1024 * 1024, // Max size 10MB
    //             output: 'stream',
    //             parse: true,
    //             allow: 'multipart/form-data',
    //         },
    //     },
    // },
    // {
    //     method: 'GET',
    //     path: '/mahasiswa/{nrp}/rekammedis',
    //     handler: handler.getRekamMedisByNrpHandler,
    //     options: {
    //         auth: 'basicAndJwtStrategy',
    // pre: [
    //     { method: checkPermission('view_rekam_medis_mahasiswa') }
    // ]
    //     },
    // }
];

module.exports = routes;
