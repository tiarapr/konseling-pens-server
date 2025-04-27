const InvariantError = require('../../exceptions/InvariantError');
const {
  CreateMahasiswaPayloadSchema,
  UpdateMahasiswaPayloadSchema,
} = require('./schema');

const MahasiswaValidator = {
  validateCreatePayload: (payload) => {
    const validationResult = CreateMahasiswaPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateUpdatePayload: (payload) => {
    const validationResult = UpdateMahasiswaPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = MahasiswaValidator;
