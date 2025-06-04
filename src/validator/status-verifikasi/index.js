const InvariantError = require("../../exceptions/InvariantError");
const {
    CreateStatusPayloadSchema,
    UpdateStatusPayloadSchema,
} = require("./schema");

const StatusValidator = {
    validateCreatePayload: (payload) => {
        const validationResult = CreateStatusPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },

    validateUpdatePayload: (payload) => {
        const validationResult = UpdateStatusPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = StatusValidator;
