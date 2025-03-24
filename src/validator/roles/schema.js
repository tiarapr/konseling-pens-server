const Joi = require("joi");

const RolePayloadSchema = Joi.object({
  role_name: Joi.string().required(),
});

module.exports = { RolePayloadSchema };
