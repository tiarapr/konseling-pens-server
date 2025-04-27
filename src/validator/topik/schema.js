const Joi = require("joi");

const TopikBaseSchema = {
  name: Joi.string().max(150).required(),
};

const CreateTopikPayloadSchema = Joi.object({
  ...TopikBaseSchema,
  created_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

const UpdateTopikPayloadSchema = Joi.object({
  ...TopikBaseSchema,
  updated_by: Joi.string().guid({ version: "uuidv4" }).required(),
});


module.exports = { CreateTopikPayloadSchema, UpdateTopikPayloadSchema };
