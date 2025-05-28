const Joi = require('joi');

// Regex patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[1-9][0-9]{4,14}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

// Untuk payload create mahasiswa (dengan data user)
const CreateMahasiswaPayloadSchema = Joi.object({
  email: Joi.string().pattern(EMAIL_REGEX).required(),
  phoneNumber: Joi.string().pattern(PHONE_REGEX).required(),
  password: Joi.string().pattern(PASSWORD_REGEX).required(),
  roleId: Joi.string().guid({ version: 'uuidv4' }).required(),

  nrp: Joi.string().pattern(/^\d{10,15}$/).required(),
  nama_lengkap: Joi.string().max(250).required(),
  program_studi_id: Joi.string().guid({ version: 'uuidv4' }).required(),
  tanggal_lahir: Joi.date().iso().required(),
  jenis_kelamin: Joi.string().valid('L', 'P').required(),
  ktm_url: Joi.string().required(),
  status_verifikasi_id: Joi.string().guid({ version: 'uuidv4' }).required(),
});

// Untuk update mahasiswa
const UpdateMahasiswaPayloadSchema = Joi.object({
  nrp: Joi.string().pattern(/^\d{10,15}$/).optional(),
  nama_lengkap: Joi.string().max(250).optional(),
  program_studi_id: Joi.string().guid({ version: 'uuidv4' }).optional(),
  tanggal_lahir: Joi.date().iso().optional(),
  jenis_kelamin: Joi.string().valid('L', 'P').optional(),
  ktm_url: Joi.string().optional(),
  status_verifikasi_id: Joi.string().guid({ version: 'uuidv4' }).optional(),
  updated_by: Joi.string().guid({ version: 'uuidv4' }).required(),
  verified_by: Joi.string().guid({ version: 'uuidv4' }).allow(null).optional(),
  verified_at: Joi.date().iso().allow(null).optional(),
  catatan_verifikasi: Joi.string().allow(null, '').optional(),
  is_active: Joi.boolean().optional(),
});

// Untuk verifikasi mahasiswa oleh admin
const VerifyMahasiswaPayloadSchema = Joi.object({
  status_verifikasi_id: Joi.string().guid({ version: 'uuidv4' }).required(),
  catatan_verifikasi: Joi.string().allow(null, '').optional(),
});

module.exports = {
  CreateMahasiswaPayloadSchema,
  UpdateMahasiswaPayloadSchema,
  VerifyMahasiswaPayloadSchema,
};
