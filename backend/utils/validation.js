const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const vaultItemSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'Title is required',
    'string.max': 'Title cannot exceed 100 characters',
    'any.required': 'Title is required'
  }),
  type: Joi.string().valid('password', 'note', 'api_key').required().messages({
    'any.only': 'Type must be one of: password, note, api_key',
    'any.required': 'Type is required'
  }),
  data: Joi.string().required().messages({
    'any.required': 'Data is required'
  }),
  category: Joi.string().valid('personal', 'work', 'finance', 'social', 'development', 'other').default('personal').messages({
    'any.only': 'Category must be one of: personal, work, finance, social, development, other'
  }),
  tags: Joi.array().items(Joi.string().trim()).default([]),
  isFavorite: Joi.boolean().default(false)
});

const updateVaultItemSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100),
  type: Joi.string().valid('password', 'note', 'api_key'),
  data: Joi.string(),
  category: Joi.string().valid('personal', 'work', 'finance', 'social', 'development', 'other'),
  tags: Joi.array().items(Joi.string().trim()),
  isFavorite: Joi.boolean()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  vaultItemSchema,
  updateVaultItemSchema,
  validate
};
