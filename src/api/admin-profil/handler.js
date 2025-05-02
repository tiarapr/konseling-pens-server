const ClientError = require('../../exceptions/ClientError');

class AdminProfilHandler {
  constructor(service, userService, mailSender, validator) {
    this._service = service;
    this._userService = userService;
    this._mailSender = mailSender;
    this._validator = validator;

    this.getAdminProfilHandler = this.getAdminProfilHandler.bind(this);
    this.getAdminProfilByIdHandler = this.getAdminProfilByIdHandler.bind(this);
    this.createAdminAccountHandler = this.createAdminAccountHandler.bind(this);
    this.postAdminProfilHandler = this.postAdminProfilHandler.bind(this);
    this.updateAdminProfilHandler = this.updateAdminProfilHandler.bind(this);
    this.deleteAdminProfilHandler = this.deleteAdminProfilHandler.bind(this);
  }

  async createAdminAccountHandler(request, h) {
    this._validator.validateCreateAccountPayload(request.payload);
    const { email, password, roleId, nama_lengkap, no_telepon } = request.payload;

    try {
      // Cek apakah no_telepon sudah terdaftar
      const existingPhoneNumber = await this._service.checkPhoneNumberExists(no_telepon);
      if (existingPhoneNumber) {
        throw new ClientError('The phone number is already used in another profile.', 400);
      }

      // Langkah 1: Buat akun user terlebih dahulu
      const userId = await this._userService.addUser({
        email,
        password,
        isVerified: false,
        roleId,
      });

      // Generate verification token
      const verificationToken = await this._userService.generateVerificationToken(userId);

      // Send verification email
      await this._mailSender.sendVerificationEmail(email, verificationToken);

      const createdBy = request.auth.credentials.jwt.user.id;

      // Langkah 2: Setelah user dibuat, buat profil admin
      const adminProfile = await this._service.create({
        nama_lengkap, no_telepon, user_id: userId, created_by: createdBy
      });

      const response = h.response({
        status: 'success',
        message: 'Admin account created successfully. Please ensure the user verifies their account via the email sent.',
        data: {
          adminProfile,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async getAdminProfilHandler(request, h) {
    try {
      const adminProfils = await this._service.getAll();
      return {
        status: 'success',
        data: {
          adminProfils,
        },
      };
    } catch (error) {
      return this._handleServerError(h, error);
    }
  }

  async getAdminProfilByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const adminProfil = await this._service.getById(id);
      return {
        status: 'success',
        data: {
          adminProfil,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async postAdminProfilHandler(request, h) {
    try {
      this._validator.validateCreateProfilePayload(request.payload);
      const { nama_lengkap, no_telepon, user_id } = request.payload;

      const createdBy = request.auth.credentials.jwt.user.id;

      // Cek apakah user_id sudah terdaftar di profil lain
      const existingUser = await this._service.checkUserIdExists(user_id);
      if (existingUser) {
        throw new ClientError('User ID sudah terdaftar di profil lain.', 400);
      }

      // Cek apakah no_telepon sudah terdaftar di profil lain
      const existingPhoneNumber = await this._service.checkPhoneNumberExists(no_telepon);
      if (existingPhoneNumber) {
        throw new ClientError('Nomor telepon sudah digunakan di profil lain.', 400);
      }

      const result = await this._service.create({ nama_lengkap, no_telepon, user_id, created_by: createdBy });

      const response = h.response({
        status: 'success',
        message: 'Profil admin berhasil ditambahkan',
        data: {
          adminProfil: result,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async updateAdminProfilHandler(request, h) {
    try {
      const { id } = request.params;
      this._validator.validateUpdatePayload(request.payload);
      const { nama_lengkap, no_telepon } = request.payload;

      const updatedBy = request.auth.credentials.jwt.user.id;

      const result = await this._service.update(id, { nama_lengkap, no_telepon, updated_by: updatedBy });

      return {
        status: 'success',
        message: 'Profil admin berhasil diperbarui',
        data: {
          adminProfil: result,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async deleteAdminProfilHandler(request, h) {
    try {
      const { id } = request.params;

      const deletedBy = request.auth.credentials.jwt.user.id;

      const result = await this._service.softDelete(id, deletedBy);

      return {
        status: 'success',
        message: 'Profil admin berhasil dihapus',
        data: {
          adminProfil: result,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  _handleError(h, error) {
    if (error instanceof ClientError) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(error.statusCode);
      return response;
    }

    return this._handleServerError(h, error);
  }

  _handleServerError(h, error) {
    console.error(error);
    const response = h.response({
      status: 'error',
      message: 'Sorry, there was an error on the server.',
    });
    response.code(500);
    return response;
  }
}

module.exports = AdminProfilHandler;
