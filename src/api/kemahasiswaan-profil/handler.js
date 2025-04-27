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
      const { nip, nama_lengkap, jabatan, no_telepon, user_id, created_by } = request.payload;

      const profil = await this._service.create({
        nip, nama_lengkap, jabatan, no_telepon, user_id, created_by,
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
      const { nip, nama_lengkap, jabatan, no_telepon, updated_by } = request.payload;

      const profil = await this._service.update(id, {
        nip, nama_lengkap, jabatan, no_telepon, updated_by,
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
      const { deleted_by } = request.payload;

      const profil = await this._service.softDelete(id, deleted_by);

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
