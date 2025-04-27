const TopikHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'topik',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const handler = new TopikHandler(service, validator);
        server.route(routes(handler));
    }, 
};
