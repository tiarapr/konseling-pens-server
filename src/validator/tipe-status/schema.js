const Joi = require("joi");

const TipeStatusPayloadSchema = Joi.object({
  name: Joi.string().max(50).required(),
});

module.exports = { TipeStatusPayloadSchema };
