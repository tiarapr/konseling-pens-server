const Joi = require('joi');

// Regex patterns untuk konsistensi dengan database
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[1-9][0-9]{4,14}$/; // Kode negara (1-3 digit) + nomor (min 4 digit)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

// register user
const UserPayloadSchema = Joi.object({
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
  roleId: Joi.string().guid({ version: "uuidv4" }).required()
    .messages({
      'string.guid': 'Role ID harus berupa UUID v4 valid',
      'any.required': 'Role ID wajib diisi'
    })
});

// update email
const UpdateEmailPayloadSchema = Joi.object({
  email: Joi.string().pattern(EMAIL_REGEX).required()
    .messages({
      'string.pattern.base': 'Format email tidak valid',
      'any.required': 'Email wajib diisi'
    })
});

// update phone number
const UpdatePhoneNumberPayloadSchema = Joi.object({
  phoneNumber: Joi.string().pattern(PHONE_REGEX).required()
    .messages({
      'string.pattern.base': 'Nomor telepon harus diawali kode negara tanpa tanda + (contoh: 6281234567890, 447123456789)',
      'any.required': 'Nomor telepon wajib diisi'
    })
});

// update password
const UpdatePasswordPayloadSchema = Joi.object({
  oldPassword: Joi.string().required()
    .messages({
      'any.required': 'Password lama wajib diisi'
    }),
  newPassword: Joi.string().pattern(PASSWORD_REGEX).invalid(Joi.ref('oldPassword')).required()
    .messages({
      'string.pattern.base': 'Password baru minimal 8 karakter dengan kombinasi huruf besar, kecil dan angka',
      'any.invalid': 'Password baru tidak boleh sama dengan password lama',
      'any.required': 'Password baru wajib diisi'
    })
});

// reset password
const ResetPasswordPayloadSchema = Joi.object({
  password: Joi.string().pattern(PASSWORD_REGEX).required()
    .messages({
      'string.pattern.base': 'Password minimal 8 karakter dengan kombinasi huruf besar, kecil dan angka',
      'any.required': 'Password wajib diisi'
    })
});

module.exports = {
  UserPayloadSchema,
  UpdateEmailPayloadSchema,
  UpdatePhoneNumberPayloadSchema,
  UpdatePasswordPayloadSchema,
  ResetPasswordPayloadSchema,
  EMAIL_REGEX,
  PHONE_REGEX,
  PASSWORD_REGEX
};