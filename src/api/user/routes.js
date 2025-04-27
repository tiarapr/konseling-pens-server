const routes = (handler) => [
  {
    method: 'POST',
    path: '/user',
    handler: handler.postUserHandler,
    options: {
      auth: 'basic',
    },
  },
  {
    method: 'GET',
    path: '/user/me',
    handler: handler.getUserByIdHandler,
    options: {
      auth: 'basicAndJwtStrategy',
    },
  },
  // Verify user email using token from email link
  {
    method: "GET",
    path: "/verify-email",
    handler: handler.verifyEmailHandler,
    options: {
      auth: false
    }
  },
  // Resend email verification link
  {
    method: "POST",
    path: "/resend-verification-email",
    handler: handler.resendVerificationEmailHandler,
    options: {
      auth: 'basic',
      plugins: {
        'hapi-rate-limit': {
          max: 2,
          windowMs: 60 * 1000,
          handler: (request, h) => {
            return h.response({
              status: 'fail',
              message: 'Anda hanya bisa request 2x dalam 1 menit. Cek email Anda atau coba lagi nanti.'
            }).code(429);
          }
        }
      }
    }
  },
  // Get all user
  {
    method: "GET",
    path: "/user",
    handler: handler.getAllUserHandler,
    options: {
      auth: 'basicAndJwtStrategy',
    },
  },
  // Get a specific user by ID
  {
    method: "GET",
    path: "/user/{id}",
    handler: handler.getUserByIdHandler,
    options: {
      auth: 'basicAndJwtStrategy',
    },
  },
  // Update user email (requires re-verification)
  {
    method: "PATCH",
    path: "/user/{id}/email",
    handler: handler.updateUserEmailHandler,
    options: {
      auth: 'basicAndJwtStrategy',
    },
  },
  // Update user password (with old password confirmation)
  {
    method: "PATCH",
    path: "/user/{id}/password",
    handler: handler.updateUserPasswordHandler,
    options: {
      auth: 'basicAndJwtStrategy',
    },
  },
  // Request a password reset link via email
  {
    method: "POST",
    path: "/forgot-password",
    handler: handler.forgotPasswordHandler,
    options: {
      auth: 'basic',
      plugins: {
        'hapi-rate-limit': {
          max: 2,
          windowMs: 60 * 1000,
          handler: (request, h) => {
            return h.response({
              status: 'fail',
              message: 'Anda hanya bisa request 2x dalam 1 menit. Cek email Anda atau coba lagi nanti.'
            }).code(429);
          }
        }
      }
    }
  },
  // Reset password using token from email
  {
    method: "POST",
    path: "/reset-password",
    handler: handler.resetPasswordHandler,
    options: {
      auth: false
    }
  },
];

module.exports = routes;
