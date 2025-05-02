const Joi = require("joi");

const DepartementPayloadSchema = Joi.object({
  name: Joi.string().max(50).required()
});

module.exports = { DepartementPayloadSchema };
