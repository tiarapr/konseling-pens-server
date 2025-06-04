const RatingHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "rating",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const ratingHandler = new RatingHandler(service, validator);
    server.route(routes(ratingHandler));
  },
};
