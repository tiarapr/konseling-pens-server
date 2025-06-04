const KonselingHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'konseling',
    version: '1.0.0',
    register: async (server, { service, statusService, konselorProfileService, validator }) => {
        const handler = new KonselingHandler(service, statusService, konselorProfileService, validator);
        server.route(routes(handler));
    },
};
