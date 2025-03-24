const ClientError = require("../../exceptions/ClientError");

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    this.getUsersByEmailHandler = this.getUsersByEmailHandler.bind(this);
  }

  async postUserHandler(request, h) {
    try {
      this._validator.validateUserPayload(request.payload);
      const { email, password, roleId } = request.payload;

      const userId = await this._service.addUser({ email, password, roleId });

      return h.response({
        status: "success",
        message: "User successfully added",
        data: { userId },
      }).code(201);
    } catch (error) {
      return this._handleError(error, h, "Failed to add user");
    }
  }

  async getUserByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const user = await this._service.getUserById(id);

      return {
        status: "success",
        data: { user },
      };
    } catch (error) {
      return this._handleError(error, h, "Failed to retrieve user by ID");
    }
  }

  async getUsersByEmailHandler(request, h) {
    try {
      const { email = "" } = request.query;
      const users = await this._service.getUsersByEmail(email);

      return {
        status: "success",
        data: { users },
      };
    } catch (error) {
      return this._handleError(error, h, "Failed to retrieve users by email");
    }
  }

  _handleError(error, h, defaultMessage) {
    if (error instanceof ClientError) {
      return h.response({
        status: "fail",
        message: error.message,
      }).code(error.statusCode);
    }

    console.error(error);
    return h.response({
      status: "error",
      message: `${defaultMessage}. An unexpected server error occurred.`,
    }).code(500);
  }
}

module.exports = UsersHandler;
