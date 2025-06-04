const KonselorProfilHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "konselorProfil",
  version: "1.0.0",
  register: async (server, { service, userService, roleService, emailVerificationService, mailSender, fileStorageService, validator }) => {
    const handler = new KonselorProfilHandler(service, userService, roleService, emailVerificationService, mailSender, fileStorageService, validator);
    server.route(routes(handler));
  },
};
