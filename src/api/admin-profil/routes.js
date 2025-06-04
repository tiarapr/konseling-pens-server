const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
  // === ADMIN ACCOUNT ===
  {
    method: 'POST',
    path: '/admin/account',
    handler: handler.createAdminAccountHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['create_admin_account', 'manage_admins']) }
      ]
    },
  },
  {
    method: 'PATCH',
    path: '/admin/account/{id}',
    handler: handler.updateAdminAccountHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['update_admin_account', 'manage_admins']) }
      ]
    },
  },
  {
    method: 'DELETE',
    path: '/admin/account/{id}',
    handler: handler.deleteAdminAccountHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['delete_admin_account', 'manage_admins']) }
      ]
    },
  },
  {
    method: 'PUT',
    path: '/admin/account/{id}/restore',
    handler: handler.restoreAdminAccountHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['restore_admin_account', 'manage_admins']) }
      ]
    },
  },
  {
    method: 'GET',
    path: '/admin/account/{userId}',
    handler: handler.getAdminAccountByUserIdHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['view_admin_account_by_user', 'manage_admins']) }
      ]
    },
  },

  // === ADMIN PROFIL ===
  {
    method: 'GET',
    path: '/admin',
    handler: handler.getAdminProfilWithAccountHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['view_all_admin', 'manage_admins']) }
      ]
    }
  },
  {
    method: 'POST',
    path: '/admin-profil',
    handler: handler.postAdminProfilHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['create_admin_profil', 'manage_admins']) }
      ]
    },
  },
  {
    method: 'GET',
    path: '/admin-profil',
    handler: handler.getAdminProfilHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['view_all_admin_profil', 'manage_admins']) }
      ]
    },
  },
  {
    method: 'GET',
    path: '/admin-profil/me',
    handler: handler.getOwnAdminProfilHandler,
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
      pre: [
        { method: checkPermission(['view_admin_profil_by_id', 'manage_admins']) }
      ]
    },
  },
  {
    method: 'PATCH',
    path: '/admin-profil/{id}',
    handler: handler.updateAdminProfilHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['update_admin_profil', 'manage_admins']) }
      ]
    },
  },
  {
    method: 'POST',
    path: '/admin-profil/{id}/photo',
    handler: handler.uploadAdminPhotoHandler,
    options: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
        multipart: true,
        maxBytes: 2 * 1024 * 1024,
      },
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['update_admin_profil', 'manage_admins']) }
      ]
    },
  },
];

module.exports = routes;
