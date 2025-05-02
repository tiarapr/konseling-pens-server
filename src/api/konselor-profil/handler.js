const ClientError = require('../../exceptions/ClientError');

class KonselorProfilHandler {
  constructor(service, userService, mailSender, validator) {
    this._service = service;
    this._userService = userService;
    this._mailSender = mailSender;
    this._validator = validator;

    this.createKonselorAccountHandler = this.createKonselorAccountHandler.bind(this);
    this.getKonselorProfilHandler = this.getKonselorProfilHandler.bind(this);
    this.getKonselorProfilByIdHandler = this.getKonselorProfilByIdHandler.bind(this);
    this.getKonselorProfilByUserIdHandler = this.getKonselorProfilByUserIdHandler.bind(this);
    this.postKonselorProfilHandler = this.postKonselorProfilHandler.bind(this);
    this.updateKonselorProfilHandler = this.updateKonselorProfilHandler.bind(this);
    this.deleteKonselorProfilHandler = this.deleteKonselorProfilHandler.bind(this);
  }

  async createKonselorAccountHandler(request, h) {
    this._validator.validateCreateAccountPayload(request.payload);
    const { email, password, roleId, nip, nama_lengkap, spesialisasi, no_telepon } = request.payload;

    try {
      // Cek apakah no_telepon sudah terdaftar
      const existingPhoneNumber = await this._service.checkPhoneNumberExists(no_telepon);
      if (existingPhoneNumber) {
        throw new ClientError('The phone number is already used in another profile.', 400);
      }

      // Langkah 3: Buat akun user terlebih dahulu
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

      // Langkah 4: Setelah user dibuat, buat profil konselor
      const konselorProfile = await this._service.create({
        nip, nama_lengkap, spesialisasi, no_telepon, user_id: userId, created_by: createdBy
      });

      const response = h.response({
        status: 'success',
        message: 'Konselor account created successfully. Please ensure the user verifies their account via the email sent.',
        data: {
          konselorProfile,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async getKonselorProfilHandler(request, h) {
    try {
      const konselors = await this._service.getAll();
      return {
        status: 'success',
        data: {
          konselors,
        },
      };
    } catch (error) {
      return this._handleServerError(h, error);
    }
  }

  async getKonselorProfilByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const konselor = await this._service.getById(id);
      return {
        status: 'success',
        data: {
          konselor,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async getKonselorProfilByUserIdHandler(request, h) {
    try {
      const { userId } = request.params;
      const konselor = await this._service.getByUserId(userId);
      return {
        status: 'success',
        data: {
          konselor,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async postKonselorProfilHandler(request, h) {
    try {
      this._validator.validateCreateProfilePayload(request.payload);
      const { nip, nama_lengkap, spesialisasi, no_telepon, user_id } = request.payload;

      const createdBy = request.auth.credentials.jwt.user.id;

      // Cek apakah user_id sudah terdaftar di profil lain
      const existingUser = await this._service.checkUserIdExists(user_id);
      if (existingUser) {
        throw new ClientError('User ID already registered in another profile.', 400);
      }

      // Cek apakah no_telepon sudah terdaftar di profil lain
      const existingPhoneNumber = await this._service.checkPhoneNumberExists(no_telepon);
      if (existingPhoneNumber) {
        throw new ClientError('The phone number is already used in another profile.', 400);
      }

      const konselor = await this._service.create({
        nip, nama_lengkap, spesialisasi, no_telepon, user_id, created_by: createdBy
      });

      const response = h.response({
        status: 'success',
        message: 'Profil konselor berhasil dibuat',
        data: {
          konselor,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async updateKonselorProfilHandler(request, h) {
    try {
      const { id } = request.params;
      this._validator.validateUpdatePayload(request.payload);
      const { nip, nama_lengkap, spesialisasi, no_telepon } = request.payload;

      const updatedBy = request.auth.credentials.jwt.user.id;

      const konselor = await this._service.update(id, {
        nip, nama_lengkap, spesialisasi, no_telepon, updated_by: updatedBy
      });

      return {
        status: 'success',
        message: 'Profil konselor berhasil diperbarui',
        data: {
          konselor,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async deleteKonselorProfilHandler(request, h) {
    try {
      const { id } = request.params;
      const { deleted_by } = request.payload;

      const konselor = await this._service.softDelete(id, deleted_by);

      return {
        status: 'success',
        message: 'Profil konselor berhasil dihapus',
        data: {
          konselor,
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

module.exports = KonselorProfilHandler;
