const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
  {
    method: 'POST',
    path: '/permissions',
    handler: handler.postPermissionHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['manage_permissions']) }
      ]
    },
  },
  {
    method: 'GET',
    path: '/permissions',
    handler: handler.getPermissionsHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['manage_permissions']) }
      ]
    },
  },
  {
    method: 'GET',
    path: '/permissions/{id}',
    handler: handler.getPermissionByIdHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['manage_permissions']) }
      ]
    },
  },
  {
    method: 'DELETE',
    path: '/permissions/{id}',
    handler: handler.deletePermissionHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['manage_permissions']) }
      ]
    },
  },
  {
    method: 'PATCH',
    path: '/permissions/{id}',
    handler: handler.putPermissionHandler,
    options: {
      auth: 'basicAndJwtStrategy',
    },
  },
];

module.exports = routes;
