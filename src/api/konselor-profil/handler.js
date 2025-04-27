const ClientError = require('../../exceptions/ClientError');

class KonselorProfilHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.getKonselorProfilHandler = this.getKonselorProfilHandler.bind(this);
    this.getKonselorProfilByIdHandler = this.getKonselorProfilByIdHandler.bind(this);
    this.getKonselorProfilByUserIdHandler = this.getKonselorProfilByUserIdHandler.bind(this);
    this.postKonselorProfilHandler = this.postKonselorProfilHandler.bind(this);
    this.updateKonselorProfilHandler = this.updateKonselorProfilHandler.bind(this);
    this.deleteKonselorProfilHandler = this.deleteKonselorProfilHandler.bind(this);
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
      this._validator.validateCreatePayload(request.payload);
      const { nip, nama_lengkap, spesialisasi, no_telepon, user_id, created_by } = request.payload;

      const konselor = await this._service.create({
        nip, nama_lengkap, spesialisasi, no_telepon, user_id, created_by,
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
      const { nip, nama_lengkap, spesialisasi, no_telepon, updated_by } = request.payload;

      const konselor = await this._service.update(id, {
        nip, nama_lengkap, spesialisasi, no_telepon, updated_by,
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
