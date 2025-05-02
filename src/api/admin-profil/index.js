const AdminProfilHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'adminProfil',
  version: '1.0.0',
  register: async (server, { service, userService, mailSender, validator }) => {
    const adminProfilHandler = new AdminProfilHandler(service, userService, mailSender, validator);
    server.route(routes(adminProfilHandler));
  },
};
