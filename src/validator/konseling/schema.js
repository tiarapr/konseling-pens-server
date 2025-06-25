const Joi = require("joi");

const datePattern = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/; // HH:mm / HH:mm:ss

function validateDurasi(jam_mulai, jam_selesai) {
  const [hMulai, mMulai] = jam_mulai.split(':').map(Number);
  const [hSelesai, mSelesai] = jam_selesai.split(':').map(Number);

  const mulai = hMulai * 60 + mMulai;
  const selesai = hSelesai * 60 + mSelesai;

  if (selesai <= mulai) return false;

  const durasi = selesai - mulai;
  return durasi <= 60; // Maksimal 1 jam
}

function validateTanggal(tanggalStr) {
  const tanggal = new Date(tanggalStr);
  const today = new Date();
  const besok = new Date(today);
  const batas = new Date(today);
  besok.setDate(today.getDate() + 1);
  batas.setDate(today.getDate() + 30);

  tanggal.setHours(0, 0, 0, 0);
  besok.setHours(0, 0, 0, 0);
  batas.setHours(0, 0, 0, 0);

  return tanggal >= besok && tanggal <= batas;
}

const baseFields = {
  janji_temu_id: Joi.string().guid({ version: "uuidv4" }).required(),
  konselor_profil_id: Joi.string().guid({ version: "uuidv4" }).required(),
  tanggal_konseling: Joi.string().pattern(datePattern).required()
    .messages({ 'string.pattern.base': 'Format tanggal harus YYYY-MM-DD' }),
  jam_mulai: Joi.string().pattern(timeFormat).required()
    .messages({ 'string.pattern.base': 'Format jam mulai harus HH:MM atau HH:MM:SS' }),
  jam_selesai: Joi.string().pattern(timeFormat).required()
    .messages({ 'string.pattern.base': 'Format jam selesai harus HH:MM atau HH:MM:SS' }),
  lokasi: Joi.string().max(250).required(),
  status_kehadiran: Joi.boolean().optional().allow(null),
  tanggal_konfirmasi: Joi.date().optional().allow(null),
};

const CreateKonselingPayloadSchema = Joi.object(baseFields).custom((value, helpers) => {
  if (!validateDurasi(value.jam_mulai, value.jam_selesai)) {
    return helpers.message('Durasi maksimal 1 jam dan jam selesai harus lebih dari jam mulai');
  }

  if (!validateTanggal(value.tanggal_konseling)) {
    return helpers.message('Tanggal konseling harus minimal besok dan maksimal 30 hari ke depan');
  }

  return value;
});

const UpdateKonselingPayloadSchema = Joi.object({
  janji_temu_id: Joi.string().guid({ version: "uuidv4" }).optional(),
  konselor_profil_id: Joi.string().guid({ version: "uuidv4" }).optional(),
  tanggal_konseling: Joi.string().pattern(datePattern).optional()
    .messages({ 'string.pattern.base': 'Format tanggal harus YYYY-MM-DD' }),
  jam_mulai: Joi.string().pattern(timeFormat).optional()
    .messages({ 'string.pattern.base': 'Format jam mulai harus HH:MM atau HH:MM:SS' }),
  jam_selesai: Joi.string().pattern(timeFormat).optional()
    .messages({ 'string.pattern.base': 'Format jam selesai harus HH:MM atau HH:MM:SS' }),
  lokasi: Joi.string().max(250).optional(),
  status_kehadiran: Joi.boolean().optional().allow(null),
  tanggal_konfirmasi: Joi.date().optional().allow(null),
  status_id: Joi.string().guid({ version: "uuidv4" }).optional(),
}).custom((value, helpers) => {
  // Jika dua-duanya ada, validasi durasi
  if (value.jam_mulai && value.jam_selesai && !validateDurasi(value.jam_mulai, value.jam_selesai)) {
    return helpers.message('Durasi maksimal 1 jam dan jam selesai harus lebih dari jam mulai');
  }

  // Validasi tanggal hanya jika diberikan
  if (value.tanggal_konseling && !validateTanggal(value.tanggal_konseling)) {
    return helpers.message('Tanggal konseling harus minimal besok dan maksimal 30 hari ke depan');
  }

  return value;
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
