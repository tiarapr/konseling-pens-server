const checkPermission = require("../../middleware/checkPermission");

const routes = (handler) => [
  {
    method: 'POST',
    path: '/admin',
    handler: handler.createAdminAccountHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['create_admin_account', 'manage_admins']) }
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
        maxBytes: 2 * 1024 * 1024, // 2 MB max
      },
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['update_admin_profil', 'manage_admins']) }
      ]
    },
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
    path: '/admin-profil/me',
    handler: handler.getOwnAdminProfilHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['view_own_admin']) }
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
    method: 'DELETE',
    path: '/admin-profil/{id}',
    handler: handler.deleteAdminProfilHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['delete_admin_profil', 'manage_admins']) }
      ]
    },
  },
  {
    method: 'PUT',
    path: '/admin-profil/{id}/restore',
    handler: handler.restoreAdminProfilHandler,
    options: {
      auth: 'basicAndJwtStrategy',
      pre: [
        { method: checkPermission(['restore_admin_profil', 'manage_admins']) }
      ]
    },
  },
];

module.exports = routes;
