const ClientError = require('../../exceptions/ClientError');

class KemahasiswaanProfilHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.getKemahasiswaanProfilHandler = this.getKemahasiswaanProfilHandler.bind(this);
    this.getKemahasiswaanProfilByIdHandler = this.getKemahasiswaanProfilByIdHandler.bind(this);
    this.getKemahasiswaanProfilByUserIdHandler = this.getKemahasiswaanProfilByUserIdHandler.bind(this);
    this.postKemahasiswaanProfilHandler = this.postKemahasiswaanProfilHandler.bind(this);
    this.updateKemahasiswaanProfilHandler = this.updateKemahasiswaanProfilHandler.bind(this);
    this.deleteKemahasiswaanProfilHandler = this.deleteKemahasiswaanProfilHandler.bind(this);
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

  async postKemahasiswaanProfilHandler(request, h) {
    try {
      this._validator.validateCreatePayload(request.payload);
      const { nip, nama_lengkap, jabatan, no_telepon, user_id } = request.payload;

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

      const profil = await this._service.create({
        nip, nama_lengkap, jabatan, no_telepon, user_id, created_by: createdBy,
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

  async updateKemahasiswaanProfilHandler(request, h) {
    try {
      const { id } = request.params;
      this._validator.validateUpdatePayload(request.payload);
      const { nip, nama_lengkap, jabatan, no_telepon } = request.payload;

      const updatedBy = request.auth.credentials.jwt.user.id;

      const profil = await this._service.update(id, {
        nip, nama_lengkap, jabatan, no_telepon, updated_by: updatedBy
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

      const profil = await this._service.softDelete(id, deletedBy);

      return {
        status: 'success',
        message: 'Profil kemahasiswaan berhasil dihapus',
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
