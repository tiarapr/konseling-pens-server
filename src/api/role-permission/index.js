const RolePermissionHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'rolePermission',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const handler = new RolePermissionHandler(service, validator);
    server.route(routes(handler));
  },
};
