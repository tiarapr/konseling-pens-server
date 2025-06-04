const InvariantError = require("../../exceptions/InvariantError");
const {
  CreateKonselorAccountPayloadSchema,
  UpdateKonselorAccountPayloadSchema,
  CreateKonselorProfilPayloadSchema,
  UpdateKonselorProfilPayloadSchema,
} = require("./schema");

const KemahasiswaanProfilValidator = {
  validateCreateAccountPayload: (payload) => {
    const validationResult = CreateKonselorAccountPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateUpdateAccountPayload: (payload) => {
    const validationResult = UpdateKonselorAccountPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateCreateProfilePayload: (payload) => {
    const validationResult = CreateKonselorProfilPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateUpdatePayload: (payload) => {
    const validationResult = UpdateKonselorProfilPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = KemahasiswaanProfilValidator;
