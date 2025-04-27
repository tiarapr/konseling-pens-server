const InvariantError = require("../../exceptions/InvariantError");
const {
  CreateKonselingPayloadSchema,
  UpdateKonselingPayloadSchema,
  UpdateStatusKonselingPayloadSchema,
  KonfirmasiKehadiranKonselingPayloadSchema,
} = require("./schema");

const KonselingValidator = {
  validateCreatePayload: (payload) => {
    const validationResult = CreateKonselingPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateUpdatePayload: (payload) => {
    const validationResult = UpdateKonselingPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateUpdateStatusPayload: (payload) => {
    const validationResult = UpdateStatusKonselingPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateKonfirmasiKehadiranPayload: (payload) => {
    const validationResult = KonfirmasiKehadiranKonselingPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = KonselingValidator;
