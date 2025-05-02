const Joi = require("joi");

const PermissionPayloadSchema = Joi.object({
  name: Joi.string().max(50).required(),
});

module.exports = { PermissionPayloadSchema };
