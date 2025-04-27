const Joi = require("joi");

const TipeStatusBaseSchema = {
  name: Joi.string().max(50).required(),
};

const CreateTipeStatusPayloadSchema = Joi.object({
  ...TipeStatusBaseSchema,
  created_by: Joi.string().guid({ version: "uuidv4" }).required(),
});

const UpdateTipeStatusPayloadSchema = Joi.object({
  ...TipeStatusBaseSchema,
  updated_by: Joi.string().guid({ version: "uuidv4" }).required(),
});


module.exports = { CreateTipeStatusPayloadSchema, UpdateTipeStatusPayloadSchema };
