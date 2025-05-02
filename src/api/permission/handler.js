const ClientError = require('../../exceptions/ClientError');

class PermissionHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.getPermissionsHandler = this.getPermissionsHandler.bind(this);
    this.getPermissionByIdHandler = this.getPermissionByIdHandler.bind(this);
    this.postPermissionHandler = this.postPermissionHandler.bind(this);
    this.putPermissionHandler = this.putPermissionHandler.bind(this);
    this.deletePermissionHandler = this.deletePermissionHandler.bind(this);
  }

  async getPermissionsHandler(request, h) {
    try {
      const permissions = await this._service.getAll();
      return {
        status: 'success',
        data: {
          permissions,
        },
      };
    } catch (error) {
      return this._handleServerError(h, error);
    }
  }

  async getPermissionByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const permission = await this._service.getById(id);
      return {
        status: 'success',
        data: {
          permission,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async postPermissionHandler(request, h) {
    try {
      this._validator.validatePermissionPayload(request.payload);
      const { name } = request.payload;

      const createdBy = request.auth.credentials.jwt.user.id;

      const result = await this._service.create({ name, created_by: createdBy });

      const response = h.response({
        status: 'success',
        message: 'Permission berhasil ditambahkan',
        data: {
          permission: result,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async putPermissionHandler(request, h) {
    try {
      this._validator.validatePermissionPayload(request.payload);
      const { id } = request.params;
      const { name } = request.payload;

      const updatedBy = request.auth.credentials.jwt.user.id;

      const result = await this._service.update(id, { name, updated_by: updatedBy });

      return {
        status: 'success',
        message: 'Permission berhasil diperbarui',
        data: {
          permission: result,
        },
      };
    } catch (error) {
      return this._handleError(h, error);
    }
  }

  async deletePermissionHandler(request, h) {
    try {
      const { id } = request.params;
      const deletedBy = request.auth.credentials.jwt.user.id;
  
      const result = await this._service.softDelete(id, deletedBy);  
      
      return {
        status: 'success',
        message: 'Permission berhasil dihapus',
        data: {
          permission: result,
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

module.exports = PermissionHandler;
