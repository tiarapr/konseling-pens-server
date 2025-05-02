const Joi = require("joi");

const TopikPayloadSchema = Joi.object({
  name: Joi.string().max(150).required(),
});

module.exports = { TopikPayloadSchema };
