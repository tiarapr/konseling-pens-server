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
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
    this.verifyOTPHandler = this.verifyOTPHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    try {
      this._validator.validatePostAuthenticationPayload(request.payload);

      const { email, password } = request.payload;

      // Verifikasi kredensial user
      const id = await this._userService.verifyUserCredential(email, password);
      const user = await this._userService.getUserById(id);

      // Pastikan user memiliki nomor yang valid
      if (!user.phone_number) {
        throw new ClientError('Nomor Telepon tidak terdaftar', 400);
      }

      // Generate OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

      // Simpan OTP ke database
      await this._otpService.saveOTP(email, otp, otpExpiry);

      // Kirim OTP via WhatsApp
      // const message = `Kode OTP Anda adalah: ${otp}. Jangan berikan kode ini kepada siapapun. Kode berlaku 5 menit.`;
      await this._whatsappService.sendOtpMessage(user.phone_number, otp);
      console.log(`OTP sent to ${user.phone_number}: ${otp}`);

      // Kirim OTP juga via Email (opsional)
      await this._mailService.sendOtpEmail(email, otp);

      return h.response({
        status: "success",
        message: "OTP telah dikirim ke Email dan WhatsApp Anda",
        data: {
          email: email,
          otp_required: true
        }
      }).code(200);
    } catch (error) {
      return this._handleError(error, h, "Failed to initiate authentication");
    }
  }

  // Handler baru untuk verifikasi OTP
  async verifyOTPHandler(request, h) {
    try {
      this._validator.validateVerifyOTPPayload(request.payload);

      const { email, otp } = request.payload;
      const ipAddress = request.headers['x-forwarded-for'] || request.info.remoteAddress;
      const userAgent = request.headers['user-agent'];

      // Verifikasi OTP dari database
      const isValid = await this._otpService.verifyOTP(email, otp);

      if (!isValid) {
        throw new ClientError('OTP tidak valid atau telah kadaluarsa', 400);
      }

      // Jika OTP valid, lanjutkan proses login
      const user = await this._userService.getUserByEmail(email);
      console.log('User:', user); // Cek apakah ada role_name

      if (!user.role_name) {
        throw new Error('User role name not found');
      }

      const permissions = await this._rolePermissionService.getRolePermissionsByRoleName(user.role_name);

      const permissionNames = permissions.map(p => p.name); // Ambil hanya nama/kode permission-nya
      
      await this._service.revokeAllUserTokens(user.id);

      // Generate token dengan permission
      const accessToken = this._tokenManager.generateAccessToken(user.id, user.role_name, permissionNames);
      const refreshToken = this._tokenManager.generateRefreshToken(user.id, user.role_name);

      const refreshTokenExpiresAt = new Date(refreshToken.decodedToken.decoded.payload.exp * 1000);

      await this._service.addRefreshToken(
        user.id,
        refreshToken.token,
        ipAddress,
        userAgent,
        refreshTokenExpiresAt
      );

      // Hapus OTP yang sudah digunakan
      await this._otpService.deleteOTP(email);

      return h.response({
        status: "success",
        message: "Authentication successfully completed",
        data: {
          accessToken: accessToken.token,
          refreshToken: refreshToken.token,
        },
      }).code(201);
    } catch (error) {
      return this._handleError(error, h, "Failed to verify OTP");
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

      // const user = await this._userService.getUserById(id);
      const permissions = await this._rolePermissionService.getRolePermissionsByRoleName(role);

      const permissionNames = permissions.map(p => p.name); 

      // Generate token dengan permission
      const accessToken = this._tokenManager.generateAccessToken(id, role, permissionNames);

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
