const UserHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "user",
  version: "1.0.0",
  register: async (server, { service, validator, mailSender }) => {
    const userHandler = new UserHandler(service, validator, mailSender);
    server.route(routes(userHandler));
  },
};
