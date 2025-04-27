const ClientError = require('../../exceptions/ClientError');

class AdminProfilHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.getAdminProfilHandler = this.getAdminProfilHandler.bind(this);
    this.getAdminProfilByIdHandler = this.getAdminProfilByIdHandler.bind(this);
    this.postAdminProfilHandler = this.postAdminProfilHandler.bind(this);
    this.updateAdminProfilHandler = this.updateAdminProfilHandler.bind(this);
    this.deleteAdminProfilHandler = this.deleteAdminProfilHandler.bind(this);
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
      this._validator.validateCreatePayload(request.payload);
      const { nama_lengkap, no_telepon, user_id, created_by } = request.payload;

      const result = await this._service.create({ nama_lengkap, no_telepon, user_id, created_by });

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
      const { nama_lengkap, no_telepon, updated_by } = request.payload;

      const result = await this._service.update(id, { nama_lengkap, no_telepon, updated_by });
[]
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
      const { deleted_by } = request.payload;

      const result = await this._service.softDelete(id, deleted_by);

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
