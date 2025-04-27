const InvariantError = require("../../exceptions/InvariantError");
const {
  CreateTopikPayloadSchema,
  UpdateTopikPayloadSchema,
} = require("./schema");

const TopikValidator = {
  validateCreatePayload: (payload) => {
    const validationResult = CreateTopikPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateUpdatePayload: (payload) => {
    const validationResult = UpdateTopikPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = TopikValidator;
