const StatisticsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "statistics",
  version: "1.0.0",
  register: async (server, { statisticsService }) => {
    const statisticsHandler = new StatisticsHandler(statisticsService);
    server.route(routes(statisticsHandler));
  },
};
