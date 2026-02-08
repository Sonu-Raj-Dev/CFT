import { Router, Request, Response } from 'express';
import { validate, schemas } from '../utils/validation';
import { generateToken, hashPassword, comparePasswords } from '../utils/auth';
import { userRepository } from '../repositories/user.repository';
import { sendSuccess, sendError } from '../utils/response';
import { HttpException } from '../middleware/error-handler';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Login
router.post(
  '/login',
  validate(schemas.login),
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new HttpException(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Compare passwords
    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new HttpException(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new HttpException(403, 'User account is inactive', 'ACCOUNT_INACTIVE');
    }

    // Generate token - TODO: fetch user roles and permissions from database
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      roles: ['User'], // TODO: fetch from UserRoleMapping
      permissions: [], // TODO: fetch from RolePermissionMapping
    });

    return sendSuccess(res, { token, user: { userId: user.userId, email: user.email } }, 'Login successful');
  },
);

// Register
router.post(
  '/register',
  validate(schemas.register),
  async (req: Request, res: Response) => {
    const { firstName, lastName, email, password } = req.body;

    // Check if user exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new HttpException(400, 'Email already registered', 'EMAIL_EXISTS');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await userRepository.create({
      firstName,
      lastName,
      email,
      passwordHash,
      isActive: true,
    });

    // Generate token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      roles: [],
      permissions: [],
    });

    return sendSuccess(res, { token, user: { userId: user.userId, email: user.email } }, 'Registration successful', 201);
  },
);

// Get current user
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  if (!req.user) {
    throw new HttpException(401, 'Not authenticated', 'NOT_AUTHENTICATED');
  }

  const user = await userRepository.findById(req.user.userId);
  if (!user) {
    throw new HttpException(404, 'User not found', 'USER_NOT_FOUND');
  }

  return sendSuccess(res, {
    userId: user.userId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: req.user.roles,
    permissions: req.user.permissions,
  });
});

export default router;
