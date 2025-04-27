const JanjiTemuHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'janji-temu',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const handler = new JanjiTemuHandler(service, validator);
        server.route(routes(handler));
    }, 
};
