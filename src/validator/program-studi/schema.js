const Joi = require('joi');

const CreateProgramStudiPayloadSchema = Joi.object({
    departement_id: Joi.string().guid({ version: "uuidv4" }).required(),
    jenjang: Joi.string().max(10).required(),
    nama_program_studi: Joi.string().max(250).required(),
});

const UpdateProgramStudiPayloadSchema = Joi.object({
    departement_id: Joi.string().guid({ version: "uuidv4" }).optional(),
    jenjang: Joi.string().max(10).optional(),
    nama_program_studi: Joi.string().max(250).optional(),
});

module.exports = {
    CreateProgramStudiPayloadSchema,
    UpdateProgramStudiPayloadSchema,
};
