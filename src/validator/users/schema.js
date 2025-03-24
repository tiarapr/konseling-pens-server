const Joi = require("joi");

const UserPayloadSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
  roleId: Joi.string().required(),
});

module.exports = { UserPayloadSchema };
