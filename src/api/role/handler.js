const ClientError = require('./../../exceptions/ClientError');

class RoleHandler {
  constructor(roleService, validator) {
    this._roleService = roleService;
    this._validator = validator;

    this.addRoleHandler = this.addRoleHandler.bind(this);
    this.getRoleHandler = this.getRoleHandler.bind(this);
    this.getRoleByIdHandler = this.getRoleByIdHandler.bind(this);
    this.deleteRoleHandler = this.deleteRoleHandler.bind(this);
    this.updateRoleHandler = this.updateRoleHandler.bind(this);
  }

  async addRoleHandler(request, h) {
    try {
      this._validator.validateRolePayload(request.payload);

      const { role_name } = request.payload;
      const role = await this._roleService.addRole({ role_name });

      return h.response({
        status: 'success',
        message: 'Role successfully added',
        data: { role },
      }).code(201);
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  async getRoleHandler(request, h) {
    try {
      const role = await this._roleService.getRole();
      return {
        status: 'success',
        data: { role },
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  async getRoleByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const role = await this._roleService.getRoleById(id);

      return {
        status: 'success',
        data: { role },
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  async updateRoleHandler(request, h) {
    try {
      this._validator.validateRolePayload(request.payload);

      const { id } = request.params;
      const { role_name } = request.payload;

      const updatedRole = await this._roleService.updateRole(id, { role_name });

      return h.response({
        status: 'success',
        message: 'Role successfully updated',
        data: { role: updatedRole },
      }).code(200);
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  async deleteRoleHandler(request, h) {
    try {
      const { id } = request.params;
      await this._roleService.deleteRole(id);

      return {
        status: 'success',
        message: 'Role successfully deleted',
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  _handleError(error, h) {
    if (error instanceof ClientError) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(error.statusCode);
    }

    console.error(error);

    return h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    }).code(500);
  }
}

module.exports = RoleHandler;
