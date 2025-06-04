const Joi = require('joi');

const AddRatingSchema = Joi.object({
    konseling_id: Joi.string().uuid({ version: 'uuidv4' }).required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    ulasan: Joi.string().allow('').optional(),
});

const UpdateRatingSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    ulasan: Joi.string().allow('').optional(),
});

module.exports = {
    AddRatingSchema,
    UpdateRatingSchema,
};
