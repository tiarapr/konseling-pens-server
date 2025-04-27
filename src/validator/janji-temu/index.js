const InvariantError = require("../../exceptions/InvariantError");
const {
  CreateJanjiTemuPayloadSchema,
  UpdateStatusJanjiTemuPayloadSchema,
} = require("./schema");

const JanjiTemuValidator = {
  validateCreatePayload: (payload) => {
    const validationResult = CreateJanjiTemuPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateUpdatePayload: (payload) => {
    const validationResult = UpdateStatusJanjiTemuPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = JanjiTemuValidator;
