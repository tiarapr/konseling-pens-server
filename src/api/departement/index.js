const DepartementHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'departement',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const handler = new DepartementHandler(service, validator);
        server.route(routes(handler));
    },
};
