const CatatanKonselingHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'catatan-konseling',
    version: '1.0.0',
    register: async (server, { service, statusService, konselingService, notifier, validator }) => {
        const handler = new CatatanKonselingHandler(service, statusService, konselingService, notifier, validator);
        server.route(routes(handler));
    }, 
};
