const KonselingHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'konseling',
    version: '1.0.0',
    register: async (server, {service, statusService, userService, mahasiswaService, whatsappService, konselorProfileService, validator }) => {
        const handler = new KonselingHandler(service, statusService, userService, mahasiswaService, whatsappService, konselorProfileService, validator);
        server.route(routes(handler));
    },
};
