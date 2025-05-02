const InvariantError = require("../../exceptions/InvariantError");
const { DepartementPayloadSchema } = require("./schema");

const DepartementValidator = {
  validateDepartementPayload: (payload) => {
    const validationResult = DepartementPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = DepartementValidator;
