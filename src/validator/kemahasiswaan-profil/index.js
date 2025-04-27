const InvariantError = require("../../exceptions/InvariantError");
const {
  CreateKemahasiswaanProfilPayloadSchema,
  UpdateKemahasiswaanProfilPayloadSchema,
} = require("./schema");

const KemahasiswaanProfilValidator = {
  validateCreatePayload: (payload) => {
    const validationResult = CreateKemahasiswaanProfilPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateUpdatePayload: (payload) => {
    const validationResult = UpdateKemahasiswaanProfilPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = KemahasiswaanProfilValidator;
