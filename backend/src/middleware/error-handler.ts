import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export class HttpException extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}

export const errorHandler = (
  error: ApiError | HttpException | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = (error instanceof HttpException ? error.status : error.status) || 500;
  const message = error.message || 'Internal Server Error';
  const code = (error instanceof HttpException ? error.code : null) || 'INTERNAL_ERROR';

  logger.error('Error:', {
    status,
    message,
    code,
    path: req.path,
    method: req.method,
    stack: error.stack,
  });

  res.status(status).json({
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  throw new HttpException(404, `Route ${req.method} ${req.path} not found`, 'ROUTE_NOT_FOUND');
};
