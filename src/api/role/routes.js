const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
  {
    method: "POST",
    path: "/role",
    handler: handler.addRoleHandler,
    options: {
      auth: 'basic',
      pre: [
        { method: checkPermission('manage_roles') }
      ]
    },
  },
  {
    method: "GET",
    path: "/role",
    handler: handler.getRoleHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission('manage_roles') }
      ]
    },
  },
  {
    method: "GET",
    path: "/role/{id}",
    handler: handler.getRoleByIdHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission('manage_roles') }
      ]
    },
  },
  {
    method: "DELETE",
    path: "/role/{id}",
    handler: handler.deleteRoleHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission('manage_roles') }
      ]
    },
  },
  {
    method: "PATCH",
    path: "/role/{id}",
    handler: handler.updateRoleHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission('manage_roles') }
      ]
    },
  },
];

module.exports = routes;