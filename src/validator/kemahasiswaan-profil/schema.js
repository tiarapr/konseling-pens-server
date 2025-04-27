const Joi = require("joi");

const CreateKemahasiswaanProfilPayloadSchema = Joi.object({
  nip: Joi.string().max(30).required(),
  nama_lengkap: Joi.string().max(250).required(),
  jabatan: Joi.string().max(150).required(),
  no_telepon: Joi.string().pattern(/^\d{10,13}$/).required(),
  user_id: Joi.string().guid({ version: "uuidv4" }).required(),
  created_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

const UpdateKemahasiswaanProfilPayloadSchema = Joi.object({
  nip: Joi.string().max(30).optional(),
  nama_lengkap: Joi.string().max(250).optional(),
  jabatan: Joi.string().max(150).optional(),
  no_telepon: Joi.string().pattern(/^\d{10,13}$/).optional(),
  updated_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

module.exports = {
  CreateKemahasiswaanProfilPayloadSchema,
  UpdateKemahasiswaanProfilPayloadSchema,
};
