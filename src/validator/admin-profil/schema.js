const Joi = require('joi');

// Payload untuk membuat profil admin
const CreateAdminProfilPayloadSchema = Joi.object({
  nama_lengkap: Joi.string().max(250).required(),
  no_telepon: Joi.string().pattern(/^\d{10,13}$/).required(),
  user_id: Joi.string().guid({ version: "uuidv4" }).required(),
  created_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

// Payload untuk mengubah profil admin
const UpdateAdminProfilPayloadSchema = Joi.object({
  nama_lengkap: Joi.string().max(250).optional(),
  no_telepon: Joi.string().pattern(/^\d{10,13}$/).optional(),
  updated_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

module.exports = {
  CreateAdminProfilPayloadSchema,
  UpdateAdminProfilPayloadSchema,
};
