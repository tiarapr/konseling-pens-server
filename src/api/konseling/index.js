const KonselingHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'konseling',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const handler = new KonselingHandler(service, validator);
        server.route(routes(handler));
    },
};
