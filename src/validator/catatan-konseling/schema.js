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
    topik_ids: Joi.array().items(Joi.string()).required()
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
    topik_ids: Joi.array().items(Joi.string()).optional()
});

module.exports = {
    CreateCatatanKonselingPayloadSchema,
    UpdateCatatanKonselingPayloadSchema,
};
