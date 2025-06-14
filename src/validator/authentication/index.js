const {
  PostAuthenticationPayloadSchema,
  VerifyOTPPayloadSchema,
  ResendOTPPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
} = require("./schema");
const InvariantError = require("../../exceptions/InvariantError");

const AuthenticationValidator = {
  validatePostAuthenticationPayload: (payload) => {
    const validationResult = PostAuthenticationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateVerifyOTPPayload: (payload) => {
    const validationResult = VerifyOTPPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateResendOTPPayload: (payload) => {
    const validationResult = ResendOTPPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutAuthenticationPayload: (payload) => {
    const validationResult = PutAuthenticationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeleteAuthenticationPayload: (payload) => {
    const validationResult = DeleteAuthenticationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AuthenticationValidator;
