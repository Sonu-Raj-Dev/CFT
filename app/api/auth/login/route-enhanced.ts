import { NextRequest } from 'next/server';
import { validateAsync, schemas } from '@/lib/server/validation';
import { UserRepository } from '@/lib/server/repositories/user-repository';
import { RolePermissionMappingRepository } from '@/lib/server/repositories/role-permission-mapping-repository';
import { generateToken } from '@/lib/server/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/server/responses';
import { logger } from '@/lib/server/logger';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  userId: number;
  userName: string;
  email: string;
  roleIds: number[];
  permissionNames: string[];
  token: string;
}

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token with permissions
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request
    const { value: validated, error: validationError } = await validateAsync<LoginRequest>(body, schemas.login);

    if (validationError) {
      logger.warn('Login validation failed', { error: validationError });
      return validationErrorResponse('Validation failed', validationError);
    }

    const { email, password } = validated;

    // Authenticate user
    logger.logRequest('POST', '/api/auth/login', undefined);
    const user = await UserRepository.authenticateUser(email, password);

    if (!user) {
      logger.logAuthAttempt(email, false);
      return errorResponse('Invalid email or password', 401);
    }

    if (!user.isActive) {
      logger.warn('Login attempt with inactive user', { email });
      return errorResponse('User account is inactive', 401);
    }

    // Get user roles and permissions
    const [roleIds, permissionNames] = await Promise.all([
      RolePermissionMappingRepository.getUserRoleIds(user.id),
      RolePermissionMappingRepository.getUserPermissionNames(user.id),
    ]);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roleIds,
      permissionNames,
    });

    const response: LoginResponse = {
      userId: user.id,
      userName: user.userName,
      email: user.email,
      roleIds,
      permissionNames,
      token,
    };

    logger.logAuthAttempt(email, true);
    logger.logResponse('POST', '/api/auth/login', 200, user.id);

    return successResponse(response, 'Login successful', 200);
  } catch (error) {
    logger.error('Login endpoint error', error as Error);
    return errorResponse('Internal server error', 500);
  }
}
