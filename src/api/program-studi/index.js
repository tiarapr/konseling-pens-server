const ProgramStudiHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'programStudi',
    version: '1.0.0',
    register: async (server, { service, validator }) => {
        const handler = new ProgramStudiHandler(service, validator);
        server.route(routes(handler));
    },
};
