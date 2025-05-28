const ClientError = require('../../exceptions/ClientError');

class AdminProfilHandler {
  constructor(service, userService, emailVerificationService, mailSender, fileStorageService, validator) {
    this._service = service;
    this._userService = userService;
    this._emailVerificationService = emailVerificationService;
    this._mailSender = mailSender;
    this._fileStorageService = fileStorageService;
    this._validator = validator;

    this.getAdminProfilHandler = this.getAdminProfilHandler.bind(this);
    this.getAdminProfilByIdHandler = this.getAdminProfilByIdHandler.bind(this);
    this.getOwnAdminProfilHandler = this.getOwnAdminProfilHandler.bind(this);
    this.createAdminAccountHandler = this.createAdminAccountHandler.bind(this);
    this.postAdminProfilHandler = this.postAdminProfilHandler.bind(this);
    this.updateAdminProfilHandler = this.updateAdminProfilHandler.bind(this);
    this.deleteAdminProfilHandler = this.deleteAdminProfilHandler.bind(this);
    this.restoreAdminProfilHandler = this.restoreAdminProfilHandler.bind(this);
    this.uploadAdminPhotoHandler = this.uploadAdminPhotoHandler.bind(this);
  }

  async createAdminAccountHandler(request, h) {
    this._validator.validateCreateAccountPayload(request.payload);
    const { email, phoneNumber, password, roleId, nama_lengkap } = request.payload;

    try {
      const createdBy = request.auth.credentials.jwt.user.id;

      // Langkah 1: Buat akun user terlebih dahulu
      const userId = await this._userService.addUser({
        email,
        phoneNumber,
        password,
        isVerified: false,
        roleId,
        createdBy
      });

      // Generate verification token
      const verificationToken = await this._emailVerificationService.generateToken(userId);

      // Send verification email
      await this._mailSender.sendVerificationEmail(email, verificationToken);

      // Langkah 2: Setelah user dibuat, buat profil admin
      const adminProfile = await this._service.create({
        nama_lengkap, user_id: userId, created_by: createdBy
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

  async getOwnAdminProfilHandler(request, h) {
    try {
      const userId = request.auth.credentials.jwt.user.id;
      const profile = await this._service.getByUserId(userId);

      if (!profile) {
        return h.response({
          status: 'fail',
          message: 'Profil admin tidak ditemukan',
        }).code(404);
      }

      return {
        status: 'success',
        data: {
          adminProfil: profile,
        },
      };
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
      const { nama_lengkap, user_id } = request.payload;

      const createdBy = request.auth.credentials.jwt.user.id;

      // Cek apakah user_id sudah terdaftar di profil lain
      const existingUser = await this._service.checkUserIdExists(user_id);
      if (existingUser) {
        throw new ClientError('User ID sudah terdaftar di profil lain.', 400);
      }

      const result = await this._service.create({ nama_lengkap, user_id, created_by: createdBy });

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

  async uploadAdminPhotoHandler(request, h) {
    try {
      const { id } = request.params;
      const { photo } = request.payload;

      if (!photo || !photo.hapi || !photo.hapi.filename) {
        throw new ClientError('File foto tidak ditemukan atau tidak valid.');
      }

      // Simpan file foto 
      const savedFile = await this._fileStorageService.saveAdminPhotoFile(photo);

      // Update profil admin dengan URL foto yang baru
      const updatedProfile = await this._service.update(id, {
        photo_url: savedFile.url,
        updated_by: request.auth.credentials.jwt.user.id,
      });

      const response = h.response({
        status: 'success',
        message: 'Foto profil admin berhasil diupload',
        data: {
          adminProfil: updatedProfile,
        },
      });
      response.code(200);
      return response;
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async updateAdminProfilHandler(request, h) {
    try {
      const { id } = request.params;
      this._validator.validateUpdatePayload(request.payload);
      const { nama_lengkap } = request.payload;

      const updatedBy = request.auth.credentials.jwt.user.id;

      const result = await this._service.update(id, { nama_lengkap, updated_by: updatedBy });

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

      // Langkah 1: Ambil profil admin terlebih dahulu
      const adminProfile = await this._service.getById(id);
      const userId = adminProfile.user_id;

      // Langkah 2: Hapus profil admin (soft delete)
      const result = await this._service.softDelete(id, deletedBy);

      // Langkah 3: Hapus user beserta role_user-nya (soft delete + hapus relasi)
      await this._userService.deleteUser(userId, deletedBy);

      return {
        status: 'success',
        message: 'Profil dan akun admin berhasil dihapus',
        data: {
          result
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async restoreAdminProfilHandler(request, h) {
    try {
      const { id } = request.params;
      const restoredBy = request.auth.credentials.jwt.user.id;

      // Langkah 1: Restore profil admin
      const result = await this._service.restore(id, restoredBy);

      // Langkah 2: Restore user
      await this._userService.restoreUser(result.user_id, restoredBy);

      return {
        status: 'success',
        message: 'Profil admin berhasil dipulihkan',
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
