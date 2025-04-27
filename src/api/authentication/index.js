const AuthenticationHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "authentication",
  version: "1.0.0",
  register: async (server, { service, userService, tokenManager, validator }) => {
    const authenticationHandler = new AuthenticationHandler(
      service,
      userService,
      tokenManager,
      validator
    );
    server.route(routes(authenticationHandler));
  },
};
