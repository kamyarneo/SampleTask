const Joi = require("joi");

exports.registerValidation = Joi.object({

   name:
      Joi.string().max(30).min(3).required(),
   family:
      Joi.string().max(30).min(3).required(),
   email:
      Joi.string().email().max(100).lowercase().required(),
   password: 
      Joi.string().max(30).min(8).required(),
});

exports.loginValidation = Joi.object({
   email:
      Joi.string().email().max(100).lowercase().required(),
   password:
      Joi.string().max(30).min(8).required(),
});

exports.setPasswordValidation = Joi.object({
   email:
      Joi.string().email().max(100).lowercase().required(),
   newPassword:
      Joi.string().max(30).min(8).required(),
   resetToken:
      Joi.string().required(),
   
});

exports.resetValidation = Joi.object({
   email:
      Joi.string().email().max(100).lowercase().required(),
});

exports.verifyValidation = Joi.object({
   email: 
      Joi.string().email().max(100).lowercase().required(),
   token: 
      Joi.string().required(),


});
