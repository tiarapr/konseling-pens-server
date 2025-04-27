const KonselorProfilHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "konselorProfil",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const handler = new KonselorProfilHandler(service, validator);
    server.route(routes(handler));
  },
};
