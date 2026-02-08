import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpException } from './error-handler';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        roles: string[];
        permissions: string[];
      };
      token?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new HttpException(401, 'Missing authorization header', 'MISSING_AUTH');
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: number;
      email: string;
      roles: string[];
      permissions: string[];
    };

    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpException(401, 'Token expired', 'TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpException(401, 'Invalid token', 'INVALID_TOKEN');
    }
    throw error;
  }
};

export const permissionMiddleware = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new HttpException(401, 'User not authenticated', 'NOT_AUTHENTICATED');
    }

    const hasPermission = requiredPermissions.some((perm) =>
      req.user?.permissions.includes(perm),
    );

    if (!hasPermission) {
      throw new HttpException(
        403,
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
        'INSUFFICIENT_PERMISSIONS',
      );
    }

    next();
  };
};

export const roleMiddleware = (...requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new HttpException(401, 'User not authenticated', 'NOT_AUTHENTICATED');
    }

    const hasRole = requiredRoles.some((role) => req.user?.roles.includes(role));

    if (!hasRole) {
      throw new HttpException(
        403,
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
        'INSUFFICIENT_ROLE',
      );
    }

    next();
  };
};
