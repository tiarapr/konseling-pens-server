const Jwt = require('@hapi/jwt');
const config = require('../config/config');

module.exports = () => {
  return {
    keys: config.ACCESS_TOKEN_KEY,
    verify: { aud: false, iss: false, sub: false },
    validate: (artifacts) => {
      const userId = artifacts.decoded.payload.user.id;
      return {
        isValid: true,
        credentials: { id: userId },
      };
    },
  };
};
