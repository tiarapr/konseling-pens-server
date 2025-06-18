const ClientError = require('../../exceptions/ClientError');

class KonselorProfilHandler {
  constructor(service, userService, roleService, emailVerificationService, mailSender, fileStorageService, validator) {
    this._service = service;
    this._userService = userService;
    this._roleService = roleService;
    this._emailVerificationService = emailVerificationService;
    this._mailSender = mailSender;
    this._fileStorageService = fileStorageService;
    this._validator = validator;

    this.createKonselorAccountHandler = this.createKonselorAccountHandler.bind(this);
    this.getKonselorAccountByUserIdHandler = this.getKonselorAccountByUserIdHandler.bind(this);
    this.updateKonselorAccountHandler = this.updateKonselorAccountHandler.bind(this);
    this.deleteKonselorAccountHandler = this.deleteKonselorAccountHandler.bind(this);
    this.restoreKonselorAccountHandler = this.restoreKonselorAccountHandler.bind(this);

    this.postKonselorProfilHandler = this.postKonselorProfilHandler.bind(this);
    this.uploadKonselorPhotoHandler = this.uploadKonselorPhotoHandler.bind(this);
    this.getOwnKonselorProfilHandler = this.getOwnKonselorProfilHandler.bind(this);
    this.getKonselorProfilWithAccountHandler = this.getKonselorProfilWithAccountHandler.bind(this);
    this.getKonselorProfilHandler = this.getKonselorProfilHandler.bind(this);
    this.getKonselorProfilByIdHandler = this.getKonselorProfilByIdHandler.bind(this);
    this.getKonselorProfilByUserIdHandler = this.getKonselorProfilByUserIdHandler.bind(this);
    this.getKonselorProfilWithAccountHandler = this.getKonselorProfilWithAccountHandler.bind(this);
    this.updateKonselorProfilHandler = this.updateKonselorProfilHandler.bind(this);
  }

  // KONSELOR ACCOUNT
  async createKonselorAccountHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN')

      this._validator.validateCreateAccountPayload(request.payload);
      const { email, phoneNumber, password, sipp, nama_lengkap, spesialisasi } = request.payload;

      const role = await this._roleService.getRoleByName('konselor');
      const roleId = role.id;
      const createdBy = request.auth.credentials.jwt.user.id;

      const userId = await this._userService.addUser(client, {
        email,
        phoneNumber,
        password,
        isVerified: false,
        roleId,
        createdBy
      });

      // Langkah 4: Setelah user dibuat, buat profil konselor
      const konselorProfil = await this._service.create(client, {
        sipp, nama_lengkap, spesialisasi, user_id: userId, created_by: createdBy
      });

      // Generate verification token
      const verificationToken = await this._emailVerificationService.generateToken(client, userId);

      // Send verification email
      await this._mailSender.sendVerificationEmail(email, verificationToken);

      await client.query('COMMIT');

      const response = h.response({
        status: 'success',
        message: 'Konselor account created successfully. Please ensure the user verifies their account via the email sent.',
        data: {
          konselorProfil,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async getKonselorAccountByUserIdHandler(request, h) {
    try {
      const { userId } = request.params;
      const konselor = await this._service.getKonselorAccountByUserId(userId);

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

  async updateKonselorAccountHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN');

      this._validator.validateUpdateAccountPayload(request.payload);

      const { id } = request.params;
      const { email, phoneNumber, password, nama_lengkap, sipp, spesialisasi } = request.payload;
      const updatedBy = request.auth.credentials.jwt.user.id;

      const konselorProfil = await this._service.getById(id);
      if (!konselorProfil) {
        throw new ClientError('Profil konselor tidak ditemukan.', 404);
      }

      const userId = konselorProfil.user_id;

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

      // Update profil konselor, termasuk field baru
      const updatedProfile = await this._service.update(id, {
        nama_lengkap,
        sipp,
        spesialisasi,
        updated_by: updatedBy,
      }, client);

      // Ambil data user yang sudah diperbarui
      const updatedUser = await this._userService.getUserById(userId, client);

      await client.query('COMMIT');

      const responseMessage = userUpdateResult.emailUpdated
        ? 'Konselor account updated successfully. Please ensure the user verifies their account via the email sent.'
        : 'Konselor account updated successfully';

      return h.response({
        status: 'success',
        message: responseMessage,
        data: {
          konselorProfil: updatedProfile,
          userAccount: updatedUser,
        },
      }).code(200);
    } catch (error) {
      await client.query('ROLLBACK');
      return this._handleError(h, error);
    } finally {
      client.release();
    }
  }

  async deleteKonselorAccountHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN')

      const { id } = request.params;

      const deletedBy = request.auth.credentials.jwt.user.id;

      const konselorProfil = await this._service.getById(id);
      const userId = konselorProfil.user_id;

      const result = await this._service.softDelete(client, id, deletedBy);

      await this._userService.deleteUser(client, userId, deletedBy);

      await client.query('COMMIT')

      return {
        status: 'success',
        message: 'Profil dan akun konselor berhasil dihapus',
        data: {
          result,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async restoreKonselorAccountHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN')

      const { id } = request.params;
      const restoredBy = request.auth.credentials.jwt.user.id;

      // Langkah 1: Restore profil konselor
      const result = await this._service.restore(client, id, restoredBy);

      // Langkah 2: Restore user
      await this._userService.restoreUser(client, result.user_id, restoredBy);

      await client.query('COMMIT')

      return {
        status: 'success',
        message: 'Profil Konselor berhasil dipulihkan',
        data: {
          konselorProfil: result,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  // KONSELOR PROFIL
  async postKonselorProfilHandler(request, h) {
    try {
      this._validator.validateCreateProfilePayload(request.payload);
      const { sipp, nama_lengkap, spesialisasi, user_id } = request.payload;

      const createdBy = request.auth.credentials.jwt.user.id;

      // Cek apakah user_id sudah terdaftar di profil lain
      const existingUser = await this._service.checkUserIdExists(user_id);
      if (existingUser) {
        throw new ClientError('User ID already registered in another profile.', 400);
      }

      const konselor = await this._service.create({
        sipp, nama_lengkap, spesialisasi, user_id, created_by: createdBy
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

  async uploadKonselorPhotoHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN')

      const { id } = request.params;
      const { photo } = request.payload;

      if (!photo || !photo.hapi || !photo.hapi.filename) {
        throw new ClientError('File foto tidak ditemukan atau tidak valid.');
      }

      // Simpan file foto 
      const savedFile = await this._fileStorageService.saveKonselorPhotoFile(photo);

      // Update profil konselor dengan URL foto yang baru
      const updatedProfile = await this._service.update(id, {
        photo_url: savedFile.url,
        updated_by: request.auth.credentials.jwt.user.id,
      }, client);

      await client.query('COMMIT')
      
      const response = h.response({
        status: 'success',
        message: 'Foto profil konselor berhasil diupload',
        data: {
          konselorProfil: updatedProfile,
        },
      });
      response.code(200);
      return response;
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async getOwnKonselorProfilHandler(request, h) {
    try {
      const userId = request.auth.credentials.jwt.user.id;
      const profile = await this._service.getByUserId(userId);

      if (!profile) {
        return h.response({
          status: 'fail',
          message: 'Profil Konselor tidak ditemukan',
        }).code(404);
      }

      return {
        status: 'success',
        data: {
          konselorProfil: profile,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async getKonselorProfilWithAccountHandler(request, h) {
    try {
      const konselors = await this._service.getAllKonselorWithAccount();
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

  async updateKonselorProfilHandler(request, h) {
    const client = await this._service.getDatabaseClient();
    
    try {
      await client.query('BEGIN')

      const { id } = request.params;
      this._validator.validateUpdatePayload(request.payload);
      const { sipp, nama_lengkap, spesialisasi, photo_url } = request.payload;

      const updatedBy = request.auth.credentials.jwt.user.id;

      const konselor = await this._service.update(id, {
        sipp, nama_lengkap, spesialisasi, photo_url, updated_by: updatedBy
      }, client);

      await client.query('COMMIT')

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
