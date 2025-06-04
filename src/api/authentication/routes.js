const hapiRateLimit = require("hapi-rate-limit");

const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentication',
    handler: handler.postAuthenticationHandler,
    options: {
      auth: false,
      plugins: {
        'hapi-rate-limit': {
          max: 2,
          windowMs: 60 * 1000,
          handler: (request, h) => {
            return h.response({
              status: 'fail',
              message: 'Anda hanya bisa request 2x dalam 10 menit. Cek email Anda atau coba lagi nanti.'
            }).code(429);
          }
        }
      }
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
    method: 'POST',
    path: '/authentication/resend-otp',
    handler: handler.resendOTPHandler,
    options: {
      auth: false,
      plugins: {
        'hapi-rate-limit': {
          max: 1,
          windowMs: 60 * 1000,
          handler: (request, h) => {
            return h.response({
              status: 'fail',
              message: 'Anda hanya bisa request OTP baru 1x dalam 1 menit. Cek email Anda atau coba lagi nanti.'
            }).code(429);
          }
        }
      }
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
