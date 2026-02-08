import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../middleware/error-handler';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const { error, value } = schema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details
        .map((detail) => `${detail.path.join('.')}: ${detail.message}`)
        .join(', ');

      throw new HttpException(400, messages, 'VALIDATION_ERROR');
    }

    req.body = value;
    next();
  };
};

// Common validation schemas
export const schemas = {
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email must be valid',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
  }),

  register: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  }),

  createUser: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    isActive: Joi.boolean().default(true),
  }),

  updateUser: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email(),
    isActive: Joi.boolean(),
  }),

  createRole: Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    isActive: Joi.boolean().default(true),
  }),

  createPermission: Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    code: Joi.string().required(),
  }),

  createComplaint: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    customerId: Joi.number().integer().required(),
    statusId: Joi.number().integer().required(),
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
  }),

  updateComplaint: Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    statusId: Joi.number().integer(),
    assignedEngineerId: Joi.number().integer().allow(null),
    priority: Joi.string().valid('Low', 'Medium', 'High'),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10),
  }),
};
