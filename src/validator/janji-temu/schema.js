const Joi = require("joi");

const datePattern = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

const CreateJanjiTemuPayloadSchema = Joi.object({
  nrp: Joi.string().pattern(/^\d{10,15}$/).required(),
  status_id: Joi.string().guid({ version: "uuidv4" }).required(),
  tipe_konsultasi: Joi.string().max(50).required(),

  jadwal_utama_tanggal: Joi.string().pattern(datePattern).required(),
  jadwal_utama_jam_mulai: Joi.string().pattern(timeFormat).required()
    .messages({ 'string.pattern.base': 'Format jam utama mulai harus HH:MM atau HH:MM:SS' }),
  jadwal_utama_jam_selesai: Joi.string().pattern(timeFormat).required()
    .messages({ 'string.pattern.base': 'Format jam utama selesai harus HH:MM atau HH:MM:SS' }),

  jadwal_alternatif_tanggal: Joi.string().pattern(datePattern).required(),
  jadwal_alternatif_jam_mulai: Joi.string().pattern(timeFormat).required()
    .messages({ 'string.pattern.base': 'Format jam alternatif mulai harus HH:MM atau HH:MM:SS' }),
  jadwal_alternatif_jam_selesai: Joi.string().pattern(timeFormat).required()
    .messages({ 'string.pattern.base': 'Format jam alternatif selesai harus HH:MM atau HH:MM:SS' }),

  tanggal_pengajuan: Joi.date().required(),
  created_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

const UpdateStatusJanjiTemuPayloadSchema = Joi.object({
  status_id: Joi.string().guid({ version: "uuidv4" }).required(),
  updated_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

module.exports = {
  CreateJanjiTemuPayloadSchema,
  UpdateStatusJanjiTemuPayloadSchema,
};
