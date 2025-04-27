const ClientError = require("../../exceptions/ClientError");

class UserHandler {
  constructor(service, validator, mailSender) {
    this._service = service;
    this._validator = validator;
    this._mailSender = mailSender;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getAllUserHandler = this.getAllUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    this.verifyEmailHandler = this.verifyEmailHandler.bind(this);
    this.resendVerificationEmailHandler = this.resendVerificationEmailHandler.bind(this);
    this.updateUserEmailHandler = this.updateUserEmailHandler.bind(this);
    this.updateUserPasswordHandler = this.updateUserPasswordHandler.bind(this);
    this.forgotPasswordHandler = this.forgotPasswordHandler.bind(this);
    this.resetPasswordHandler = this.resetPasswordHandler.bind(this);
  }

  async postUserHandler(request, h) {
    try {
      this._validator.validateUserPayload(request.payload);
      const { email, password, roleId } = request.payload;

      // Add user with is_verified set to false by default
      const userId = await this._service.addUser({
        email,
        password,
        isVerified: false,
        roleId,  
      });

      // Generate verification token
      const verificationToken = await this._service.generateVerificationToken(userId);

      // Send verification email
      await this._mailSender.sendVerificationEmail(email, verificationToken);

      return h.response({
        status: "success",
        message: "User successfully added. Please check your email for verification instructions.",
        data: { userId },
      }).code(201);
    } catch (error) {
      return this._handleError(error, h, "Failed to add user");
    }
  }

  async verifyEmailHandler(request, h) {
    try {
      const { token } = request.query;

      // Verify the token and update user's verification status
      await this._service.verifyEmail(token);

      return {
        status: "success",
        message: "Email successfully verified",
      };
    } catch (error) {
      return this._handleError(error, h, "Failed to verify email");
    }
  }

  async resendVerificationEmailHandler(request, h) {
    try {
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
      await this._service.invalidateOldVerificationTokens(user.id);

      // 3. Generate token baru
      const verificationToken = await this._service.generateVerificationToken(user.id);

      // 4. Kirim ulang email
      await this._mailSender.sendVerificationEmail(user.email, verificationToken);

      return h.response({
        status: 'success',
        message: 'Verification email has been resent. Please check your inbox.',
      }).code(200);
    } catch (error) {
      return this._handleError(error, h, 'Failed to resend verification email');
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
    try {
      const { id } = request.params;
      const { email } = request.payload;
  
      this._validator.validateUpdateEmailPayload({ email });
  
      // Pastikan email baru tidak digunakan user lain
      await this._service.verifyNewEmail(email);
  
      // Update email user
      await this._service.updateUserEmail(id, email);
  
      // Generate token verifikasi baru
      const verificationToken = await this._service.generateVerificationToken(id);
      await this._mailSender.sendVerificationEmail(email, verificationToken);
  
      return h.response({
        status: 'success',
        message: 'Email updated successfully. Please verify your new email.',
      }).code(200);
      
    } catch (error) {
      return this._handleError(error, h, 'Failed to update email');
    }
  }
  
  async updateUserPasswordHandler(request, h) {
    try {
      const { id } = request.params;
      const { oldPassword, newPassword } = request.payload;
  
      this._validator.validateUpdatePasswordPayload({ oldPassword, newPassword });
  
      // Verifikasi password lama
      await this._service.verifyUserPassword(id, oldPassword);
  
      // Update ke password baru
      await this._service.updateUserPassword(id, newPassword);
  
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
      const resetToken = await this._service.generateResetPasswordToken(user.id);
  
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
  
      this._validator.validateUpdateUserPayload({ password });
  
      // Verifikasi token dan ambil user id
      const userId = await this._service.verifyResetPasswordToken(token);
  
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