const Joi = require("joi");

const DepartementBaseSchema = {
  name: Joi.string().max(50).required(),
};

const CreateDepartementPayloadSchema = Joi.object({
  ...DepartementBaseSchema,
  created_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

const UpdateDepartementPayloadSchema = Joi.object({
  ...DepartementBaseSchema,
  updated_by: Joi.string().guid({ version: "uuidv4" }).required(),
});


module.exports = { CreateDepartementPayloadSchema, UpdateDepartementPayloadSchema };
