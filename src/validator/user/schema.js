const Joi = require('joi');

// register user
const UserPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roleId: Joi.string().guid({ version: "uuidv4" }).required(),
});

// update email
const UpdateEmailPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
});

// update password
const UpdatePasswordPayloadSchema = Joi.object({
  oldPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
});

module.exports = { UserPayloadSchema, UpdateEmailPayloadSchema, UpdatePasswordPayloadSchema };
