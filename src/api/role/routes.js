const routes = (handler) => [
  {
    method: "POST",
    path: "/role",
    handler: handler.addRoleHandler,
    options: {
      auth: 'basic',
    },
  },
  {
    method: "GET",
    path: "/role",
    handler: handler.getRoleHandler,
    options: {
      auth: 'basicAndJwtStrategy',
    },
  },
  {
    method: "GET",
    path: "/role/{id}",
    handler: handler.getRoleByIdHandler,
    options: {
      auth: 'basicAndJwtStrategy',
    },
  },
  {
    method: "DELETE",
    path: "/role/{id}",
    handler: handler.deleteRoleHandler,
    options: {
      auth: 'basicAndJwtStrategy',
    },
  },
  {
    method: "PATCH",
    path: "/role/{id}",
    handler: handler.updateRoleHandler, 
    options: {
      auth: 'basicAndJwtStrategy',
    },
  },
];

module.exports = routes;