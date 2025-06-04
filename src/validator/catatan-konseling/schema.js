const Joi = require('joi');

// Validator untuk Create Catatan Konseling
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
});

// Validator untuk Update Catatan Konseling
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
});

function preprocessCatatan(payload) {
  return {
    ...payload,
    konseling_lanjutan: String(payload.konseling_lanjutan), // Convert boolean to string
  };
}

module.exports = {
  CreateCatatanKonselingPayloadSchema,
  UpdateCatatanKonselingPayloadSchema,
  preprocessCatatan, // Export the function for preprocessing
};
