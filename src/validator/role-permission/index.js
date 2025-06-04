const InvariantError = require("../../exceptions/InvariantError");
const { RolePermissionPayloadSchema } = require("./schema");

const PermissionValidator = {
  validateRolePermissionPayload: (payload) => {
    const validationResult = RolePermissionPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PermissionValidator;
