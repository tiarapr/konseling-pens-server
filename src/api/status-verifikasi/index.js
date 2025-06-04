const StatusVerifikasiHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'statusVerifikasi',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const handler = new StatusVerifikasiHandler(service, validator);
        server.route(routes(handler));
    },
};
