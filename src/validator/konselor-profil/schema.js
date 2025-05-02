const Joi = require("joi");

const CreateKonselorAccountPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roleId: Joi.string().guid({ version: "uuidv4" }).required(),
  nip: Joi.string().max(30).required(),
  nama_lengkap: Joi.string().max(250).required(),
  spesialisasi: Joi.string().max(150).required(),
  no_telepon: Joi.string().pattern(/^\d{10,13}$/).required(),
});

const CreateKonselorProfilPayloadSchema = Joi.object({
  nip: Joi.string().max(30).required(),
  nama_lengkap: Joi.string().max(250).required(),
  spesialisasi: Joi.string().max(150).required(),
  no_telepon: Joi.string().pattern(/^\d{10,13}$/).required(),
  user_id: Joi.string().guid({ version: "uuidv4" }).required(),
});

const UpdateKonselorProfilPayloadSchema = Joi.object({
  nip: Joi.string().max(30).optional(),
  nama_lengkap: Joi.string().max(250).optional(),
  spesialisasi: Joi.string().max(150).optional(),
  no_telepon: Joi.string().pattern(/^\d{10,13}$/).optional(),
});

module.exports = {
  CreateKonselorAccountPayloadSchema,
  CreateKonselorProfilPayloadSchema,
  UpdateKonselorProfilPayloadSchema,
};
