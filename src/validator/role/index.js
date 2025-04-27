const InvariantError = require("../../exceptions/InvariantError");
const { RolePayloadSchema } = require("./schema");

const RoleValidator = {
  validateRolePayload: (payload) => {
    const validationResult = RolePayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = RoleValidator;
