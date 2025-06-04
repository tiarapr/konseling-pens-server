const InvariantError = require("../../exceptions/InvariantError");
const {
  CreateKemahasiswaanAccountPayloadSchema,
  UpdateKemahasiswaanAccountPayloadSchema,
  CreateKemahasiswaanProfilPayloadSchema,
  UpdateKemahasiswaanProfilPayloadSchema,
} = require("./schema");

const KemahasiswaanProfilValidator = {
  validateCreateAccountPayload: (payload) => {
    const validationResult = CreateKemahasiswaanAccountPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdateAccountPayload: (payload) => {
    const validationResult = UpdateKemahasiswaanAccountPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
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
