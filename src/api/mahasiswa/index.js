const MahasiswaHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'mahasiswa',
    version: '1.0.0',
    register: async (server, { service, statusVerifikasiService, userService, fileStorageService, validator, emailVerificationService, mailSender }) => {
        const handler = new MahasiswaHandler(service, statusVerifikasiService, userService, fileStorageService, validator, emailVerificationService, mailSender);
        server.route(routes(handler));
    },
};
