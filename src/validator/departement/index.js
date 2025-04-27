const InvariantError = require("../../exceptions/InvariantError");
const {
  CreateDepartementPayloadSchema,
  UpdateDepartementPayloadSchema,
} = require("./schema");

const DepartementValidator = {
  validateCreatePayload: (payload) => {
    const validationResult = CreateDepartementPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateUpdatePayload: (payload) => {
    const validationResult = UpdateDepartementPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = DepartementValidator;
