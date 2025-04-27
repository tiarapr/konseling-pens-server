const InvariantError = require("../../exceptions/InvariantError");
const {
  CreateTipeStatusPayloadSchema,
  UpdateTipeStatusPayloadSchema,
} = require("./schema");

const TipeStatusValidator = {
  validateCreatePayload: (payload) => {
    const validationResult = CreateTipeStatusPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateUpdatePayload: (payload) => {
    const validationResult = UpdateTipeStatusPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = TipeStatusValidator;
