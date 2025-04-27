const Joi = require("joi");

const PermissionBaseSchema = {
  name: Joi.string().max(50).required(),
};

const CreatePermissionPayloadSchema = Joi.object({
  ...PermissionBaseSchema,
  created_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

const UpdatePermissionPayloadSchema = Joi.object({
  ...PermissionBaseSchema,
  updated_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

module.exports = { CreatePermissionPayloadSchema, UpdatePermissionPayloadSchema };
