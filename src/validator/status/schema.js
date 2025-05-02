const Joi = require('joi');

const CreateStatusPayloadSchema = Joi.object({
    name: Joi.string().max(50).required(),
    tipe_status_id: Joi.string().guid({ version: "uuidv4" }).required(),
});

const UpdateStatusPayloadSchema = Joi.object({
    name: Joi.string().max(50).optional(),
    tipe_status_id: Joi.string().guid({ version: "uuidv4" }).optional(),
});

module.exports = {
    CreateStatusPayloadSchema,
    UpdateStatusPayloadSchema,
};
