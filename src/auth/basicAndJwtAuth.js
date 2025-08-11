const Jwt = require('@hapi/jwt');
const Boom = require('@hapi/boom');
const config = require('../config/config');

module.exports = () => {
  return {
    authenticate: async (request, h) => {
      try {
        const authorization = request.headers.authorization;
        if (!authorization || !authorization.startsWith('Basic ')) {
          throw Boom.unauthorized('Missing or invalid Basic authentication');
        }

        const basicAuth = authorization.split(' ')[1];
        const [username, password] = Buffer.from(basicAuth, 'base64').toString().split(':');
        const validUser = username === config.BASIC_AUTH_USERNAME;
        const validPass = password === config.BASIC_AUTH_PASSWORD;

        if (!validUser || !validPass) {
          throw Boom.unauthorized('Invalid Basic authentication credentials');
        }

        const token = request.state.accessToken;
        if (!token) {
          throw Boom.unauthorized('Missing or invalid JWT token');
        }

        const artifacts = Jwt.token.decode(token);
        await Jwt.token.verify(artifacts, process.env.ACCESS_TOKEN_KEY);

        return h.authenticated({
          credentials: {
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
    }
  };
};
