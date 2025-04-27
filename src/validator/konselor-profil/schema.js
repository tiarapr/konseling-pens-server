const Joi = require("joi");

const CreateKonselorProfilPayloadSchema = Joi.object({
  nip: Joi.string().max(30).required(),
  nama_lengkap: Joi.string().max(250).required(),
  spesialisasi: Joi.string().max(150).required(),
  no_telepon: Joi.string().pattern(/^\d{10,13}$/).required(),
  user_id: Joi.string().guid({ version: "uuidv4" }).required(),
  created_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

const UpdateKonselorProfilPayloadSchema = Joi.object({
  nip: Joi.string().max(30).optional(),
  nama_lengkap: Joi.string().max(250).optional(),
  spesialisasi: Joi.string().max(150).optional(),
  no_telepon: Joi.string().pattern(/^\d{10,13}$/).optional(),
  updated_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

module.exports = {
  CreateKonselorProfilPayloadSchema,
  UpdateKonselorProfilPayloadSchema,
};
