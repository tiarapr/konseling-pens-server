const MahasiswaHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'mahasiswa',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const handler = new MahasiswaHandler(service, validator);
        server.route(routes(handler));
    },
};
