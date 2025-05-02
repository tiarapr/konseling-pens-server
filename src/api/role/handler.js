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
    this._validator.validateRolePayload(request.payload);

    const { role_name } = request.payload;
    const role = await this._roleService.addRole({ role_name });

    return h.response({
      status: "success",
      message: "Role successfully added",
      data: { role },
    }).code(201);
  }

  async getRoleHandler(request, h) {
    const role = await this._roleService.getRole();
    return {
      status: "success",
      data: { role },
    };
  }

  async getRoleByIdHandler(request, h) {
    const { id } = request.params;
    const role = await this._roleService.getRoleById(id);

    return {
      status: "success",
      data: { role },
    };
  }

  async updateRoleHandler(request, h) {
    // Validate the payload (e.g., check that `role_name` is provided)
    this._validator.validateRolePayload(request.payload);

    const { id } = request.params;
    const { role_name } = request.payload;

    // Call the RoleService to update the role
    const updatedRole = await this._roleService.updateRole(id, { role_name });

    return h.response({
      status: "success",
      message: "Role successfully updated",
      data: { role: updatedRole },
    }).code(200);
  }

  async deleteRoleHandler(request, h) {
    const { id } = request.params;
    await this._roleService.deleteRole(id);

    return {
      status: "success",
      message: "Role successfully deleted",
    };
  }
}

module.exports = RoleHandler;
