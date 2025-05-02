const routes = (handler) => [
    {
        method: 'GET',
        path: '/mahasiswa',
        handler: handler.getAllMahasiswaHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/mahasiswa/{id}',
        handler: handler.getMahasiswaByIdHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/mahasiswa/nrp/{nrp}',
        handler: handler.getMahasiswaByNrpHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
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
        method: 'PUT',
        path: '/mahasiswa/{id}',
        handler: handler.updateMahasiswaHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                parse: true,
                maxBytes: 10 * 1024 * 1024, // max 10MB
            },
        },
    },
    {
        method: 'DELETE',
        path: '/mahasiswa/{id}',
        handler: handler.deleteMahasiswaHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'POST',
        path: '/mahasiswa/upload-ktm',
        handler: handler.uploadKtmHandler,
        options: {
            auth: 'basicAndJwtStrategy',
            payload: {
                maxBytes: 10 * 1024 * 1024, // Max size 10MB
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
            },
        },
    },
    {
        method: 'GET',
        path: '/mahasiswa/{nrp}/rekammedis',
        handler: handler.getRekamMedisByNrpHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    }
];

module.exports = routes;
