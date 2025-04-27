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
        method: 'POST',
        path: '/mahasiswa',
        handler: handler.postMahasiswaHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'PUT',
        path: '/mahasiswa/{id}',
        handler: handler.updateMahasiswaHandler,
        options: {
            auth: 'basicAndJwtStrategy',
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
];

module.exports = routes;
