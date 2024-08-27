const Joi = require("joi");

exports.productValidation = Joi.object({
  productName: Joi
    .string()
    .min(3)
    .max(100 )
    .required(),
  description: Joi 
    .string()
    .min(10)
    .max(500)
    .required(),
});
exports.productNameValidation = Joi.object({
  productName: Joi
    .string()
    .min(3)
    .max(100)
    .required(),
});
exports.pagingValidation = Joi.object({
  page: Joi
    .number()
    .min(1)
    .integer()
    .required(),
  size: Joi
    .number()
    .min(1)
    .integer()
    .required(),
});