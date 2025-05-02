const KonselorProfilHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "konselorProfil",
  version: "1.0.0",
  register: async (server, { service, userService, mailSender, validator }) => {
    const handler = new KonselorProfilHandler(service, userService, mailSender, validator);
    server.route(routes(handler));
  },
};
