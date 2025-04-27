const Boom = require('@hapi/boom');
const Jwt = require('@hapi/jwt');
const config = require('../config/config');

module.exports = () => {
  return {
    authenticate: async (request, h) => {
      try {
        // Check Basic Auth in Authorization header
        const authorization = request.headers.authorization;
        if (!authorization || !authorization.startsWith('Basic ')) {
          throw Boom.unauthorized('Missing or invalid Basic authentication');
        }

        // Validate Basic credentials
        const basicAuth = authorization.split(' ')[1];
        const [username, password] = Buffer.from(basicAuth, 'base64').toString().split(':');
        
        const validUser = username === config.BASIC_AUTH_USERNAME;
        const validPass = password === config.BASIC_AUTH_PASSWORD;
        
        if (!validUser || !validPass) {
          throw Boom.unauthorized('Invalid Basic authentication credentials');
        }

        // Check JWT in Authorization-Two header
        const authorizationTwo = request.headers['authorization-two'];
        if (!authorizationTwo || !authorizationTwo.startsWith('Bearer ')) {
          throw Boom.unauthorized('Missing or invalid JWT authentication');
        }

        // Validate JWT token
        const token = authorizationTwo.split(' ')[1];
        const artifacts = Jwt.token.decode(token);
        await Jwt.token.verify(artifacts, config.ACCESS_TOKEN_KEY);
        
        return h.authenticated({
          credentials: {
            basic: { username },
            jwt: artifacts.decoded.payload,
          },
          artifacts: { token },
        });
      } catch (err) {
        if (Boom.isBoom(err)) {
          throw err;
        }
        throw Boom.unauthorized('Invalid authentication credentials');
      }
    },
  };
};
