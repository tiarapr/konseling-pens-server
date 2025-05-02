const CatatanKonselingHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'catatan-konseling',
    version: '1.0.0',
    register: async (server, { service, konselingTopikService, validator }) => {
        const handler = new CatatanKonselingHandler(service, konselingTopikService, validator);
        server.route(routes(handler));
    }, 
};
