import Joi from 'joi';

/**
 * Standard validation schemas
 */
export const schemas = {
  // Authentication
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
  }),

  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
  }),

  // Role management
  createRole: Joi.object({
    roleName: Joi.string().min(2).max(100).required(),
    isActive: Joi.boolean().default(true),
  }),

  updateRole: Joi.object({
    id: Joi.number().required(),
    roleName: Joi.string().min(2).max(100),
    isActive: Joi.boolean(),
  }),

  // Permission management
  createPermission: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    isActive: Joi.boolean().default(true),
  }),

  updatePermission: Joi.object({
    id: Joi.number().required(),
    name: Joi.string().min(2).max(100),
    isActive: Joi.boolean(),
  }),

  // Role Permission Mapping
  assignPermissionToRole: Joi.object({
    roleId: Joi.number().required(),
    permissionId: Joi.number().required(),
  }),

  // User management
  createUser: Joi.object({
    username: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    isActive: Joi.boolean().default(true),
  }),

  updateUser: Joi.object({
    id: Joi.number().required(),
    username: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    isActive: Joi.boolean(),
  }),

  assignRoleToUser: Joi.object({
    userId: Joi.number().required(),
    roleId: Joi.number().required(),
  }),

  // Customer management
  createCustomer: Joi.object({
    customerName: Joi.string().min(2).max(255).required(),
    mobileNumber: Joi.number().required(),
    emailId: Joi.string().email().required(),
    address: Joi.string().max(1000).required(),
    isActive: Joi.boolean().default(true),
  }),

  updateCustomer: Joi.object({
    id: Joi.number().required(),
    customerName: Joi.string().min(2).max(255),
    mobileNumber: Joi.number(),
    emailId: Joi.string().email(),
    address: Joi.string().max(1000),
    isActive: Joi.boolean(),
  }),

  // Engineer management
  createEngineer: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().required(),
    mobileNumber: Joi.number().required(),
    isActive: Joi.boolean().default(true),
  }),

  updateEngineer: Joi.object({
    id: Joi.number().required(),
    name: Joi.string().min(2).max(255),
    email: Joi.string().email(),
    mobileNumber: Joi.number(),
    isActive: Joi.boolean(),
  }),

  // Status management
  createStatus: Joi.object({
    statusName: Joi.string().min(2).max(100).required(),
    isActive: Joi.boolean().default(true),
  }),

  updateStatus: Joi.object({
    id: Joi.number().required(),
    statusName: Joi.string().min(2).max(100),
    isActive: Joi.boolean(),
  }),

  // Complaint management
  createComplaint: Joi.object({
    customerId: Joi.number().required(),
    natureOfComplaint: Joi.string().min(5).max(255).required(),
    complaintDetails: Joi.string().min(10).max(1000).required(),
    engineerId: Joi.number().allow(null),
    statusId: Joi.number().required(),
  }),

  updateComplaint: Joi.object({
    id: Joi.number().required(),
    customerId: Joi.number(),
    natureOfComplaint: Joi.string().min(5).max(255),
    complaintDetails: Joi.string().min(10).max(1000),
    engineerId: Joi.number().allow(null),
    statusId: Joi.number(),
    isActive: Joi.boolean(),
  }),

  assignEngineer: Joi.object({
    complaintId: Joi.number().required(),
    engineerId: Joi.number().required(),
  }),

  updateComplaintStatus: Joi.object({
    complaintId: Joi.number().required(),
    statusId: Joi.number().required(),
  }),

  // Pagination and filtering
  paginationQuery: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdDate'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().allow(''),
  }),
};

/**
 * Validate data against schema
 */
export function validateData<T>(data: unknown, schema: Joi.Schema): { value: T; error: null } | { value: null; error: string } {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map(d => d.message).join(', ');
    return { value: null, error: messages };
  }

  return { value: value as T, error: null };
}

/**
 * Async validation wrapper
 */
export async function validateAsync<T>(data: unknown, schema: Joi.Schema): Promise<{ value: T; error: null } | { value: null; error: string }> {
  try {
    const value = await schema.validateAsync(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return { value: value as T, error: null };
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      const messages = error.details.map(d => d.message).join(', ');
      return { value: null, error: messages };
    }
    return { value: null, error: 'Validation failed' };
  }
}
