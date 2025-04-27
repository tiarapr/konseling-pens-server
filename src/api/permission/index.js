const PermissionHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'permission',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const permissionHandler = new PermissionHandler(service, validator);
    server.route(routes(permissionHandler));
  },
};
