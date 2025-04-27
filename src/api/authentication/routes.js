const routes = (handler) => [
  {
    method: "POST",
    path: "/authentication",
    handler: handler.postAuthenticationHandler,
    options: {
      auth: 'basic', 
    },
  },
  {
    method: "PUT",
    path: "/authentication",
    handler: handler.putAuthenticationHandler,
    options: {
      auth: 'basic',
    },
  },
  {
    method: "DELETE",
    path: "/authentication",
    handler: handler.deleteAuthenticationHandler,
    options: {
      auth: 'basicAndJwtStrategy',
    },
  },
];

module.exports = routes;
