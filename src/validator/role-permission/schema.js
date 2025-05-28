const Joi = require('joi');

const RolePermissionPayloadSchema = Joi.object({
  role_id: Joi.string().required(),
  permission_names: Joi.array().items(Joi.string()).required()
});

module.exports = { RolePermissionPayloadSchema };