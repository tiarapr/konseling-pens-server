const { user } = require("pg/lib/defaults");
const ClientError = require("../../exceptions/ClientError");

class UserHandler {
  constructor(service, validator, emailVerificationService, passwordResetService, mailSender) {
    this._service = service;
    this._emailVerificationService = emailVerificationService;
    this._passwordResetService = passwordResetService;
    this._validator = validator;
    this._mailSender = mailSender;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getAllUserHandler = this.getAllUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    this.getCurrentUserHandler = this.getCurrentUserHandler.bind(this);
    this.verifyEmailHandler = this.verifyEmailHandler.bind(this);
    this.resendVerificationEmailHandler = this.resendVerificationEmailHandler.bind(this);
    this.updateUserEmailHandler = this.updateUserEmailHandler.bind(this);
    this.updateUserPhoneNumberHandler = this.updateUserPhoneNumberHandler.bind(this);
    this.updateUserPasswordHandler = this.updateUserPasswordHandler.bind(this);
    this.forgotPasswordHandler = this.forgotPasswordHandler.bind(this);
    this.resetPasswordHandler = this.resetPasswordHandler.bind(this);
    this.deleteUserHandler = this.deleteUserHandler.bind(this);
    this.restoreUserHandler = this.restoreUserHandler.bind(this);
  }

  async postUserHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN');

      this._validator.validateUserPayload(request.payload);
      const { email, phoneNumber, password, roleId } = request.payload;

      const userId = await this._service.addUser(client, {
        email,
        phoneNumber,
        password,
        isVerified: false,
        roleId,
      });

      const verificationToken = await this._emailVerificationService.generateToken(userId, client); // gunakan client jika perlu

      await this._mailSender.sendVerificationEmail(email, verificationToken);

      await client.query('COMMIT');

      return h.response({
        status: "success",
        message: "User successfully added. Please check your email for verification instructions.",
        data: { userId },
      }).code(201);
    } catch (error) {
      await client.query('ROLLBACK');
      return this._handleError(error, h, "Failed to add user");
    } finally {
      client.release();
    }
  }

  async verifyEmailHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN');

      const { token } = request.payload;

      if (!token) {
        throw new ClientError('Token is required');
      }

      const userId = await this._emailVerificationService.verifyEmail(client, token);

      await client.query('COMMIT');

      return {
        status: "success",
        message: "Email successfully verified",
        data: { user_id: userId }
      };
    } catch (error) {
      return this._handleError(error, h, "Failed to verify email");
    }
  }

  async resendVerificationEmailHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN')

      const { email } = request.payload;

      // 1. Cari user berdasarkan email
      const user = await this._service.getUserByEmail(email);

      if (!user) {
        throw new ClientError('User with the provided email does not exist');
      }

      if (user.is_verified) {
        throw new ClientError('User email is already verified');
      }

      // 2. Invalidate token lama
      await this._emailVerificationService.invalidateOldTokens(user.id);

      // 3. Generate token baru
      const verificationToken = await this._emailVerificationService.generateToken(client, user.id);

      // 4. Kirim ulang email
      await this._mailSender.sendVerificationEmail(user.email, verificationToken);

      await client.query('COMMIT')

      return h.response({
        status: 'success',
        message: 'Verification email has been resent. Please check your inbox.',
      }).code(200);
    } catch (error) {
      return this._handleError(error, h, 'Failed to resend verification email');
    }
  }

  async getCurrentUserHandler(request, h) {
    try {
      const { id } = request.auth.credentials.jwt.user;

      const user = await this._service.getCurrentUserById(id);

      return {
        status: "success",
        data: { user },
      };
    } catch (error) {
      return this._handleError(error, h, "Failed to retrieve user information");
    }
  }

  async getUserByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const user = await this._service.getUserById(id);

      return {
        status: "success",
        data: { user },
      };
    } catch (error) {
      return this._handleError(error, h, "Failed to retrieve user by ID");
    }
  }

  async getAllUserHandler(request, h) {
    try {
      const user = await this._service.getAllUser();

      return h.response({
        status: 'success',
        data: {
          user,
        },
      }).code(200);
    } catch (error) {
      return this._handleError(error, h, 'Failed to get user');
    }
  }

  async updateUserEmailHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN')

      const { id } = request.params;
      const { email } = request.payload;
      const userId = request.auth.credentials.jwt.user.id;

      if (id !== userId) {
        throw new ClientError('You can only update your own email');
      }

      this._validator.validateUpdateEmailPayload({ email });
      await this._service.verifyNewEmail(client, email);
      await this._service.updateUserEmail(id, email, userId);

      const verificationToken = await this._emailVerificationService.generateToken(client, id);
      await this._mailSender.sendVerificationEmail(email, verificationToken);

      await client.query('COMMIT')

      return h.response({
        status: 'success',
        message: 'Email updated successfully. Please verify your new email.',
        requiresLogout: true // Flag khusus untuk frontend
      }).code(200);

    } catch (error) {
      await client.query('ROLLBACK');
      return this._handleError(error, h, 'Failed to update email');
    } finally {
      client.release();
    }
  }

  async updateUserPhoneNumberHandler(request, h) {
    try {
      const { id } = request.params;
      const { phoneNumber } = request.payload;
      const userId = request.auth.credentials.jwt.user.id;

      if (id !== userId) {
        throw new ClientError('You can only update your own phone number');
      }

      this._validator.validateUpdatePhoneNumberPayload({ phoneNumber });

      // Pastikan nomor telepon baru tidak digunakan user lain
      await this._service.verifyUserPhoneNumber(phoneNumber);

      // Update nomor telepon user
      await this._service.updateUserPhoneNumber(id, phoneNumber, userId);

      return h.response({
        status: 'success',
        message: 'Phone number updated successfully.',
      }).code(200);

    } catch (error) {
      return this._handleError(error, h, 'Failed to update phone number');
    }
  }

  async updateUserPasswordHandler(request, h) {
    try {
      const { id } = request.params;
      const { oldPassword, newPassword } = request.payload;
      const userId = request.auth.credentials.jwt.user.id;

      if (id !== userId) {
        throw new ClientError('You can only update your own password');
      }

      this._validator.validateUpdatePasswordPayload({ oldPassword, newPassword });

      // Verifikasi password lama
      await this._service.verifyUserPassword(id, oldPassword);

      // Update ke password baru
      await this._service.updateUserPassword(id, newPassword, userId);

      return h.response({
        status: 'success',
        message: 'Password updated successfully.',
      }).code(200);

    } catch (error) {
      return this._handleError(error, h, 'Failed to update password');
    }
  }

  async forgotPasswordHandler(request, h) {
    try {
      const { email } = request.payload;

      // Cari user berdasarkan email
      const user = await this._service.getUserByEmail(email);
      if (!user) {
        throw new ClientError('User with the provided email does not exist');
      }

      // Generate token reset password
      const resetToken = await this._passwordResetService.generateResetPasswordToken(user.id);

      // Kirim email reset password
      await this._mailSender.sendResetPasswordEmail(user.email, resetToken);

      return h.response({
        status: 'success',
        message: 'Reset password instructions have been sent to your email.',
      }).code(200);

    } catch (error) {
      return this._handleError(error, h, 'Failed to process password reset request');
    }
  }

  async resetPasswordHandler(request, h) {
    try {
      const { token } = request.query;
      const { password } = request.payload;

      this._validator.validateResetPasswordPayload({ password });

      // Verifikasi token dan ambil user id
      const userId = await this._passwordResetService.verifyResetPasswordToken(token);

      // Update password user
      await this._service.updateResetPassword(userId, password);

      return h.response({
        status: 'success',
        message: 'Password has been reset successfully.',
      }).code(200);

    } catch (error) {
      return this._handleError(error, h, 'Failed to reset password');
    }
  }

  async deleteUserHandler(request, h) {
    try {
      const { id } = request.params;
      const deletedBy = request.auth.credentials.jwt.user.id;

      // Hapus user
      await this._service.deleteUser(id, deletedBy);

      return h.response({
        status: 'success',
        message: 'User deleted successfully.',
      }).code(200);

    } catch (error) {
      return this._handleError(error, h, 'Failed to delete user');
    }
  }

  async restoreUserHandler(request, h) {
    try {
      const { id } = request.params;
      const restoredBy = request.auth.credentials.jwt.user.id;

      await this._service.restoreUser(id, restoredBy);

      return h.response({
        status: 'success',
        message: 'User restored successfully.',
      }).code(200);
    } catch (error) {
      return this._handleError(error, h, 'Failed to restore user');
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

module.exports = UserHandler;