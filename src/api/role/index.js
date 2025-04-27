const RoleHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "role",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const roleHandler = new RoleHandler(service, validator);
    server.route(routes(roleHandler));
  },
};
