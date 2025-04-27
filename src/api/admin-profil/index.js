const AdminProfilHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'adminProfil',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const adminProfilHandler = new AdminProfilHandler(service, validator);
    server.route(routes(adminProfilHandler));
  },
};
