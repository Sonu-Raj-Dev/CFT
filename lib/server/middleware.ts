import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken, JWTPayload } from './auth';
import { unauthorizedResponse, forbiddenResponse } from './responses';
import { logger } from './logger';

/**
 * Middleware function to verify JWT token and attach user context to request
 * Returns user context or null if unauthorized
 */
export async function verifyAuth(req: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = req.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      logger.warn('Request without authorization token', { path: req.nextUrl.pathname });
      return null;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      logger.warn('Invalid or expired token', { path: req.nextUrl.pathname });
      return null;
    }

    return decoded;
  } catch (error) {
    logger.error('Token verification error', error as Error);
    return null;
  }
}

/**
 * Wrapper to protect API routes with authentication
 * Usage: return withAuth(req, async (user) => { ... your handler ... })
 */
export async function withAuth(
  req: NextRequest,
  handler: (user: JWTPayload) => Promise<NextResponse<any>>
): Promise<NextResponse<any>> {
  const user = await verifyAuth(req);

  if (!user) {
    return unauthorizedResponse('Unauthorized. Please login first.');
  }

  logger.logRequest(req.method, req.nextUrl.pathname, user.userId);

  try {
    const response = await handler(user);
    logger.logResponse(req.method, req.nextUrl.pathname, response.status, user.userId);
    return response;
  } catch (error) {
    logger.error(`Handler error for ${req.nextUrl.pathname}`, error as Error, { userId: user.userId });
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Wrapper to check specific permission(s)
 * Usage: return withPermission(req, ['Complaint.View'], async (user) => { ... })
 */
export async function withPermission(
  req: NextRequest,
  requiredPermissions: string | string[],
  handler: (user: JWTPayload) => Promise<NextResponse<any>>
): Promise<NextResponse<any>> {
  const user = await verifyAuth(req);

  if (!user) {
    return unauthorizedResponse('Unauthorized. Please login first.');
  }

  // Normalize permissions to array
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  // Check if user has at least one of the required permissions
  const hasPermission = permissions.some(permission =>
    user.permissionNames.includes(permission)
  );

  if (!hasPermission) {
    logger.logPermissionCheck(user.userId, permissions.join(' OR '), false);
    return forbiddenResponse(
      `You don't have permission to perform this action. Required: ${permissions.join(' or ')}`
    );
  }

  logger.logPermissionCheck(user.userId, permissions.join(' OR '), true);
  logger.logRequest(req.method, req.nextUrl.pathname, user.userId);

  try {
    const response = await handler(user);
    logger.logResponse(req.method, req.nextUrl.pathname, response.status, user.userId);
    return response;
  } catch (error) {
    logger.error(`Handler error for ${req.nextUrl.pathname}`, error as Error, { userId: user.userId });
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Wrapper to check all permissions (AND logic)
 * Usage: return withAllPermissions(req, ['Complaint.View', 'Complaint.Edit'], async (user) => { ... })
 */
export async function withAllPermissions(
  req: NextRequest,
  requiredPermissions: string[],
  handler: (user: JWTPayload) => Promise<NextResponse<any>>
): Promise<NextResponse<any>> {
  const user = await verifyAuth(req);

  if (!user) {
    return unauthorizedResponse('Unauthorized. Please login first.');
  }

  // Check if user has ALL required permissions
  const hasAllPermissions = requiredPermissions.every(permission =>
    user.permissionNames.includes(permission)
  );

  if (!hasAllPermissions) {
    logger.logPermissionCheck(user.userId, requiredPermissions.join(' AND '), false);
    return forbiddenResponse(
      `You don't have permission to perform this action. Required: ${requiredPermissions.join(' and ')}`
    );
  }

  logger.logPermissionCheck(user.userId, requiredPermissions.join(' AND '), true);
  logger.logRequest(req.method, req.nextUrl.pathname, user.userId);

  try {
    const response = await handler(user);
    logger.logResponse(req.method, req.nextUrl.pathname, response.status, user.userId);
    return response;
  } catch (error) {
    logger.error(`Handler error for ${req.nextUrl.pathname}`, error as Error, { userId: user.userId });
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Wrapper to check specific role ID
 * Usage: return withRole(req, [1, 2], async (user) => { ... }) // Admin or Engineer
 */
export async function withRole(
  req: NextRequest,
  requiredRoles: number | number[],
  handler: (user: JWTPayload) => Promise<NextResponse<any>>
): Promise<NextResponse<any>> {
  const user = await verifyAuth(req);

  if (!user) {
    return unauthorizedResponse('Unauthorized. Please login first.');
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  const hasRole = roles.some(role => user.roleIds.includes(role));

  if (!hasRole) {
    logger.warn(`Role check failed for user ${user.userId}. Required roles: ${roles.join(',')}`);
    return forbiddenResponse('You do not have the required role to access this resource.');
  }

  logger.logRequest(req.method, req.nextUrl.pathname, user.userId);

  try {
    const response = await handler(user);
    logger.logResponse(req.method, req.nextUrl.pathname, response.status, user.userId);
    return response;
  } catch (error) {
    logger.error(`Handler error for ${req.nextUrl.pathname}`, error as Error, { userId: user.userId });
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
