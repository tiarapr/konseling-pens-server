const InvariantError = require("../../exceptions/InvariantError");
const { CreatePermissionPayloadSchema, UpdatePermissionPayloadSchema } = require("./schema");

const PermissionValidator = {
  validateCreatePayload: (payload) => {
    const validationResult = CreatePermissionPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  
  validateUpdatePayload: (payload) => {
    const validationResult = UpdatePermissionPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PermissionValidator;
