const Joi = require('joi');

// Payload untuk membuat mahasiswa
const CreateMahasiswaPayloadSchema = Joi.object({
  nrp: Joi.string().pattern(/^\d{10,15}$/).required(),
  nama_lengkap: Joi.string().max(250).required(),
  program_studi_id: Joi.string().guid({ version: "uuidv4" }).required(),
  tanggal_lahir: Joi.date().iso().required(),
  jenis_kelamin: Joi.string().valid('L', 'P').required(),
  no_telepon: Joi.string().pattern(/^\d{10,13}$/).required(),
  ktm_url: Joi.string().uri().required(),
  user_id: Joi.string().guid({ version: "uuidv4" }).required(),
  status_id: Joi.string().guid({ version: "uuidv4" }).required(),
  created_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

// Payload untuk mengubah mahasiswa
const UpdateMahasiswaPayloadSchema = Joi.object({
  nrp: Joi.string().pattern(/^\d{10,15}$/).optional(),
  nama_lengkap: Joi.string().max(250).optional(),
  program_studi_id: Joi.string().guid({ version: "uuidv4" }).optional(),
  tanggal_lahir: Joi.date().iso().optional(),
  jenis_kelamin: Joi.string().valid('L', 'P').optional(),
  no_telepon: Joi.string().pattern(/^\d{10,13}$/).optional(),
  ktm_url: Joi.string().uri().optional(),
  user_id: Joi.string().guid({ version: "uuidv4" }).optional(),
  status_id: Joi.string().guid({ version: "uuidv4" }).optional(),
  updated_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

module.exports = {
  CreateMahasiswaPayloadSchema,
  UpdateMahasiswaPayloadSchema,
};
