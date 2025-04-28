// server/utils/validators.js
const Joi = require('joi');

// Register validation
const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 3 characters long',
        'string.max': 'Name cannot be longer than 30 characters'
      }),
    email: Joi.string()
      .min(6)
      .max(50)
      .required()
      .email()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email',
        'string.min': 'Email must be at least 6 characters long',
        'string.max': 'Email cannot be longer than 50 characters'
      }),
    password: Joi.string()
      .min(6)
      .max(30)
      .required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password cannot be longer than 30 characters'
      })
  });

  return schema.validate(data);
};

// Login validation
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .min(6)
      .max(50)
      .required()
      .email()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email'
      }),
    password: Joi.string()
      .min(6)
      .max(30)
      .required()
      .messages({
        'string.empty': 'Password is required'
      })
  });

  return schema.validate(data);
};

module.exports = {
  validateRegister: registerValidation,
  validateLogin: loginValidation
};