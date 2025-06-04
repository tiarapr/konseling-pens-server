const Joi = require("joi");

const datePattern = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/; // HH:mm / HH:mm:ss

const CreateKonselingPayloadSchema = Joi.object({
  janji_temu_id: Joi.string().guid({ version: "uuidv4" }).required(),
  konselor_profil_id: Joi.string().guid({ version: "uuidv4" }).required(),
  tanggal_konseling: Joi.string().pattern(datePattern).required(),
  jam_mulai: Joi.string().pattern(timeFormat).required()
    .messages({ 'string.pattern.base': 'Format jam utama mulai harus HH:MM atau HH:MM:SS' }),
  jam_selesai: Joi.string().pattern(timeFormat).required()
    .messages({ 'string.pattern.base': 'Format jam utama selesai harus HH:MM atau HH:MM:SS' }),
  lokasi: Joi.string().max(250).required(),
  status_kehadiran: Joi.boolean().optional().allow(null),
  tanggal_konfirmasi: Joi.date().optional().allow(null),
});

const UpdateKonselingPayloadSchema = Joi.object({
  status_id: Joi.string().guid({ version: "uuidv4" }).optional(),
  janji_temu_id: Joi.string().guid({ version: "uuidv4" }).optional(),
  konselor_profil_id: Joi.string().guid({ version: "uuidv4" }).optional(),
  tanggal_konseling: Joi.string().pattern(datePattern).required(),
  jam_mulai: Joi.string().pattern(timeFormat).optional()
    .messages({ 'string.pattern.base': 'Format jam utama mulai harus HH:MM atau HH:MM:SS' }),
  jam_selesai: Joi.string().pattern(timeFormat).optional()
    .messages({ 'string.pattern.base': 'Format jam utama selesai harus HH:MM atau HH:MM:SS' }),
  lokasi: Joi.string().max(250).optional(),
  status_kehadiran: Joi.boolean().optional().allow(null),
  tanggal_konfirmasi: Joi.date().optional().allow(null),
});

const UpdateStatusKonselingPayloadSchema = Joi.object({
  status_id: Joi.string().guid({ version: "uuidv4" }).required(),
});

const KonfirmasiKehadiranKonselingPayloadSchema = Joi.object({
  status_kehadiran: Joi.boolean().required(),
  status_id: Joi.when('status_kehadiran', {
    is: false,
    then: Joi.string().guid({ version: "uuidv4" }).required(),
    otherwise: Joi.string().guid({ version: "uuidv4" }).optional(),
  }),
});

module.exports = {
  CreateKonselingPayloadSchema,
  UpdateKonselingPayloadSchema,
  UpdateStatusKonselingPayloadSchema,
  KonfirmasiKehadiranKonselingPayloadSchema,
};
