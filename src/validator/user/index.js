const InvariantError = require("../../exceptions/InvariantError");
const { UserPayloadSchema, UpdateEmailPayloadSchema, UpdatePasswordPayloadSchema } = require("./schema");
const Joi = require('joi');

const UserValidator = {
  validateUserPayload: (payload) => {
    const validationResult = UserPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdateEmailPayload: (payload) => {
    const validationResult = UpdateEmailPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdatePasswordPayload: (payload) => {
    const validationResult = UpdatePasswordPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  }
};

module.exports = UserValidator;
