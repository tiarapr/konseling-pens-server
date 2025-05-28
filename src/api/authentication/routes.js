const routes = (handler) => [
   {
    method: 'POST',
    path: '/authentication',
    handler: handler.postAuthenticationHandler,
    options: {
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/authentication/verify-otp',
    handler: handler.verifyOTPHandler,
    options: {
      auth: false,
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
