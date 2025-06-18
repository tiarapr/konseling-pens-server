const ClientError = require('../../exceptions/ClientError');

class KemahasiswaanProfilHandler {
  constructor(service, userService, roleService, emailVerificationService, mailSender, fileStorageService, validator) {
    this._service = service;
    this._userService = userService;
    this._roleService = roleService;
    this._emailVerificationService = emailVerificationService;
    this._mailSender = mailSender;
    this._validator = validator;
    this._fileStorageService = fileStorageService;

    this.createKemahasiswaanAccountHandler = this.createKemahasiswaanAccountHandler.bind(this);
    this.getKemahasiswaanAccountByUserIdHandler = this.getKemahasiswaanAccountByUserIdHandler.bind(this);
    this.updateKemahasiswaanAccountHandler = this.updateKemahasiswaanAccountHandler.bind(this);
    this.deleteKemahasiswaanAccountHandler = this.deleteKemahasiswaanAccountHandler.bind(this);
    this.restoreKemahasiswaanAccountHandler = this.restoreKemahasiswaanAccountHandler.bind(this);

    this.getOwnKemahasiswaanProfilHandler = this.getOwnKemahasiswaanProfilHandler.bind(this);
    this.getKemahasiswaanProfilHandler = this.getKemahasiswaanProfilHandler.bind(this);
    this.getKemahasiswaanProfilByIdHandler = this.getKemahasiswaanProfilByIdHandler.bind(this);
    this.getKemahasiswaanProfilByUserIdHandler = this.getKemahasiswaanProfilByUserIdHandler.bind(this);
    this.getKemahasiswaanProfilWithAccountHandler = this.getKemahasiswaanProfilWithAccountHandler.bind(this);
    this.postKemahasiswaanProfilHandler = this.postKemahasiswaanProfilHandler.bind(this);
    this.uploadKemahasiswaanPhotoHandler = this.uploadKemahasiswaanPhotoHandler.bind(this);
    this.updateKemahasiswaanProfilHandler = this.updateKemahasiswaanProfilHandler.bind(this);
    this.updateMyProfilHandler = this.updateMyProfilHandler.bind(this);
  }

  // KEMAHASISWAAN ACCOUNT
  async createKemahasiswaanAccountHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN')

      this._validator.validateCreateAccountPayload(request.payload);
      const { email, phoneNumber, password, nip, nama_lengkap, jabatan } = request.payload;

      const role = await this._roleService.getRoleByName('kemahasiswaan');
      const roleId = role.id;
      const createdBy = request.auth.credentials.jwt.user.id;

      // Langkah 1: Buat akun user terlebih dahulu
      const userId = await this._userService.addUser(client, {
        email,
        phoneNumber,
        password,
        isVerified: false,
        roleId,
        createdBy
      });

      // Langkah 2: Setelah user dibuat, buat profil kemahasiswaan
      const kemahasiswaanProfile = await this._service.create(client, {
        nip, nama_lengkap, jabatan, user_id: userId, created_by: createdBy,
      });

      // Generate verification token
      const verificationToken = await this._emailVerificationService.generateToken(client, userId);

      // Send verification email
      await this._mailSender.sendVerificationEmail(email, verificationToken);

      await client.query('COMMIT')

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

  async getKemahasiswaanAccountByUserIdHandler(request, h) {
    try {
      const { userId } = request.params;
      const kemahasiswaan = await this._service.getKemahasiswaanAccountByUserId(userId);

      return {
        status: 'success',
        data: {
          kemahasiswaan,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async updateKemahasiswaanAccountHandler(request, h) {
    const client = await this._userService._pool.connect();

    try {
      await client.query('BEGIN');

      this._validator.validateUpdateAccountPayload(request.payload);

      const { id } = request.params;
      const { email, phoneNumber, password, nama_lengkap, nip, jabatan } = request.payload;
      const updatedBy = request.auth.credentials.jwt.user.id;

      const kemahasiswaanProfile = await this._service.getById(id);
      if (!kemahasiswaanProfile) {
        throw new ClientError('Profil kemahasiswaan tidak ditemukan.', 404);
      }

      const userId = kemahasiswaanProfile.user_id;

      const userUpdateResult = await this._userService.updateUser(userId, {
        email,
        phoneNumber,
        password,
        updatedBy,
      }, client);

      if (userUpdateResult.emailUpdated) {
        const verificationToken = await this._emailVerificationService.generateToken(client, userId);
        await this._mailSender.sendVerificationEmail(email, verificationToken);
      }

      // Update profil kemahasiswaan, termasuk field baru
      const updatedProfile = await this._service.update(id, {
        nama_lengkap,
        nip,
        jabatan,
        updated_by: updatedBy,
      }, client);

      // Ambil data user yang sudah diperbarui
      const updatedUser = await this._userService.getUserById(userId, client);

      await client.query('COMMIT');

      const responseMessage = userUpdateResult.emailUpdated
        ? 'Kemahasiswaan account updated successfully. Please ensure the user verifies their account via the email sent.'
        : 'Kemahasiswaan account updated successfully';

      return h.response({
        status: 'success',
        message: responseMessage,
        data: {
          kemahasiswaanProfil: updatedProfile,
          userAccount: updatedUser
        },
      }).code(200);
    } catch (error) {
      await client.query('ROLLBACK');
      return this._handleError(h, error);
    } finally {
      client.release();
    }
  }

  async deleteKemahasiswaanAccountHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN')

      const { id } = request.params;

      const deletedBy = request.auth.credentials.jwt.user.id;

      // Langkah 1: Ambil profil kemahasiswaan terlebih dahulu
      const profil = await this._service.getById(id);
      const userId = profil.user_id;

      // Langkah 2: Hapus profil kemahasiswaan (soft delete)
      const result = await this._service.softDelete(client, id, deletedBy);

      // Langkah 3: Hapus user beserta role_user-nya (soft delete + hapus relasi)
      await this._userService.deleteUser(client, userId, deletedBy);

      await client.query('COMMIT')

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

  async restoreKemahasiswaanAccountHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN')

      const { id } = request.params;

      const restoredBy = request.auth.credentials.jwt.user.id;

      // Langkah 1: Restore profil kemahasiswaan
      const result = await this._service.restore(client, id, restoredBy);

      // Langkah 2: Restore user (soft delete)
      await this._userService.restoreUser(client, result.user_id, restoredBy);

      await client.query('COMMIT')

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

  // KEMAHASISWAAN PROFIL
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

  async uploadKemahasiswaanPhotoHandler(request, h) {
     const client = await this._service.getDatabaseClient();
    try {
      await client.query('BEGIN')

      const { id } = request.params;
      const { photo } = request.payload;

      if (!photo || !photo.hapi || !photo.hapi.filename) {
        throw new ClientError('File foto tidak ditemukan atau tidak valid.');
      }

      // Simpan file foto 
      const savedFile = await this._fileStorageService.saveKemahasiswaanPhotoFile(photo);

      // Update profil kemahasiswaan dengan URL foto yang baru
      const updatedProfile = await this._service.update(id, {
        photo_url: savedFile.url,
        updated_by: request.auth.credentials.jwt.user.id,
      }, client);

      await client.query('COMMIT')

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

  async getOwnKemahasiswaanProfilHandler(request, h) {
    try {
      const userId = request.auth.credentials.jwt.user.id;
      const profile = await this._service.getByUserId(userId);

      if (!profile) {
        return h.response({
          status: 'fail',
          message: 'Profil kemahasiswaan tidak ditemukan',
        }).code(404);
      }

      return {
        status: 'success',
        data: {
          kemahasiswaanProfil: profile,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async getKemahasiswaanProfilWithAccountHandler(request, h) {
    try {
      const kemahasiswaans = await this._service.getAllKemahasiswaanWithAccount();
      return {
        status: 'success',
        data: {
          kemahasiswaans,
        },
      };
    } catch (error) {
      return this._handleServerError(h, error);
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

  async updateMyProfilHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN')

      const userId = request.auth.credentials.jwt.user.id;
      const profile = await this._service.getByUserId(userId);

      if (!profile || profile.user_id !== userId) {
        throw Boom.forbidden('Tidak bisa mengakses data milik pengguna lain');
      }

      const { id } = request.params;

      this._validator.validateUpdatePayload(request.payload);

      const { nip, nama_lengkap, jabatan } = request.payload;

      const updatedBy = request.auth.credentials.jwt.user.id;

      const profil = await this._service.update(id, {
        nip, nama_lengkap, jabatan, updated_by: updatedBy
      }, client);

      await client.query('COMMIT')
      
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

  async updateKemahasiswaanProfilHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN')

      const { id } = request.params;

      this._validator.validateUpdatePayload(request.payload);

      const { nip, nama_lengkap, jabatan } = request.payload;

      const updatedBy = request.auth.credentials.jwt.user.id;

      const profil = await this._service.update(id, {
        nip, nama_lengkap, jabatan, updated_by: updatedBy
      }, client);

      await client.query('COMMIT')

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
