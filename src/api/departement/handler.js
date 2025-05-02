const ClientError = require('../../exceptions/ClientError');

class DepartementHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.getDepartementsHandler = this.getDepartementsHandler.bind(this);
    this.getDepartementByIdHandler = this.getDepartementByIdHandler.bind(this);
    this.postDepartementHandler = this.postDepartementHandler.bind(this);
    this.updateDepartementHandler = this.updateDepartementHandler.bind(this);
    this.deleteDepartementHandler = this.deleteDepartementHandler.bind(this);
  }

  async getDepartementsHandler(request, h) {
    try {
      const departements = await this._service.getAll();
      return {
        status: 'success',
        data: {
          departements,
        },
      };
    } catch (error) {
      return this._handleServerError(h, error);
    }
  }

  async getDepartementByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const departement = await this._service.getById(id);
      return {
        status: 'success',
        data: {
          departement,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async postDepartementHandler(request, h) {
    try {
      this._validator.validateDepartementPayload(request.payload);
      const { name } = request.payload;

      const createdBy = request.auth.credentials.jwt.user.id;

      const result = await this._service.create({ name, created_by: createdBy });

      const response = h.response({
        status: 'success',
        message: 'Departemen berhasil ditambahkan',
        data: {
          departement: result,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async updateDepartementHandler(request, h) {
    try {
      const { id } = request.params;
      this._validator.validateDepartementPayload(request.payload);
      const { name } = request.payload;

      const updatedBy = request.auth.credentials.jwt.user.id;

      const result = await this._service.update(id, { name, updated_by: updatedBy });

      return {
        status: 'success',
        message: 'Departemen berhasil diperbarui',
        data: {
          departement: result,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async deleteDepartementHandler(request, h) {
    try {
      const { id } = request.params;

      const deletedBy = request.auth.credentials.jwt.user.id;

      const result = await this._service.softDelete(id, deletedBy);

      return {
        status: 'success',
        message: 'Departemen berhasil dihapus',
        data: {
          departement: result,
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

module.exports = DepartementHandler;
