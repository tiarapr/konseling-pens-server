const InvariantError = require("../../exceptions/InvariantError");
const {
  TopikPayloadSchema,
} = require("./schema");

const TopikValidator = {
  validateTopikPayload: (payload) => {
    const validationResult = TopikPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = TopikValidator;
