const ClientError = require('../../exceptions/ClientError');

class AdminProfilHandler {
  constructor(service, userService, roleService, emailVerificationService, mailSender, fileStorageService, validator) {
    this._service = service;
    this._userService = userService;
    this._roleService = roleService;
    this._emailVerificationService = emailVerificationService;
    this._mailSender = mailSender;
    this._fileStorageService = fileStorageService;
    this._validator = validator;

    this.createAdminAccountHandler = this.createAdminAccountHandler.bind(this);
    this.updateAdminAccountHandler = this.updateAdminAccountHandler.bind(this);
    this.deleteAdminAccountHandler = this.deleteAdminAccountHandler.bind(this);
    this.restoreAdminAccountHandler = this.restoreAdminAccountHandler.bind(this);
    this.getAdminAccountByUserIdHandler = this.getAdminAccountByUserIdHandler.bind(this);

    this.getAdminProfilWithAccountHandler = this.getAdminProfilWithAccountHandler.bind(this);
    this.getOwnAdminProfilHandler = this.getOwnAdminProfilHandler.bind(this);
    this.getAdminProfilHandler = this.getAdminProfilHandler.bind(this);
    this.getAdminProfilByIdHandler = this.getAdminProfilByIdHandler.bind(this);
    this.updateAdminProfilHandler = this.updateAdminProfilHandler.bind(this);
    this.postAdminProfilHandler = this.postAdminProfilHandler.bind(this);
    this.uploadAdminPhotoHandler = this.uploadAdminPhotoHandler.bind(this);
  }

  // ========== ADMIN ACCOUNT ==========

  async createAdminAccountHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN');

      this._validator.validateCreateAccountPayload(request.payload);
      const { email, phoneNumber, password, nama_lengkap } = request.payload;

      const role = await this._roleService.getRoleByName('admin');
      const roleId = role.id;
      const createdBy = request.auth.credentials.jwt.user.id;

      const userId = await this._userService.addUser(client, {
        email,
        phoneNumber,
        password,
        isVerified: false,
        roleId,
        createdBy,
      });

      const adminProfil = await this._service.create(client, {
        nama_lengkap,
        user_id: userId,
        created_by: createdBy,
      });

      const verificationToken = await this._emailVerificationService.generateToken(client, userId);
      await this._mailSender.sendVerificationEmail(email, verificationToken);

      await client.query('COMMIT');

      return h.response({
        status: 'success',
        message: 'Admin account created successfully. Please ensure the user verifies their account via the email sent.',
        data: { adminProfil },
      }).code(201);

    } catch (error) {
      await client.query('ROLLBACK');
      return this._handleError(h, error);
    } finally {
      client.release();
    }
  }

  async getAdminAccountByUserIdHandler(request, h) {
    try {
      const { userId } = request.params;
      const admin = await this._service.getAdminAccountByUserId(userId);

      return {
        status: 'success',
        data: {
          admin,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async updateAdminAccountHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN');

      this._validator.validateUpdateAccountPayload(request.payload);

      const { id } = request.params;
      const { email, phoneNumber, password, nama_lengkap } = request.payload;
      const updatedBy = request.auth.credentials.jwt.user.id;

      const adminProfil = await this._service.getById(id);
      if (!adminProfil) {
        throw new ClientError('Profil admin tidak ditemukan.', 404);
      }

      const userId = adminProfil.user_id;

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

      const updatedProfile = await this._service.update(id, {
        nama_lengkap,
        updated_by: updatedBy,
      }, client);

      await client.query('COMMIT');

      const responseMessage = userUpdateResult.emailUpdated
        ? 'Admin account updated successfully. Please ensure the user verifies their account via the email sent.'
        : 'Admin account updated successfully';

      return h.response({
        status: 'success',
        message: responseMessage,
        data: {
          adminProfil: updatedProfile,
        },
      }).code(200);
    } catch (error) {
      await client.query('ROLLBACK');
      return this._handleError(h, error);
    } finally {
      client.release();
    }
  }

  async deleteAdminAccountHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      const { id } = request.params;
      const deletedBy = request.auth.credentials.jwt.user.id;

      const adminProfil = await this._service.getById(id);
      const userId = adminProfil.user_id;

      await client.query('BEGIN');

      const result = await this._service.softDelete(client, id, deletedBy);
      await this._userService.deleteUser(client, userId, deletedBy);

      await client.query('COMMIT');

      return {
        status: 'success',
        message: 'Profil dan akun admin berhasil dihapus',
        data: { result },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      return this._handleError(h, error);
    } finally {
      client.release();
    }
  }

  async restoreAdminAccountHandler(request, h) {
    const client = await this._service.getDatabaseClient();

    try {
      await client.query('BEGIN')

      const { id } = request.params;
      const restoredBy = request.auth.credentials.jwt.user.id;

      const result = await this._service.restore(client, id, restoredBy);
      await this._userService.restoreUser(client, result.user_id, restoredBy);

      await client.query('COMMIT')

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

  // ========== ADMIN PROFIL ==========

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

  async getAdminProfilWithAccountHandler(request, h) {
    try {
      const admins = await this._service.getAllAdminWithAccount();
      return {
        status: 'success',
        data: { admins },
      };
    } catch (error) {
      return this._handleServerError(h, error);
    }
  }

  async postAdminProfilHandler(request, h) {
    try {
      this._validator.validateCreateProfilePayload(request.payload);
      const { nama_lengkap, user_id } = request.payload;
      const createdBy = request.auth.credentials.jwt.user.id;

      const existingUser = await this._service.checkUserIdExists(user_id);
      if (existingUser) {
        throw new ClientError('User ID sudah terdaftar di profil lain.', 400);
      }

      const result = await this._service.create(this._service._pool, { nama_lengkap, user_id, created_by: createdBy });

      return h.response({
        status: 'success',
        message: 'Profil admin berhasil ditambahkan',
        data: { adminProfil: result },
      }).code(201);
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async uploadAdminPhotoHandler(request, h) {
    const client = await this._service.getDatabaseClient();
    try {
      await client.query('BEGIN')

      const { id } = request.params;
      const { photo } = request.payload;

      if (!photo || !photo.hapi || !photo.hapi.filename) {
        throw new ClientError('File foto tidak ditemukan atau tidak valid.');
      }

      const savedFile = await this._fileStorageService.saveAdminPhotoFile(photo);

      const updatedProfile = await this._service.update(id, {
        photo_url: savedFile.url,
        updated_by: request.auth.credentials.jwt.user.id,
      }, client);

      await client.query('COMMIT')

      return h.response({
        status: 'success',
        message: 'Foto profil admin berhasil diupload',
        data: { adminProfil: updatedProfile },
      }).code(200);
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async getAdminProfilHandler(request, h) {
    try {
      const admins = await this._service.getAll();
      return {
        status: 'success',
        data: { admins },
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
        data: { adminProfil },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async updateAdminProfilHandler(request, h) {
    try {
      const client = await this._service.getDatabaseClient();

      await client.query('BEGIN')

      const { id } = request.params;
      this._validator.validateUpdatePayload(request.payload);
      const { nama_lengkap } = request.payload;
      const updatedBy = request.auth.credentials.jwt.user.id;

      const result = await this._service.update(id, { nama_lengkap, updated_by: updatedBy }, client);

      await client.query('COMMIT')

      return {
        status: 'success',
        message: 'Profil admin berhasil diperbarui',
        data: { adminProfil: result },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  // ========== ERROR HANDLING ==========

  _handleError(h, error) {
    if (error instanceof ClientError) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(error.statusCode);
    }

    return this._handleServerError(h, error);
  }

  _handleServerError(h, error) {
    console.error(error);
    return h.response({
      status: 'error',
      message: 'Sorry, there was an error on the server.',
    }).code(500);
  }
}

module.exports = AdminProfilHandler;
