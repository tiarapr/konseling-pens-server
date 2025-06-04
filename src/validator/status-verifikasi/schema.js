const Joi = require('joi');

const CreateStatusPayloadSchema = Joi.object({
  kode_status: Joi.string().max(50).required(),
  label: Joi.string().max(100).required(),
  warna: Joi.string().max(20).optional().allow(null, ''),
  urutan: Joi.number().integer().required(),
  is_active: Joi.boolean().optional(),
});

const UpdateStatusPayloadSchema = Joi.object({
  kode_status: Joi.string().max(50).optional(),
  label: Joi.string().max(100).optional(),
  warna: Joi.string().max(20).optional().allow(null, ''),
  urutan: Joi.number().integer().optional(),
  is_active: Joi.boolean().optional(),
});

module.exports = {
  CreateStatusPayloadSchema,
  UpdateStatusPayloadSchema,
};
