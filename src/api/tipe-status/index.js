const TipeStatusHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'tipeStatus',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const handler = new TipeStatusHandler(service, validator);
        server.route(routes(handler));
    },
};
