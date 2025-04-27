const KemahasiswaanProfilHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'kemahasiswaan-profil',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const handler = new KemahasiswaanProfilHandler(service, validator);
        server.route(routes(handler));
    },
};
