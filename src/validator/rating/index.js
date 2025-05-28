const InvariantError = require("../../exceptions/InvariantError");
const { AddRatingSchema, UpdateRatingSchema } = require("./schema");

const RatingValidator = {
    validateAddRatingPayload: (payload) => {
        const validationResult = AddRatingSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validateUpdateRatingPayload: (payload) => {
        const validationResult = UpdateRatingSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = RatingValidator;
