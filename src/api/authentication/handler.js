const ClientError = require("../../exceptions/ClientError");

class AuthenticationHandler {
  constructor(service, userService, tokenManager, validator) {
    this._service = service;
    this._userService = userService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    try {
      console.log("Start of postAuthenticationHandler");
      this._validator.validatePostAuthenticationPayload(request.payload);

      const { email, password } = request.payload;
      const ipAddress = request.headers['x-forwarded-for'] || request.info.remoteAddress;
      const userAgent = request.headers['user-agent'];

      console.log(`Validating user credentials for email: ${email}`);
      const id = await this._userService.verifyUserCredential(email, password);
      const user = await this._userService.getUserById(id);

      console.log(`User found: ${user.id}`);

      // Revoke all existing tokens for the user
      console.log(`Revoking existing tokens for user ID: ${id}`);
      await this._service.revokeAllUserTokens(id);

      const accessToken = this._tokenManager.generateAccessToken(user.id, user.role_name);

      const refreshToken = this._tokenManager.generateRefreshToken(user.id, user.role_name);

      const refreshTokenExpiresAt = new Date(refreshToken.decodedToken.decoded.payload.exp * 1000);

      console.log("Adding refresh token to database");
      
      await this._service.addRefreshToken(
        id,
        refreshToken.token,
        ipAddress,
        userAgent,
        refreshTokenExpiresAt
      );

      return h.response({
        status: "success",
        message: "Authentication successfully added",
        data: {
          accessToken: accessToken.token,
          refreshToken: refreshToken.token,
        },
      }).code(201);
    } catch (error) {
      return this._handleError(error, h, "Failed to add authentication");
    }
  }

  async putAuthenticationHandler(request, h) {
    try {
      this._validator.validatePutAuthenticationPayload(request.payload);

      const { refreshToken } = request.payload;

      // Cek token di DB
      await this._service.verifyRefreshToken(refreshToken);

      // Decode dan verifikasi signature
      const verification = this._tokenManager.verifyRefreshToken(refreshToken);
      if (!verification.validResponse.isValid) {
        throw new InvariantError(verification.validResponse.error);
      }

      const { id, role } = verification.decodedToken.decoded.payload.user;

      // Ambil user dari DB untuk validasi tambahan (opsional, bisa dilewati)
      const user = await this._userService.getUserById(id);
      const accessToken = this._tokenManager.generateAccessToken(id, role);

      return {
        status: "success",
        message: "Access token successfully refreshed",
        data: {
          accessToken: accessToken.token
        },
      };
    } catch (error) {
      return this._handleError(error, h, "Failed to refresh access token");
    }
  }

  async deleteAuthenticationHandler(request, h) {
    try {
      this._validator.validateDeleteAuthenticationPayload(request.payload);

      const { refreshToken } = request.payload;
      await this._service.verifyRefreshToken(refreshToken);
      await this._service.deleteRefreshToken(refreshToken);

      return {
        status: "success",
        message: "Refresh token successfully deleted",
      };
    } catch (error) {
      return this._handleError(error, h, "Failed to delete refresh token");
    }
  }

  _handleError(error, h, defaultMessage) {
    if (error instanceof ClientError) {
      return h.response({
        status: "fail",
        message: error.message,
      }).code(error.statusCode);
    }

    console.error(error);
    return h.response({
      status: "error",
      message: `${defaultMessage}. An unexpected server error occurred.`,
    }).code(500);
  }
}

module.exports = AuthenticationHandler;
