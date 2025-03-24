class RolesHandler {
    constructor(rolesService, validator) {
      this._rolesService = rolesService;
      this._validator = validator;
  
      this.addRoleHandler = this.addRoleHandler.bind(this);
      this.getRolesHandler = this.getRolesHandler.bind(this);
      this.getRoleByIdHandler = this.getRoleByIdHandler.bind(this);
      this.deleteRoleHandler = this.deleteRoleHandler.bind(this);
    }
  
    async addRoleHandler(request, h) {
      this._validator.validateRolePayload(request.payload);
  
      const { role_name } = request.payload;
      const roleId = await this._rolesService.addRole({ role_name });
  
      return h.response({
        status: "success",
        message: "Role successfully added",
        data: { roleId },
      }).code(201);
    }
  
    async getRolesHandler(request, h) {
      const roles = await this._rolesService.getRoles();
      return {
        status: "success",
        data: { roles },
      };
    }
  
    async getRoleByIdHandler(request, h) {
      const { id } = request.params;
      const role = await this._rolesService.getRoleById(id);
  
      return {
        status: "success",
        data: { role },
      };
    }
  
    async deleteRoleHandler(request, h) {
      const { id } = request.params;
      await this._rolesService.deleteRole(id);
  
      return {
        status: "success",
        message: "Role successfully deleted",
      };
    }
  }
  
  module.exports = RolesHandler;
  