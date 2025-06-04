const Joi = require('joi');

// Regex patterns untuk konsistensi dengan database
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[1-9][0-9]{4,14}$/; // Kode negara (1-3 digit) + nomor (min 4 digit)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

const CreateAdminAccountPayloadSchema = Joi.object({
  email: Joi.string().pattern(EMAIL_REGEX).required()
    .messages({
      'string.pattern.base': 'Format email tidak valid',
      'any.required': 'Email wajib diisi'
    }),
  phoneNumber: Joi.string().pattern(PHONE_REGEX).required()
    .messages({
      'string.pattern.base': 'Nomor telepon harus diawali kode negara tanpa tanda + (contoh: 6281234567890, 447123456789)',
      'any.required': 'Nomor telepon wajib diisi'
    }),
  password: Joi.string().pattern(PASSWORD_REGEX).required()
    .messages({
      'string.pattern.base': 'Password minimal 8 karakter dengan kombinasi huruf besar, kecil dan angka',
      'any.required': 'Password wajib diisi'
    }),
  nama_lengkap: Joi.string().max(250).required(),
});

const UpdateAdminAccountPayloadSchema = Joi.object({
  email: Joi.string().pattern(EMAIL_REGEX).optional()
    .messages({
      'string.pattern.base': 'Format email tidak valid',
      'any.required': 'Email wajib diisi'
    }),
  phoneNumber: Joi.string().pattern(PHONE_REGEX).optional()
    .messages({
      'string.pattern.base': 'Nomor telepon harus diawali kode negara tanpa tanda + (contoh: 6281234567890, 447123456789)',
      'any.required': 'Nomor telepon wajib diisi'
    }),
  password: Joi.string().pattern(PASSWORD_REGEX).optional()
    .messages({
      'string.pattern.base': 'Password minimal 8 karakter dengan kombinasi huruf besar, kecil dan angka',
      'any.required': 'Password wajib diisi'
    }),
  nama_lengkap: Joi.string().max(250).optional(),
});

const CreateAdminProfilPayloadSchema = Joi.object({
  nama_lengkap: Joi.string().max(250).required(),
  user_id: Joi.string().guid({ version: "uuidv4" }).required(),
});

// Payload untuk mengubah profil admin
const UpdateAdminProfilPayloadSchema = Joi.object({
  nama_lengkap: Joi.string().max(250).optional(),
});

module.exports = {
  CreateAdminAccountPayloadSchema,
  UpdateAdminAccountPayloadSchema,
  CreateAdminProfilPayloadSchema,
  UpdateAdminProfilPayloadSchema,
};
