const InvariantError = require('../../exceptions/InvariantError');
const {
  CreateCatatanKonselingPayloadSchema,
  UpdateCatatanKonselingPayloadSchema,
} = require('./schema');

const CatatanKonselingValidator = {
  validateCreatePayload: (payload) => {
    const validationResult = CreateCatatanKonselingPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateUpdatePayload: (payload) => {
    const validationResult = UpdateCatatanKonselingPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CatatanKonselingValidator;
