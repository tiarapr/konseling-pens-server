const Joi = require('joi');

const CreateCatatanKonselingPayloadSchema = Joi.object({
    konseling_id: Joi.string().guid({ version: 'uuidv4' }).required(),
    deskripsi_masalah: Joi.string().min(5).required(),
    usaha: Joi.string().optional().allow(null),
    kendala: Joi.string().optional().allow(null),
    pencapaian: Joi.string().optional().allow(null),
    diagnosis: Joi.string().optional().allow(null),
    intervensi: Joi.string().optional().allow(null),
    tindak_lanjut: Joi.string().optional().allow(null),
    konseling_lanjutan: Joi.boolean().required(),
    created_by: Joi.string().guid({ version: 'uuidv4' }).required(),
});

const UpdateCatatanKonselingPayloadSchema = Joi.object({
    konseling_id: Joi.string().guid({ version: 'uuidv4' }).optional(),
    deskripsi_masalah: Joi.string().min(5).optional(),
    usaha: Joi.string().optional().allow(null),
    kendala: Joi.string().optional().allow(null),
    pencapaian: Joi.string().optional().allow(null),
    diagnosis: Joi.string().optional().allow(null),
    intervensi: Joi.string().optional().allow(null),
    tindak_lanjut: Joi.string().optional().allow(null),
    konseling_lanjutan: Joi.boolean().optional(),
    updated_by: Joi.string().guid({ version: 'uuidv4' }).required(),
});

module.exports = {
    CreateCatatanKonselingPayloadSchema,
    UpdateCatatanKonselingPayloadSchema,
};
