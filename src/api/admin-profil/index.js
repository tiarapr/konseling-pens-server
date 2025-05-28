const AdminProfilHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'adminProfil',
  version: '1.0.0',
  register: async (server, { service, userService, emailVerificationService, mailSender, fileStorageService, validator }) => {
    const adminProfilHandler = new AdminProfilHandler(service, userService, emailVerificationService, mailSender, fileStorageService, validator);
    server.route(routes(adminProfilHandler));
  },
};
