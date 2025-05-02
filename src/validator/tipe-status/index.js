const InvariantError = require("../../exceptions/InvariantError");
const {
  TipeStatusPayloadSchema,
} = require("./schema");

const TipeStatusValidator = {
  validateTipeStatusPayload: (payload) => {
    const validationResult = TipeStatusPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = TipeStatusValidator;
