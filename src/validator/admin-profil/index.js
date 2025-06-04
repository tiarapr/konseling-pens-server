const InvariantError = require('../../exceptions/InvariantError');
const {
  CreateAdminAccountPayloadSchema,
  UpdateAdminAccountPayloadSchema,
  CreateAdminProfilPayloadSchema,
  UpdateAdminProfilPayloadSchema,
} = require('./schema');

const AdminProfilValidator = {
  validateCreateAccountPayload: (payload) => {
    const validationResult = CreateAdminAccountPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateUpdateAccountPayload: (payload) => {
    const validationResult = UpdateAdminAccountPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateCreateProfilePayload: (payload) => {
    const validationResult = CreateAdminProfilPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateUpdatePayload: (payload) => {
    const validationResult = UpdateAdminProfilPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AdminProfilValidator;
