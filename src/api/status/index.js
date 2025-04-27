const StatusHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'status',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const handler = new StatusHandler(service, validator);
        server.route(routes(handler));
    },
};
