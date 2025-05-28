const ClientError = require('../../exceptions/ClientError');

class KemahasiswaanProfilHandler {
  constructor(service, userService, emailVerificationService, mailSender, fileStorageService, validator) {
    this._service = service;
    this._userService = userService;
    this._emailVerificationService = emailVerificationService;
    this._mailSender = mailSender;
    this._validator = validator;
    this._fileStorageService = fileStorageService;

    this.getKemahasiswaanProfilHandler = this.getKemahasiswaanProfilHandler.bind(this);
    this.getKemahasiswaanProfilByIdHandler = this.getKemahasiswaanProfilByIdHandler.bind(this);
    this.getKemahasiswaanProfilByUserIdHandler = this.getKemahasiswaanProfilByUserIdHandler.bind(this);
    this.createKemahasiswaanAccountHandler = this.createKemahasiswaanAccountHandler.bind(this);
    this.postKemahasiswaanProfilHandler = this.postKemahasiswaanProfilHandler.bind(this);
    this.uploadKemahasiswaanPhotoHandler = this.uploadKemahasiswaanPhotoHandler.bind(this);
    this.updateKemahasiswaanProfilHandler = this.updateKemahasiswaanProfilHandler.bind(this);
    this.deleteKemahasiswaanProfilHandler = this.deleteKemahasiswaanProfilHandler.bind(this);
    this.restoreKemahasiswaanProfilHandler = this.restoreKemahasiswaanProfilHandler.bind(this);
  }

  async createKemahasiswaanAccountHandler(request, h) {
    this._validator.validateCreateAccountPayload(request.payload);
    const { email, phoneNumber, password, roleId, nip, nama_lengkap, jabatan } = request.payload;
    console.log('Creating Kemahasiswaan account with payload:', request.payload);

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

      // Langkah 2: Setelah user dibuat, buat profil kemahasiswaan
      const kemahasiswaanProfile = await this._service.create({
        nip, nama_lengkap, jabatan, user_id: userId, created_by: createdBy,
      });

      const response = h.response({
        status: 'success',
        message: 'Kemahasiswaan account created successfully. Please ensure the user verifies their account via the email sent.',
        data: {
          kemahasiswaanProfile,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async uploadKemahasiswaanPhotoHandler(request, h) {
    try {
      const { id } = request.params;
      const { photo } = request.payload;

      if (!photo || !photo.hapi || !photo.hapi.filename) {
        throw new ClientError('File foto tidak ditemukan atau tidak valid.');
      }

      // Simpan file foto 
      const savedFile = await this._fileStorageService.saveKemahasiswaanPhotoFile(photo);

      // Update profil konselor dengan URL foto yang baru
      const updatedProfile = await this._service.update(id, {
        photo_url: savedFile.url,
        updated_by: request.auth.credentials.jwt.user.id,
      });

      const response = h.response({
        status: 'success',
        message: 'Foto profil kemahasiswaan berhasil diupload',
        data: {
          kemahasiswaanProfil: updatedProfile,
        },
      });
      response.code(200);
      return response;
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async postKemahasiswaanProfilHandler(request, h) {
    try {
      this._validator.validateCreatePayload(request.payload);
      const { nip, nama_lengkap, jabatan, user_id } = request.payload;

      const createdBy = request.auth.credentials.jwt.user.id;

      // Cek apakah user_id sudah terdaftar di profil lain
      const existingUser = await this._service.checkUserIdExists(user_id);
      if (existingUser) {
        throw new ClientError('User ID already registered in another profile.', 400);
      }

      const profil = await this._service.create({
        nip, nama_lengkap, jabatan, user_id, created_by: createdBy,
      });

      const response = h.response({
        status: 'success',
        message: 'Profil kemahasiswaan berhasil ditambahkan',
        data: {
          profil,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async getKemahasiswaanProfilHandler(request, h) {
    try {
      const profils = await this._service.getAll();
      return {
        status: 'success',
        data: {
          profils,
        },
      };
    } catch (error) {
      return this._handleServerError(h, error);
    }
  }

  async getKemahasiswaanProfilByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const profil = await this._service.getById(id);
      return {
        status: 'success',
        data: {
          profil,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async getKemahasiswaanProfilByUserIdHandler(request, h) {
    try {
      const { userId } = request.params;
      const profil = await this._service.getByUserId(userId);
      return {
        status: 'success',
        data: {
          profil,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async updateKemahasiswaanProfilHandler(request, h) {
    try {
      const { id } = request.params;
      this._validator.validateUpdatePayload(request.payload);
      const { nip, nama_lengkap, jabatan } = request.payload;

      const updatedBy = request.auth.credentials.jwt.user.id;

      const profil = await this._service.update(id, {
        nip, nama_lengkap, jabatan, updated_by: updatedBy
      });

      return {
        status: 'success',
        message: 'Profil kemahasiswaan berhasil diperbarui',
        data: {
          profil,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async deleteKemahasiswaanProfilHandler(request, h) {
    try {
      const { id } = request.params;

      const deletedBy = request.auth.credentials.jwt.user.id;

      // Langkah 1: Ambil profil kemahasiswaan terlebih dahulu
      const profil = await this._service.getById(id);
      const userId = profil.user_id;

      // Langkah 2: Hapus profil kemahasiswaan (soft delete)
      const result = await this._service.softDelete(id, deletedBy);

      // Langkah 3: Hapus user beserta role_user-nya (soft delete + hapus relasi)
      await this._userService.deleteUser(userId, deletedBy);

      return {
        status: 'success',
        message: 'Profil kemahasiswaan berhasil dihapus',
        data: {
          result,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async restoreKemahasiswaanProfilHandler(request, h) {
    try {
      const { id } = request.params;

      const restoredBy = request.auth.credentials.jwt.user.id;

      // Langkah 1: Restore profil kemahasiswaan
      const result = await this._service.restore(id, restoredBy);

      // Langkah 2: Restore user (soft delete)
      await this._userService.restoreUser(result.user_id, restoredBy);

      return {
        status: 'success',
        message: 'Profil kemahasiswaan berhasil dipulihkan',
        data: {
          result,
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

module.exports = KemahasiswaanProfilHandler;
