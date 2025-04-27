const InvariantError = require("../../exceptions/InvariantError");
const {
    CreateProgramStudiPayloadSchema,
    UpdateProgramStudiPayloadSchema,
} = require("./schema");

const ProgramStudiValidator = {
    validateCreatePayload: (payload) => {
        const validationResult = CreateProgramStudiPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },

    validateUpdatePayload: (payload) => {
        const validationResult = UpdateProgramStudiPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = ProgramStudiValidator;
