const config = require('../config/config');

module.exports = () => {
  return {
    validate: async (request, username, password) => {
      const validUser = username === config.BASIC_AUTH_USERNAME;
      const validPass = password === config.BASIC_AUTH_PASSWORD;
      if (validUser && validPass) {
        return { isValid: true, credentials: { username } };
      }
      return { isValid: false };
    }
  };
};
