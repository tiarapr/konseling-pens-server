const InvariantError = require("../../exceptions/InvariantError");
const { UserPayloadSchema, UpdateEmailPayloadSchema, UpdatePhoneNumberPayloadSchema, UpdatePasswordPayloadSchema, ResetPasswordPayloadSchema } = require("./schema");

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
  validateUpdatePhoneNumberPayload: (payload) => {
    const validationResult = UpdatePhoneNumberPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdatePasswordPayload: (payload) => {
    const validationResult = UpdatePasswordPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateResetPasswordPayload: (payload) => {
    const validationResult = ResetPasswordPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UserValidator;
