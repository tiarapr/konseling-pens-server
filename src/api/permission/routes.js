const routes = (handler) => [
    {
      method: 'POST',
      path: '/permissions',
      handler: handler.postPermissionHandler,
      options: {
        auth: 'basicAndJwtStrategy',
      },
    },
    {
      method: 'GET',
      path: '/permissions',
      handler: handler.getPermissionsHandler,
      options: {
        auth: 'basicAndJwtStrategy',
      },
    },
    {
      method: 'GET',
      path: '/permissions/{id}',
      handler: handler.getPermissionByIdHandler,
      options: {
        auth: 'basicAndJwtStrategy',
      },
    },
    {
      method: 'DELETE',
      path: '/permissions/{id}',
      handler: handler.deletePermissionHandler,
      options: {
        auth: 'basicAndJwtStrategy',
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
  