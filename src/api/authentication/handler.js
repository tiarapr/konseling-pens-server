const ClientError = require("../../exceptions/ClientError");
const { generateOTP } = require("../../utils/otpGenerator");

class AuthenticationHandler {
  constructor(service, userService, tokenManager, validator, otpService, whatsappService, mailService, rolePermissionService) {
    this._service = service;
    this._userService = userService;
    this._tokenManager = tokenManager;
    this._validator = validator;
    this._otpService = otpService;
    this._whatsappService = whatsappService;
    this._mailService = mailService;
    this._rolePermissionService = rolePermissionService;

    // Bind methods
    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.verifyOTPHandler = this.verifyOTPHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
    this.resendOTPHandler = this.resendOTPHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    try {
      this._validator.validatePostAuthenticationPayload(request.payload);

      const { email, password } = request.payload;
      const id = await this._userService.verifyUserCredential(email, password);
      const user = await this._userService.getUserById(id);

      if (!user.phone_number) {
        throw new ClientError("Nomor Telepon tidak terdaftar", 400);
      }

      const otp = generateOTP();
      console.log(`Generated OTP for ${email}: ${otp}`);
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      await this._otpService.saveOTP(email, otp, otpExpiry);
      await this._whatsappService.sendOtpMessage(user.phone_number, otp);
      await this._mailService.sendOtpEmail(email, otp);

      return h.response({
        status: "success",
        message: "OTP telah dikirim ke Email dan WhatsApp Anda",
        data: {
          email,
          otp_required: true
        }
      }).code(200);
    } catch (error) {
      return this._handleError(error, h, "Failed to initiate authentication");
    }
  }

  async verifyOTPHandler(request, h) {
    try {
      this._validator.validateVerifyOTPPayload(request.payload);

      const { email, otp } = request.payload;
      const ipAddress = request.headers["x-forwarded-for"] || request.info.remoteAddress;
      const userAgent = request.headers["user-agent"];

      const isValid = await this._otpService.verifyOTP(email, otp);
      if (!isValid) {
        throw new ClientError("OTP tidak valid atau telah kadaluarsa", 400);
      }

      const user = await this._userService.getUserByEmail(email);
      if (!user.role_name) {
        throw new Error("User role name not found");
      }

      const permissions = await this._rolePermissionService.getRolePermissionsByRoleName(user.role_name);
      const permissionNames = permissions.map(p => p.name);

      await this._service.revokeAllUserTokens(user.id);

      const accessToken = this._tokenManager.generateAccessToken(user.id, user.role_name, permissionNames);
      const refreshToken = this._tokenManager.generateRefreshToken(user.id, user.role_name);

      const refreshTokenExpiresAt = new Date(refreshToken.decodedToken.decoded.payload.exp * 1000);

      await this._service.addRefreshToken(user.id, refreshToken.token, ipAddress, userAgent, refreshTokenExpiresAt);
      await this._otpService.deleteOTP(email);

      return h
        .response({
          status: "success",
          message: "Authentication successfully completed",
        })
        .code(201)
        .state("accessToken", accessToken.token, {
          isHttpOnly: true,
          isSecure: true,
          sameSite: "None",
          path: "/",
          ttl: 60 * 60 * 1000, // 15 mins
        })
        .state("refreshToken", refreshToken.token, {
          isHttpOnly: true,
          isSecure: true,
          sameSite: "None",
          path: "/",
          ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

    } catch (error) {
      return this._handleError(error, h, "Failed to verify OTP");
    }
  }

  async putAuthenticationHandler(request, h) {
    try {
      const refreshToken = request.state.refreshToken || request.headers['x-refresh-token'];

      if (!refreshToken) {
        throw new ClientError('Refresh token is required', 400);
      }

      await this._service.verifyRefreshToken(refreshToken);
      const verification = this._tokenManager.verifyRefreshToken(refreshToken);

      if (!verification.validResponse.isValid) {
        throw new ClientError(verification.validResponse.error, 401);
      }

      const { id, role } = verification.decodedToken.decoded.payload.user;
      const permissions = await this._rolePermissionService.getRolePermissionsByRoleName(role);
      const permissionNames = permissions.map(p => p.name);

      const accessToken = this._tokenManager.generateAccessToken(id, role, permissionNames);

      return h
        .response({
          status: "success",
          message: "Access token successfully refreshed",
        })
        .state("accessToken", accessToken.token, {
          isHttpOnly: true,
          isSecure: true,
          sameSite: "Strict",
          path: "/",
          ttl: 15 * 60 * 1000,
        });

    } catch (error) {
      return this._handleError(error, h, "Failed to refresh access token");
    }
  }

  async deleteAuthenticationHandler(request, h) {
    try {
      const { refreshToken } = request.state;
      await this._service.verifyRefreshToken(refreshToken);
      await this._service.deleteRefreshToken(refreshToken);

      return h
        .response({
          status: "success",
          message: "Logged out successfully",
        })
        .unstate("accessToken")
        .unstate("refreshToken");

    } catch (error) {
      return this._handleError(error, h, "Failed to logout");
    }
  }

  async resendOTPHandler(request, h) {
    try {
      this._validator.validateResendOTPPayload(request.payload);
      const { email } = request.payload;

      const user = await this._userService.getUserByEmail(email);
      if (!user || !user.phone_number) {
        throw new ClientError("Pengguna tidak ditemukan atau nomor telepon tidak tersedia", 404);
      }

      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      await this._otpService.deleteOTP(email);
      await this._otpService.saveOTP(email, otp, otpExpiry);

      await this._whatsappService.sendOtpMessage(user.phone_number, otp);
      await this._mailService.sendOtpEmail(email, otp);

      return h.response({
        status: "success",
        message: "OTP baru telah dikirim ke Email dan WhatsApp Anda",
      }).code(200);
    } catch (error) {
      return this._handleError(error, h, "Failed to resend OTP");
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
