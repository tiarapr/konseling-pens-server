const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
  generateAccessToken: (userId, userRole, permissions) => {
    const payload = {
      user: {
        id: userId,
        role: userRole,
        permissions: permissions || []
      }
    };

    const token = Jwt.token.generate(
      payload,
      {
        key: process.env.ACCESS_TOKEN_KEY,
        algorithm: 'HS512'
      },
      {
        ttlSec: 3600
      }
    );

    // Mendekode token untuk mendapatkan informasi lengkap
    const artifacts = Jwt.token.decode(token);

    return {
      token,
      decodedToken: {
        token,
        decoded: artifacts.decoded,
        raw: artifacts.raw
      }
    };
  },

  generateRefreshToken: (userId, userRole) => {
    const payload = {
      user: {
        id: userId,
        role: userRole
      }
    };
    const token = Jwt.token.generate(
      payload,
      {
        key: process.env.REFRESH_TOKEN_KEY,
        algorithm: 'HS512'
      },
      {
        ttlSec: 86400
      }
    );

    const artifacts = Jwt.token.decode(token);

    return {
      token,
      decodedToken: {
        token,
        decoded: artifacts.decoded,
        raw: artifacts.raw
      }
    };
  },

  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);

      return {
        token: refreshToken,
        decodedToken: {
          token: refreshToken,
          decoded: artifacts.decoded,
          raw: artifacts.raw
        },
        validResponse: { isValid: true },
      };
    } catch (error) {
      return {
        token: refreshToken,
        validResponse: {
          isValid: false,
          error: error.message
        }
      };
    }
  },

  verifyAccessToken: (accessToken) => {
    try {
      const artifacts = Jwt.token.decode(accessToken);
      Jwt.token.verifySignature(artifacts, process.env.ACCESS_TOKEN_KEY);

      return {
        token: accessToken,
        decodedToken: {
          token: accessToken,
          decoded: artifacts.decoded,
          raw: artifacts.raw
        },
        validResponse: { isValid: true },
      };
    } catch (error) {
      return {
        token: accessToken,
        validResponse: {
          isValid: false,
          error: error.message
        }
      };
    }
  }
};

module.exports = TokenManager;