const AdminProfilHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'adminProfil',
  version: '1.0.0',
  register: async (server, { service, userService, roleService, emailVerificationService, mailSender, fileStorageService, validator }) => {
    const adminProfilHandler = new AdminProfilHandler(service, userService, roleService, emailVerificationService, mailSender, fileStorageService, validator);
    server.route(routes(adminProfilHandler));
  },
};
