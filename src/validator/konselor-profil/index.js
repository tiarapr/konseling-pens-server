const InvariantError = require("../../exceptions/InvariantError");
const {
  CreateKonselorProfilPayloadSchema,
  UpdateKonselorProfilPayloadSchema,
} = require("./schema");

const KemahasiswaanProfilValidator = {
  validateCreatePayload: (payload) => {
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
