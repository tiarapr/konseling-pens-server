const routes = (handler) => [
    {
      method: 'POST',
      path: '/admin',
      handler: handler.createAdminAccountHandler,
      options: {
        auth: 'basicAndJwtStrategy',
      },
    },
    {
      method: 'POST',
      path: '/admin-profil',
      handler: handler.postAdminProfilHandler,
      options: {
        auth: 'basicAndJwtStrategy',
      },
    },
    {
      method: 'GET',
      path: '/admin-profil',
      handler: handler.getAdminProfilHandler,
      options: {
        auth: 'basicAndJwtStrategy',
      },
    },
    {
      method: 'GET',
      path: '/admin-profil/{id}',
      handler: handler.getAdminProfilByIdHandler,
      options: {
        auth: 'basicAndJwtStrategy',
      },
    },
    {
      method: 'PATCH',
      path: '/admin-profil/{id}',
      handler: handler.updateAdminProfilHandler,
      options: {
        auth: 'basicAndJwtStrategy',
      },
    },
    {
      method: 'DELETE',
      path: '/admin-profil/{id}',
      handler: handler.deleteAdminProfilHandler,
      options: {
        auth: 'basicAndJwtStrategy',
      },
    },
  ];
  
  module.exports = routes;
  