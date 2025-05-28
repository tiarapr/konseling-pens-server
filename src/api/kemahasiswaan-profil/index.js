const KemahasiswaanProfilHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'kemahasiswaan-profil',
    version: '1.0.0',
    register: async (server, { service, userService, emailVerificationService, mailSender, fileStorageService, validator }) => {
        const handler = new KemahasiswaanProfilHandler(service, userService, emailVerificationService, mailSender, fileStorageService, validator);
        server.route(routes(handler));
    },
};
