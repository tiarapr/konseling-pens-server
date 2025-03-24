const routes = (handler) => [
    {
      method: "POST",
      path: "/roles",
      handler: handler.addRoleHandler,
    },
    {
      method: "GET",
      path: "/roles",
      handler: handler.getRolesHandler,
    },
    {
      method: "GET",
      path: "/roles/{id}",
      handler: handler.getRoleByIdHandler,
    },
    {
      method: "DELETE",
      path: "/roles/{id}",
      handler: handler.deleteRoleHandler,
    },
  ];
  
  module.exports = routes;
  