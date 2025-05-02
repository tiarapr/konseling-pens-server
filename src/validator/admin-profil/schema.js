const Joi = require('joi');

const CreateAdminAccountPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roleId: Joi.string().guid({ version: "uuidv4" }).required(),
  nama_lengkap: Joi.string().max(250).required(),
  no_telepon: Joi.string().pattern(/^\d{10,13}$/).required(),
});

const CreateAdminProfilPayloadSchema = Joi.object({
  nama_lengkap: Joi.string().max(250).required(),
  no_telepon: Joi.string().pattern(/^\d{10,13}$/).required(),
  user_id: Joi.string().guid({ version: "uuidv4" }).required(),
});

// Payload untuk mengubah profil admin
const UpdateAdminProfilPayloadSchema = Joi.object({
  nama_lengkap: Joi.string().max(250).optional(),
  no_telepon: Joi.string().pattern(/^\d{10,13}$/).optional(),
});

module.exports = {
  CreateAdminAccountPayloadSchema,
  CreateAdminProfilPayloadSchema,
  UpdateAdminProfilPayloadSchema,
};
